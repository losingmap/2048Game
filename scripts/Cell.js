import Table from './Table.js'

/**
 * 单个块的值
 */
class Cell {
    /**
     * 构造函数
     * @param {Number} x 坐标x
     * @param {Number} y 坐标y
     * @param {Number} i 编号
     * @param {Table} table 棋盘
     */
    constructor(x, y, i, table) {
        this.coordinate = {x, y}
        this.index = i
        this.table = table
        this.fontSize = 0
        this.top = 0
        this.left = 0
        this.value = 0
        this.width = 100
        this.combined = false
    }

    /**
     * 获取Cell的值
     * @returns {Number}
     */
    get value() {
        return this._value
    }

    /**
     * 设置Cell的值
     * @param { Number} value
     */
    set value(value) {
        this._value = value
        let factor = this.fontFactor
        this.fontSize = this.table.cellSize * factor
    }

    /**
     * 获取字体的缩放系数
     * @returns {number}
     */
    get fontFactor() {
        let length = this.value.toString().length
        if (length < 4)
            return .6
        else if (length === 4)
            return .4
        return .3
    }

    /**
     * 当前块是否是有效的(是否有值)
     * @returns {boolean}
     */
    get available() {
        return this.value > 0
    }

    /**
     * 快速获取坐标x
     * @returns {Number}
     */
    get x() {
        return this.coordinate.x
    }

    /**
     * 快速获取坐标y
     * @returns {Number}
     */
    get y() {
        return this.coordinate.y
    }

    /**
     * 获取Cell的背景颜色
     * @returns {string}
     */
    get backGroundColor() {
        switch (this.value) {
            case 2:
                return "#eee4da";
                break;
            case 4:
                return "#ede0c8";
                break;
            case 8:
                return "#f2b179";
                break;
            case 16:
                return "#f59563";
                break;
            case 32:
                return "#f67c5f";
                break;
            case 64:
                return "#f65e3b";
                break;
            case 128:
                return "#edcf72";
                break;
            case 256:
                return "#edcc61";
                break;
            case 512:
                return "#9c0";
                break;
            case 1024:
                return "#33b5e5";
                break;
            case 2048:
                return "#09c";
                break;
            case 4096:
                return "#a6c";
                break;
            case 8192:
                return "#93c";
                break;
            default:
                return "red";
                break;
        }
    }

    /**
     * 获取Cell的字体颜色
     * @returns {string}
     */
    get color() {
        if (this.value <= 4)
            return "#776e65"

        return "white"
    }

    /**
     * 给Cell一个随机基值
     */
    randValue() {
        this.value = Math.random() < .5 ? 2 : 4
    }

    /**
     * 重置Cell的属性
     */
    reset() {
        this.top = 0
        this.left = 0
        this.value = 0
        this.width = 100
        this.combined = false
    }
}

export default Cell
