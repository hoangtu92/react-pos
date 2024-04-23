const Order = require("../models/orderModel");
const {createCanvas} = require("canvas");
const JsBarcode = require("jsbarcode");
const QRCode = require("qrcode");
const Customer = require("../models/customerModel");
const {XMLParser} = require("fast-xml-parser");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");

/**
 * Add 0 to number below 10
 * @returns {string|string}
 */
Number.prototype.fixZero = function (){
    return this < 10 ? "0" + this.toString() : this.toString();
}
/**
 * Format number
 * @returns {string}
 */
Number.prototype.format = function (){
    // Strip all characters but numerical ones.
    let n = !isFinite(+this) ? 0 : +this,
        prec = !isFinite(+0) ? 0 : Math.abs(0),
        sep = ',',
        dec = '.',
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
/**
 * Get month value (fix zero) of date string
 * @returns {string}
 */
String.prototype.toMonth = function (){
    const d = new Date(this);
    return (d.getMonth() + 1).fixZero();
}
/**
 * Get Republic of china year from date string
 * @returns {number}
 */
String.prototype.toYear = function (){
    const d = new Date(this);
    return d.getFullYear() - 1911;
}

/**
 * Format invoice number
 * @returns {string}
 */
String.prototype.formatInvoice = function (){
    const reg = new RegExp(/([a-zA-Z]+)(\d+)/);
    return this.replace(reg, "$1-$2")
}

/**
 * Encrypt AES of string
 * @param data
 * @returns {string}
 */
function encrypt(data) {

    // Create iv and secret_key
    let iv = crypto.randomBytes(16);
    let secret_key = crypto.createHash("sha256", process.env.JD_SECRET);

    iv = CryptoJS.lib.WordArray.create(iv);
    secret_key = CryptoJS.lib.WordArray.create(secret_key);

    // Encrypt the plaintext using AES/CBC/PKCS5Padding
    const ciphertext = CryptoJS.AES.encrypt(data, secret_key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
    });
    //console.log("cipherText", ciphertext);

    // Print the ciphertext
    return ciphertext.toString()
}

/**
 * Get QR value
 * @reference https://www.einvoice.nat.gov.tw/static/ptl/ein_upload/attachments/1479449792874_0.6(20161115).pdf
 * @param order
 * @returns {Promise<{left: string, right: string}>}
 */
const getQRValue = async (order) => {
    const tw_year = order.invoice.date.toYear();
    const d = new Date(order.invoice.date);

    const orderTotalAmount = order.customTotalAmount > 0 ? order.customTotalAmount : order.totalAmount;

    const tax_free_amount = Math.round( orderTotalAmount * ( 1 - 0.05 ) );

    const str_1 = order.invoice.invno;// 10 code
    const str_2 = `${tw_year}${order.invoice.date.toMonth()}${d.getDate().fixZero()}`; // 7 code
    const str_3 = order.invoice.rdno; // 4 code
    const str_4 = (tax_free_amount.toString(16) + "").padStart(8, "0"); // 8 code Subtotal hex
    const str_5 = (orderTotalAmount.toString(16) + "").padStart(8, "0"); //  8 code Total hex
    const str_6 = typeof order.invoice.buyer_id !== "undefined" && order.invoice.buyer_id.length === 8 ? order.invoice.buyer_id : "00000000"; // 8 code
    const str_7 = 59290455; // 8 code
    const str_8 = encrypt(`${order.invoice.invno}${order.invoice.rdno}`); // 24 code
    const str_9 = "**********"; // 10 code
    const str_10 = order.cartItems.length; // Number of items
    const str_11  = order.cartItems.reduce((t, e) => {
        t += e.quantity;
        return t;
    }, 0); // Total quantity of all items
    const str_12  = "1"; // 1 code Base64
    const str_13 = order.cartItems.reduce((t, e, i) => {
        if(i < 2){
            t.push(e.name.slice(0, 30).replace(":", ""));
            t.push(e.quantity);
            t.push(e.price)
        }
        return t;
    }, []).join(":");

    const qr_textplain =  `${str_1}${str_2}${str_3}${str_4}${str_5}${str_6}${str_7}${str_8}:${str_9}:${str_10}:${str_11}:${str_12}:${str_13}`;

    return {
        left: qr_textplain.slice(0, 108),
        right: "**" + qr_textplain.slice(108, qr_textplain.length)
    }
}

