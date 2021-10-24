import Cell from './Cell.js'
import ShuffleArray from './ShuffleArray.js'

let {reactive} = Vue

class Table {
    /**
     *
     * @param {Number} size 棋盘尺寸
     * @param {Number} width 棋盘宽度
     */
    constructor({size, width, animDuration, margin}) {
        this.margin = margin ? margin : 10
        this.animDuration = animDuration ? animDuration : 200
        this.size = size ? size : 4
        this.width = width ? width : 400
        this.cellSize = (this.width - 10 * (this.size - 1)) / this.size
        this.fontSize = this.cellSize * .6
        this.cells = []
        this.randomCellList = new ShuffleArray(10)
        this.moveQueue = []
        this.history = []
        this.anim = false
        let moveAllFlag
        this.init()
    }

    /**
     * 初始化棋盘数据
     */
    init() {
        for (let i = 0; i < this.size * this.size; i++) {
            let x = i % this.size
            let y = Math.floor(i / this.size)
            let cell = new Cell(x, y, i)
            this.cells.push(cell)
        }

        this.randomCellList.initial(this.cells)
    }

    /**
     * 初始化游戏数据
     */
    initial() {
        this.generate()
        this.generate()
        this.refresh()
        this.save(false)
    }

    save(store) {
        let values = this.cells.map(cell => cell.value)
        this.history.push(JSON.stringify(values))
        store && localStorage.setItem("history", this.history)
    }

    load() {
        let history = localStorage.getItem("history")
        this.history = JSON.parse(history)
    }

    rollback() {
        this.history.pop()
        let values = JSON.parse(this.history[this.history.length - 1])
        for (let i = 0; i < values.length; i++) {
            let cell = this.cells[i];
            cell.value = values[i]
            cell.left = 0
            cell.top = 0
        }
    }


    refresh() {
        this.moveAll()
    }

    /**
     * 生成一个有值的Cell
     */
    generate() {
        let randomCellList = this.randomCellList

        let cell = randomCellList.get()
        cell.randValue()
    }

    /**
     *
     * @param {Number} i
     */
    tableMargin(i) {
        if (i % this.size === this.size - 1)
            return 0
        return this.margin
    }

    /**
     * 移动采样队列中所有的Cell
     */
    moveAll() {
        let gen = this.moveQueue.length > 0
        let cells = this.cells

        let item
        while ((item = this.moveQueue.shift())) {
            let {cell, value, i} = item
            cell.value = value
            this.moveCell(cell, i, false)
        }

        gen && this.generate()

        this.save(true)
    }

    /**
     * 移动Cell
     * @param {Cell} cell
     * @param {Number} i
     * @param {Boolean} sample 是否为采样移动
     */
    moveCell(cell, i, sample) {
        let randomCellList = this.randomCellList
        let cells = this.cells;

        if (sample) {
            let value = cell.value
            cells[i].value = value
            cell.value = 0
            this.moveQueue.push({
                cell, value, i
            });
            return
        }

        cells[i].value = cell.value
        cell.value = 0
        cell.left = 0
        cell.top = 0
        cell.width = 100
        randomCellList.remove(cells[i]).put(cell)
    }

    allCellAnim() {
        this.anim = true
        let cells = this.cells
        for (let index = 0; index < this.moveQueue.length; index++) {
            let {cell, value, i} = this.moveQueue[index]
            let toCell = cells[i]
            this.cellAnim(cell, toCell, cell.value !== value)
        }
    }

    /**
     * 移动Cell动画
     * @param {Cell} cell
     * @param {Cell} toCell
     */
    cellAnim(cell, toCell, combine) {
        // anim
        let offsetX = toCell.x - cell.x;
        let offsetY = toCell.y - cell.y;
        offsetX *= (this.cellSize + this.margin);
        offsetY *= (this.cellSize + this.margin);
        cell.left = offsetX;
        cell.top = offsetY;
        if (combine) {
            cell.width = 120;
            setTimeout(() => cell.width = 100, this.animDuration / 2)
        }
    }

