/**
 * Format number
 * @returns {string}
 */
export const number_format = function (number){
    // Strip all characters but numerical ones.
    let n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+0) ? 0 : Math.abs(0),
        sep = ',',
        dec = '.',
        s = '',
        toFixedFix = function (n, prec) {
            const k = Math.pow(10, prec);
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
