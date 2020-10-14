/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 *
 * @param {number} num The number of bytes.
 */

export function readableBytes(num) {
    const neg = num < 0;

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    if (neg){
        num = -num;
    }

    if (num < 1){
        return `${(neg ? '-' : '')}${num} B'}`;
    }

    const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);

    num = Number((num / Math.pow(1000, exponent)).toFixed(2));

    const unit = units[exponent];

    return `${(neg ? '-' : '')}${num} ${unit}`;
}

export function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("promise timeout"))
        }, ms);
        promise.then(
            (res) => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    })
}

export function buildQueryString(obj) {
    const str = [];
    for (const p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
        }
    return str.join("&");
}

const wsURL = `ws://${process.env.NODE_ENV === 'production' ? window.location.host : '127.0.0.1'}:8088/ws`

let encoderAPIURL = window.location.origin
if (process.env.NODE_ENV !== "production") {
    encoderAPIURL = 'http://dev.localhost:5000'
}
export {encoderAPIURL, wsURL}

