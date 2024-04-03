import "../invoice.css"

const Invoice = () => {

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

    const get_month_invoice = (order) => {

    }

    const get_year_invoice = (order) => {

    }

    const format_invoiceNo = (order) => {

    }

    const get_barcode_plain = () => {

    }

    const barcode_generator = () => {

    }

    /**
     *
     * @param number
     * @param decimals
     * @param dec_point
     * @param thousands_sep
     * @returns {string}
     */
    function number_format (number, decimals, dec_point, thousands_sep) {
        // Strip all characters but numerical ones.
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        let n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
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

    return <>
        <html lang="en">
        <head>
            <title>Invoice of #{order.order_id}</title>
        </head>
        <body>
        <table className="PaperCSS" style="width: 48mm; border-spacing: 0 2mm;
    border-collapse: separate;margin: 0 auto;">
            <tbody>
            <tr>
                <td align="center">
                    <span className="invoice-header" style="font-size:1.2rem">JUST DOG 寵物選品店</span>
                </td>
            </tr>
            <tr>
                <td align="center"><b><font class="bt invoice-header"
                                            id="InvoiceTitle">電子發票證明聯</font></b></td>
            </tr>
            <tr>
                <td align="center"><b>
                    <font class="bt invoice-header">{get_year_invoice(order.invoice.date)}?>
                        年{month_invoice[ get_month_invoice(order.invoice.date) ]}月</font></b>

                </td>
            </tr>
            <tr>
                <td align="center"><b><font class="bt invoice-header">{format_invoiceNo(order.invoice.invno)}</font></b>
                </td>
            </tr>
            <tr>
                <td className="invoice_item" align="left">
                    <table className="invoice-content" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td colSpan="2">{order.invoice.date}</td>
                        </tr>
                        <tr>
                            <td>隨機碼:{order.invoice.rdno}</td>
                            <td style="text-align: right">總計:{number_format( order.totalAmount ) }</td>
                        </tr>
                        <tr>
                            <td>賣方:59290455</td>
                            {order.invoice.buyer_id ??
                                <td style="text-align: right">買方:{order.invoice.buyer_id}</td>
                            }
                        </tr>

                    </table>

                </td>
            </tr>
            <tr>
                <td align="center">
                    <img style="margin-left: 0; "
                         src={barcode_generator(order)}
                         alt={get_barcode_plain(order)}/>

                </td>

            </tr>

            <tr>
                <td className="invoice_item" style="padding: 0">

                    <table style="width: 100%; border-spacing: 0; border-collapse: collapse">
                        <tr>
                            <td style=""><img className="qrcode"
                                              src={qrLCode(order)}
                                              alt="qr_code1"/></td>
                            <td style="text-align: right; padding: 0"><img className="qrcode"
                                                                           src={qrRCode(order)}
                                                                           alt="qr_code2"/></td>
                        </tr>
                    </table>
                </td>
            </tr>
            {order.invoice.buyer_id ?? <>
                <tr align="center" className="bt">
                    <td>
                        ------------------✂------------------
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <table border="0" width="100%" rules="none" className="PaperCSS">
                            <tbody>
                            <tr className="invoice_item">
                                <td colSpan="3">
                                    <span className="bt invoice-header">銷售明細</span>
                                </td>
                            </tr>
                            <tr className="invoice_item">
                                <td colSpan="3">
                                    品名
                                </td>
                            </tr>
                            <tr className="invoice_item">
                                <td>單價</td>
                                <td>數量</td>
                                <td>金額</td>
                            </tr>
                            <tr>
                                <td colSpan="3">
                                    <hr style="border-style: dashed;border-width: 1px;"/>
                                </td>
                            </tr>
                            {order.cartItems.map(item => <>
                                <tr>
                                    <td colSpan="3">{item.name}</td>
                                </tr>
                                <tr>
                                    <td>{number_format(item.price)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{number_format(item.quantity * item.price)}</td>
                                </tr>
                            </>)}

                            {order.discountAmount + order.redeemAmount > 0 ?? <>
                                <tr>
                                    <td colSpan="3">折扣</td>
                                </tr>
                                <tr>
                                    <td>-{number_format(order.discountAmount + order.redeemAmount)}</td>
                                    <td>1</td>
                                    <td>-{number_format(order.discountAmount + order.redeemAmount)}</td>
                                </tr>
                            </>}
                            <tr>
                                <td colSpan="3">
                                    <hr style="border-style: dashed;border-width: 1px;"/>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3" style="padding: 10px 0">
                                    <table style="border-collapse: collapse;">
                                        <tr>
                                            <td>銷售額(應稅)：</td>
                                            <td>{number_format(Math.round(order.totalAmount / 1.05))}</td>
                                        </tr>
                                        <tr>
                                            <td>稅額：</td>
                                            <td>{number_format(Math.round((order.totalAmount / 1.05) * 0.05))}</td>
                                        </tr>
                                        <tr>
                                            <td>總計：</td>
                                            <td>{number_format(order.totalAmount)}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3">台北市大安區建國南路二段223號1樓</td>
                            </tr>
                            <tr>
                                <td colSpan="3">TEL：02-27010226</td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr align="center" className="bt">
                    <td>
                        ------------------✂------------------
                    </td>
                </tr>
                <tr>
                    <td>
                        <div align="center">
                            <span className="invoice-footer">退換貨憑電子發票證明聯正本辦理</span>
                        </div>

                    </td>
                </tr>
            </>
            }
            </tbody>
        </table>
        </body>
        </html>
    </>
}
