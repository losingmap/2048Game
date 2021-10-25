import Table from './Table.js'

class Cell {
    /**
     * 构造函数
     * @param {Number} x
     * @param {Number} y
     * @param {Number} i
     * @param {Table} table
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

    get value() {
        return this._value
    }

    set value(value) {
        this._value = value
        let factor = this.fontFactor
        this.fontSize = this.table.cellSize * factor
    }

    get fontFactor() {
        let length = this.value.toString().length
        if (length < 4)
            return .6
        else if(length === 4)
            return .4
        return .3
    }

    get available() {
        return this.value > 0
    }

    get x() {
        return this.coordinate.x
    }

    get y() {
        return this.coordinate.y
    }

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

    get color() {
        if (this.value <= 4)
            return "#776e65"

        return "white"
    }

    randValue() {
        this.value = Math.random() < .5 ? 2 : 4
    }

    initial() {
        this.top = 0
        this.left = 0
        this.value = 0
        this.width = 100
        this.combined = false
    }
}

export default Cell