    moveAndCombine(dir, sample) {
        sample && this.save(false)
        this[`move${dir}`](sample)
        this[`combine${dir}`](sample)
        sample && this.rollback()
    }

    /**
     * 向左移动
     */
    moveLeft(sample) {
        let move = false
        let size = this.size
        let cells = this.cells
        cells.forEach(cell => {
            if (!cell.available)
                return

            let start = cell.y * size
            for (let x = 0; x < cell.x; x++) {
                let i = start + x
                if (cells[i].available)
                    continue
                let
                this.moveCell(cell, i, sample)
                move = true
                break
            }
        })
        return move
    }

    /**
     * 向右移动
     */
    moveRight(sample) {
        let move = false
        let size = this.size
        let cells = this.cells

        for (let i = cells.length - 1; i >= 0; i--) {
            let cell = cells[i]
            if (!cell.available)
                continue

            let start = (cell.y + 1) * size - 1
            for (let x = 0; x < size - cell.x; x++) {
                let i = start - x
                if (cells[i].available)
                    continue
                this.moveCell(cell, i, sample)
                move = true
                break
            }
        }
        return move
    }

    /**
     * 向上移动
     */
    moveUp(sample) {
        let move = false
        let size = this.size
        let cells = this.cells
        cells.forEach(cell => {
            if (!cell.available)
                return

            let start = cell.x
            for (let y = 0; y < cell.y; y++) {
                let i = start + y * size
                if (cells[i].available)
                    continue
                this.moveCell(cell, i, sample)
                move = true
                break
            }
        })
        return move
    }

    /**
     * 向下移动
     */
    moveDown(sample) {
        let move = false
        let size = this.size
        let cells = this.cells

        for (let i = cells.length - 1; i >= 0; i--) {
            let cell = cells[i]
            if (!cell.available)
                continue


            let start = (size - 1) * size + cell.x
            for (let y = 0; y < size - cell.y; y++) {
                let i = start - y * size
                if (cells[i].available)
                    continue
                this.moveCell(cell, i, sample)
                move = true
                break
            }
        }
        return move
    }

    combineLeft(sample) {
        let combine = false
        let cells = this.cells
        cells.forEach(cell => {
            if (!cell.available)
                return

            let i = cell.index
            if (i % this.size !== 0 && cells[i - 1].value === cells[i].value) {
                cell.value *= 2
                this.moveCell(cell, i - 1, sample)
                combine = true
            }
        })
        combine && this.moveLeft(sample)
        return combine
    }

    combineRight(sample) {
        let combine = false
        let cells = this.cells

        for (let index = cells.length - 1; index >= 0; index--) {
            let cell = cells[index]

            if (!cell.available)
                continue

            let i = cell.index
            if (i % this.size !== 3 && cells[i + 1].value === cells[i].value) {
                cell.value *= 2
                this.moveCell(cell, i + 1, sample)
                combine = true
            }
        }

        combine && this.moveRight(sample)
        return combine
    }

    combineUp(sample) {
        let combine = false
        let cells = this.cells
        let size = this.size

        for (let index = this.size; index < cells.length; index++) {
            let cell = cells[index]
            let i = cell.index
            if (!cell.available)
                continue

            if (cells[i - size].value === cells[i].value) {
                cell.value *= 2
                this.moveCell(cell, i - size, sample)
                combine = true
            }

        }

        combine && this.moveUp(sample)
        return combine
    }

    combineDown(sample) {
        let combine = false
        let cells = this.cells
        let size = this.size

        for (let index = cells.length - size - 1; index >= 0; index--) {
            let cell = cells[index]
            if (!cell.available)
                continue

            let i = cell.index
            if (cells[i + size].value === cells[i].value) {
                cell.value *= 2
                this.moveCell(cell, i + size, sample)
                combine = true
            }
        }

        combine && this.moveDown(sample)
        return combine
    }
}

export default Table
