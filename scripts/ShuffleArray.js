import Cell from './Cell.js'

class ShuffleArray extends Array {
    constructor(strength) {
        super()
        this.index = 0
        this.strength = strength ? strength : 10

    }

    /**
     * 初始化
     * @param {Array} arr
     */
    initial(arr) {
        this.length = 0
        this.push(...arr)
        this.index = arr.length - 1
        this.shuffle()
    }

    /**
     * 进行洗牌
     */
    shuffle() {
        let list = this
        for (let i = 0; i < this.strength; i++) {
            for (let i = 0; i <= this.index; i++) {
                let rand = Math.floor(Math.random() * (list.index - i))
                this.swap(i,rand)
            }
        }
    }

    /**
     * 获取一个随机Cell
     * @returns {null|Cell}
     */
    get() {
        this.shuffle()
        let index = this.index

        if (index < 0)
            return null

        let item = this[index]
        this.index--

        return item
    }

    /**
     * 从随机列表中移除
     * @param {Cell} item
     * @returns {ShuffleArray}
     */
    remove(item) {
        let i = this.indexOf(item)
        if (i > this.index && i <= this.length)
            return this

        let last = this.index
        this.swap(i, last)
        this.index--

        return this
    }

    /**
     * 放置到随机等待列表中
     * @param {Cell} item
     * @returns {ShuffleArray}
     */
    put(item) {
        let i = this.indexOf(item)
        if (i <= this.index && i >= 0)
            return this

        let last = this.index
        this.swap(last + 1, i)
        this.index++

        return this
    }

    swap(i, j) {
        let temp = this[i]
        this[i] = this[j]
        this[j] = temp
    }
}

export default ShuffleArray