/**
 * @route /api/invoice/view/:order_id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const viewInvoice = async (req, res) => {
    const {order_id} = req.params;


    const order = await Order.findOne({order_id: order_id});

    if(typeof order.invoice == 'undefined'){
        res.status(403).json({
            status: false,
            msg: "No invoice yet"
        });
        return;
    }

    const month_invoice = {
        "01": "01-02",
        "02": "01-02",
        "03": "03-04",
        "04": "03-04",
        "05": "05-06",
        "06": "05-06",
        "07": "07-08",
        "08": "07-08",
        "09": "09-10",
        "10": "09-10",
        "11": "11-12",
        "12": "11-12",
    }
    if(order){

        const barcode = createCanvas();

        const barcode_plain = `${order.invoice.date.toYear()}${order.invoice.date.toMonth()}${order.invoice.invno}${order.invoice.rdno}`;

        JsBarcode(barcode, barcode_plain, {
            width: 1,
            height: 40,
            displayValue: false,
            margin: 0,
            background: "#ffffff"
        });
        const {left, right} = await getQRValue(order);

        const qr_left = await QRCode.toDataURL(left, {margin: 0, errorCorrectionLevel: "L", version: 6});
        const qr_right = await QRCode.toDataURL(right, {margin: 0, errorCorrectionLevel: "L", version: 6});

        const orderTotalAmount = order.customTotalAmount > 0 ? order.customTotalAmount : order.totalAmount;

        res.render("invoice/index", {
            order,
            orderTotalAmount,
            qr_left,
            qr_right,
            barcode,
            month_invoice
        })
    }
    else res.status(403);

}


/**
 * @route /api/invoice/issue
 * @description Issue invoice
 * @reference
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const issueInvoice = async(req, res) => {
    const {order_id} = req.body;

    const order = await Order.findOne({order_id: order_id});
    if(order){

        if(typeof order.invoice !== "undefined" && order.invoice.invno.length > 0){
            res.status(201).json({
                status: true,
                invoice: order.invoice,
                msg: "Invoice printed!"
            });

            return;
        }

        if(order.orderType !== "instore" && order.customTotalAmount === 0){
            res.status(400).json({
                status: false,
                msg: "Missing custom total amount"
            })
            return;
        }

        const customer = Customer.findOne({id: order.customer})

        const joinAmount = order.cartItems.map(item => {
            return item.price
        })
        const joinSubTotal = order.cartItems.map(item => {
            return Math.round(item.price * item.quantity)
        })
        const joinDesc = order.cartItems.map(item => {
            return item.name
        });
        const joinQuantity = order.cartItems.map(item => {
            return item.quantity
        });

        if(order.redeemAmount > 0){
            joinDesc.push("折扣");
            joinQuantity.push("1");
            joinSubTotal.push(-order.redeemAmount);
            joinAmount.push(-order.redeemAmount);
        }
        if(order.discountAmount > 0){
            joinDesc.push("折扣");
            joinQuantity.push("1");
            joinSubTotal.push(-order.discountAmount);
            joinAmount.push(-order.discountAmount);
        }

        const now = new Date(new Date().toLocaleString('en', {timeZone: 'Asia/Taipei'}));

        const invoiceDate = now.getFullYear() + "/" + (now.getMonth() + 1).fixZero() + "/" + now.getDate().fixZero()
        const invoiceTime = now.getHours().fixZero() + ":" + now.getMinutes().fixZero() + ":" + now.getSeconds().fixZero()

        let data = {
            "grvc": "SEI1001690",
            "Verify_key": "B964C2A00B1A7AD301BE4634ACBDB91D",
            "Intype": "07",
            "TaxType": "1",

            "CarrierType": "",
            "CarrierName": "In Store Customer",

            "orderid": order.order_id.toString(),
            "Phone": "0999111222",
            "Email": "justdog.tw@gmail.com",
            "Note1": "Justdog POS",
            "InvoiceDate": invoiceDate,
            "InvoiceTime": invoiceTime,
            "DonateMark": "0",
            "LoveKey": "",
            "Visa_Last4": "",
            "Address": "  ",
            "Description": order.orderType === "instore" ? joinDesc.join("|") : "\u5bf5\u7269\u5546\u54c1\u4e00\u6279",
            "Quantity": order.orderType === "instore" ? joinQuantity.join("|") : "1",
            "UnitPrice": order.orderType === "instore" ? joinAmount.join("|") : order.customTotalAmount.toString(),
            "Amount": order.orderType === "instore" ? joinSubTotal.join("|") : order.customTotalAmount.toString(),
            "AllAmount": order.orderType === "instore" ? Math.round(order.totalAmount).toString() : Math.round(order.customTotalAmount).toString()
        };

        if(customer){
            if(customer.phone != null){
                data["Phone"] = customer.phone;
            }
        }

        if(order.buyer_id != null){
            data["Buyer_id"] = order.buyer_id;
            data["TaxAmount"] = Math.round((parseInt(order.totalAmount)/1.05) * 0.05);
            data["CompanyName"] = "";
            //data["RandomNumber"] = "";
        }
        else if(order.carrier_id!= null){
            data["CarrierType"] = "3J0002";
            data["CarrierID"] =  order.carrier_id;
            data["CarrierID2"] = order.carrier_id;
        }

        let formData = new URLSearchParams();

        for(let key in data){
            formData.append(key, data[key]);
        }


        let result = await fetch(`${process.env.E_INVOICE_URL}`, {
            method: "POST",
            body: formData
        })

        const string = await result.text();

        const parser = new XMLParser();
        let jObj = parser.parse(string);

        if(jObj["SmilePayEinvoice"]["Status"] !== 0){
            res.status(400).json({
                status: false,
                msg: jObj["SmilePayEinvoice"]["Desc"] + "[" + jObj["SmilePayEinvoice"]["Status"] + "]",
                debug: jObj,
                data: data
            })
        }
        else {
            const invoice = {
                date: invoiceDate,
                time: invoiceTime,
                invno: jObj["SmilePayEinvoice"]["InvoiceNumber"],
                rdno: jObj["SmilePayEinvoice"]["RandomNumber"].toString(),
                buyer_id: order.buyer_id ?? 0,
                carrier_id: order.carrier_id,
                type: jObj["SmilePayEinvoice"]["InvoiceType"]
            }
            await Order.updateOne({order_id: order_id}, {invoice: invoice});
            res.status(201).json({
                status: true,
                data: data,
                order: order,
                invoice,
                jObj
            });
        }

    }
    else{
        res.status(400).json({
            status: false,
            msg: "Order not found"
        })
    }


}


module.exports = {viewInvoice, issueInvoice}
