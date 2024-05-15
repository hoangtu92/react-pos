const languages = {
    "home": ["Home", "首頁"],
    "orders": ["Orders", "歷史訂單"],
    "sync": ["Sync", "同步"],
    "scan_mode": ["Scan Mode", "掃描模式"],
    "sku": ["SKU", "輸入商品條碼"],
    "cart_no_product": ["There are no products in the cart", "購物車無商品"],
    "no_product_found": ["No products found...", "找不到此商品"],
    "no_customer_found": ["No customers found...", "No customers found..."],
    "items": ["Items", "逐項金額"],
    "total": ["Total", "總金額"],
    "continue": ["Continue", "繼續"],
    "search_placeholder": ["SKU, Title...", "輸入品項、品名...等商品關鍵字"],
    "image": ["Image", "商品圖片"],
    "product": ["Product", "商品名稱"],
    "price": ["Price", "金額"],
    "quantity": ["Quantity", "數量"],
    "subtotal": ["Subtotal", "總金額"],
    "guest_checkout": ["Guest Checkout", "總金額"],
    "store": ["Store", "店面"],
    "ubereat": ["Ubereat", "Ubereat"],
    "shopee": ["Shopee", "蝦皮"],
    "cash": ["Cash", "現金"],
    "credit_card": ["Credit card", "信用卡"],
    "placeholder_carrierid": ["Carrier ID", "載具"],
    "placeholder_buyerid": ["Buyer ID", "統一編號"],
    "order": ["Order", "歷史訂單"],
    "order_id": ["Order Id", "訂單編號"],
    "sold": ["Sold", "銷售商品數量"],
    "payment": ["Payment", "付款方式"],
    "customer": ["Customer", "客人"],
    "pause": ["Pause", "暫停"],
    "start": ["Start", "開始"],
    "resume": ["Resume", "恢復"],
    "reset": ["Reset", "重置"],
    "wipe": ["Wipe", "刪除全部"],
    "login": ["Login", "登入"],
    "register": ["Register", "註冊"],
    "clerk": ["Clerk", "收銀員"],
    "product_sync_tips": ["Set to -1 will sync all products. Otherwise it will only sync products that create/update within specific day", "設定為 -1 將同步所有產品。 否則，它只會同步在特定日期內建立/更新的產品"],
    "product_sync_wipe_tips": ["Wipe all products in the POS. You need to sync product again. (for switching from dev to live environment or vice versa)", "刪除POS中所有產品。您需要再次同步。(用於從開發環境切換到live環境，反之亦然)"],
    "alert_required_tax_id": ["Tax ID is required for B2B Customer", "B2B客戶須輸入統一編號"],
    "alert_required_custom_total": ["Custom total amount is required for Ubereat order", "Ubereat訂單需輸入自訂總金額"],
    "cart_empty_msg": ["Return to the main page and add products to the cart.", "返回主頁並將產品加入購物車"],
    "redeem": ["Redeem", "贖回"],
    "custom": ["Custom Price", "自訂價格"],
    "total_discount": ["Total Discount", "總折扣金額"],
    "checkout_invoice": ["Checkout & Invoice", "結帳"],
    "checkout": ["Checkout", "結帳"],
    "auto_invoice": ["Auto Invoice", "自動印發票"],
    "customer_details": ["Customer details", "顧客資訊"],
    "phone": ["Phone", "電話號碼"],
    "name": ["Name", "顧客姓名"],
    "email": ["Email", "Email"],
    "password": ["Password", "密碼"],
    "go_to_home": ["Go to home page", "回首頁"],
    "redeem_points": ["Redeem Points", "使用狗狗幣"],
    "discount": ["Discount", "折扣"],
    "save_close": ["Save & Close", "儲存並關閉"],
    "custom_order_amount": ["Custom order amount", "自訂訂單金額"],
    "order_amount": ["Order Amount", "訂單金額"],
    "congrats_msg": ["Order Completed!", "訂單完成!"],

    "total_amount": ["Total Amount", "總金額"],
    "received_amount": ["Received Amount", "收到金額"],
    "return": ["Return", "找零"],
    "finish": ["Finish", "完成"],

    "register_success_msg": ['user successfully registered', '帳號註冊成功'],
    "login_success_msg": ['user success login', '帳號成功登入'],
    "user_logged_out_msg": ['User logout','帳號登出'],

    "auto_print_error_msg": ["Sorry. There was an error with automate printing function. Please click print manually.", "自動列印錯誤。請手動點選列印。"],
    "print_success_msg": ['Invoice printed successfully!', '發票列印成功！'],
    "invalid_tax_id_msg": ["Invalid Tax ID", "統一編號錯誤，請再次確認！"],
    "redeem_amount_exceed_total_error": ["Exceed total amount", "折扣超過總金額"],
    "point_too_small_msg": ["Point too small", "Point too small"],
    "carrier_id_validate_success": ["Carrier ID is valid", "載具正確"],
    "carrier_id_validate_failed": ["Carrier ID is invalid", "錯誤！請重新輸入載具！"],

    "customer_sync_success": ['customer successfully synced!', '已完成客戶資料同步!'],
    "customer_sync_failed": ["Error occurred while syncing!", "同步時發生錯誤！我能怎麼辦？跟內部通知說!"],

    "product_not_found_msg": ["Product not found", "無此商品請重新搜尋"],
    "product_sync_success": ["Product syncing is completed!", "產品同步完成！"],
    "product_sync_failed": ["Error occurred while syncing!", "同步時發生錯誤！"],
    "product_wipe_success": ["All products have been removed. Please sync again to have newest product data.", "所有產品均已刪除。 請再次同步以獲得最新的產品資料。"],

    "max_day": ["Max day", "最大日期"],

    "dev_mode_warning_msg": ["POS is running in dev mode.", "POS is running in dev mode." ],
    "order_create_success": ["Order created successfully.", "Order created successfully." ],
    "order_sync_success": ["Order synced successfully.", "訂單同步成功" ],
    "order_sync_failed": ["Order sync failed. Please go to order list and manually sync to justdog", "訂單同步失敗。 請前往訂單清單並手動同步至 justdog" ],

};

export default languages;
