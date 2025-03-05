// 判断客户端设备

/**
 * 判断是否为移动端设备
 *
 * @returns {boolean}
 * @author ChiyukiRuon
 * */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi.test(navigator.userAgent);
}

/**
 * 判断屏幕尺寸
 *
 * @returns void
 * @author ChiyukiRuon
 * */
export function checkLayout() {
    if (isMobileDevice()) {
        if (window.innerWidth < 1000) {
            console.log("使用移动端布局")
        } else {
            console.log("使用PC布局")
        }
    } else {
        if (window.innerWidth < 1000) {
            console.log("使用移动端布局")
        } else {
            console.log("使用PC布局")
        }
    }
}