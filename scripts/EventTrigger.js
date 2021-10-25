const KeyCode = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}

/**
 * 事件触发器
 */
class EventTrigger {
    static START_SWAP = "START"
    static ON_SWAP = "SWAP"
    static END_SWAP = "END"
    static swapCallback = []
    static keydownTriggers = []
    static swapInfo = {}
    static sensitive = 50

    /**
     * 注册按键
     * @param {String[]|KeyCode[]} args 按键码或按键名称
     * @returns {EventTrigger} 按键触发器
     * @constructor
     */
    static Keys(...args) {
        return new EventTrigger(args)
    }

    /**
     * 注册手机滑动事件
     * @param {String[]} args 滑动方向(LEFT/RIGHT/UP/DOWN)
     * @returns {EventTrigger} 滑动触发器
     */
    static swaps(...args) {
        args = args.map(x => {
            if (Object.getPrototypeOf(x) === String.prototype)
                return 's-' + x
        })
        return new EventTrigger(args)
    }

    /**
     * 创建触发器，请使用keys或swaps进行注册
     * @param {String[]} args
     */
    constructor(args) {
        let keyCodes = []
        let dirs = []
        args.forEach(arg => {
            let proto = Object.getPrototypeOf(arg)
            if (proto === String.prototype) {
                let keys = arg.split(" ")
                keys.forEach(key => {
                    if (key.startsWith("s-")) {
                        dirs.push(key.substring(2))
                    }
                    key = key.toUpperCase()
                    KeyCode[key] && keyCodes.push(KeyCode[key])
                })
            } else if (proto === Number.prototype) {
                keyCodes.push(arg)
            }
        })
        this.keyCodes = keyCodes
        this.dirs = dirs
    }

    /**
     * 准备滑动回调器
     */
    static prepareSwap() {
        let swapCallback = EventTrigger.swapCallback
        if (swapCallback.ready)
            return

        swapCallback.left = []
        swapCallback.right = []
        swapCallback.up = []
        swapCallback.down = []

        let swapInfo = EventTrigger.swapInfo
        document.addEventListener("touchstart", e => {
            swapInfo.status = EventTrigger.START_SWAP
            swapInfo.x = e.touches[0].clientX
            swapInfo.y = e.touches[0].clientY
            return false
        }, {passive: false})
        document.addEventListener("touchmove", e => {
            swapInfo.status = EventTrigger.ON_SWAP
            swapInfo.deltaX = e.touches[0].clientX - swapInfo.x
            swapInfo.deltaY = e.touches[0].clientY - swapInfo.y
            return false
        }, {passive: false})
        document.addEventListener("touchend", e => {
            swapInfo.status = EventTrigger.END_SWAP
            let absX = Math.abs(swapInfo.deltaX)
            let absY = Math.abs(swapInfo.deltaY)
            let horizontal = absX > EventTrigger.sensitive && absX > absY
            let vertical = absY > EventTrigger.sensitive && absY > absX
            let left = swapInfo.deltaX < 0
            let up = swapInfo.deltaY < 0
            if (horizontal) {
                left && swapCallback.left.forEach(callback => {
                    callback()
                })

                !left && swapCallback.right.forEach(callback => {
                    callback()
                })
            } else if (vertical) {
                up && swapCallback.up.forEach(callback => {
                    callback()
                })

                !up && swapCallback.down.forEach(callback => {
                    callback()
                })
            }
            swapInfo.x = swapInfo.y = swapInfo.deltaX = swapInfo.deltaY = 0
            return false
        }, {passive: false})
        swapCallback.ready = true
    }

    /**
     * 准备按键点击回调器
     */
    static prepareKeydown() {
        let keydownTriggers = EventTrigger.keydownTriggers
        if (keydownTriggers.ready)
            return
        document.addEventListener("keydown", e => {
            this.keydownTriggers.forEach(trigger => {
                trigger.keydownEvent(e)
            })
        })
        keydownTriggers.ready = true
    }

    /**
     * 滑动事件
     * @param {Function} callback
     */
    swapAny(callback) {
        EventTrigger.prepareSwap()
        this.dirs.forEach(dir => {
            EventTrigger.swapCallback[dir.toLowerCase()].push(callback)
        })
    }

    /**
     * 按键事件
     * @param {Function} callback
     */
    keydownAny(callback) {
        EventTrigger.prepareKeydown()
        this.keydownEvent = e => {
            let allow = this.keyCodes.some(key => e.keyCode === key)
            if (allow)
                callback()
        }
        EventTrigger.keydownTriggers.push(this)
    }
}

export {EventTrigger, KeyCode}
