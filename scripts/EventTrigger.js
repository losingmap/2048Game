const KeyCode = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
}

class EventTrigger {
    static Keys(...args) {
        return new EventTrigger(args)
    }

    constructor(args) {
        let keyCodes = []
        args.forEach(arg => {
            let proto = Object.getPrototypeOf(arg)
            if (proto === String.prototype) {
                let keys = arg.split(" ")
                keys.forEach(key => {
                    key = key.toUpperCase()
                    KeyCode[key] && keyCodes.push(KeyCode[key])
                })
            } else if (proto === Number.prototype) {
                keyCodes.push(arg)
            }
        })
        this.keyCodes = keyCodes
    }

    /**
     * 任意键按下
     * @param {Function} event
     */
    keydownAny(callback) {
        document.addEventListener("keydown", e => {
            let allow = this.keyCodes.some(key => e.keyCode === key)
            if (allow)
                callback()
        })
    }
}

export {EventTrigger, KeyCode}
