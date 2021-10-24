import Cell from './Cell.js'
import ShuffleArray from './ShuffleArray.js'

class Table {
    /**
     *
     * @param {Number} size 棋盘尺寸
     * @param {Number} width 棋盘宽度
     */
    constructor({size, width, animDuration, margin}) {
        this.score = 0
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
        this.score = 0
        this.load()

        if (!this.history || this.history.length <= 0) {
            this.generate()
            this.generate()
            this.refresh()
            this.save(true)
        }
    }

    newGame() {
        let cells = this.cells
        for (const cell of cells) {
            cell.initial()
        }
        localStorage.removeItem("history")
        this.initial()
    }

    save(store) {
        let history = this.history
        let values = this.cells.map(cell => cell.value)
        let score = this.score
        history.push(JSON.stringify({values, score}))
        store && localStorage.setItem("history", JSON.stringify(history))
    }

    load() {
        let history = localStorage.getItem("history")
        history = this.history = JSON.parse(history)
        if (!history) {
            this.history = history = []
            return
        }
        history.push(history[history.length - 1])
        this.rollback()
    }

    rollback() {
        if (this.history.length < 2)
            return
        this.history.pop()
        let {values, score} = JSON.parse(this.history[this.history.length - 1])
        this.score = score

        for (let i = 0; i < values.length; i++) {
            let cell = this.cells[i];
            cell.value = values[i]
            cell.left = 0
            cell.top = 0
            cell.combined = false
            if (values[i] > 0) {
                this.randomCellList.remove(cell)
            }else{
                this.randomCellList.put(cell)
            }
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
        let moved = this.moveQueue.length > 0
        let cells = this.cells

        let item
        while ((item = this.moveQueue.shift())) {
            let {cell, value, i} = item
            cell.value = value
            this.moveCell(cell, i, false)
        }

        if (moved) {
            this.generate()
            this.save(true)
        }

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
        let toCell = cells[i];

        if (sample) {
            let value = cell.value
            toCell.value = value
            cell.value = 0
            this.moveQueue.push({
                cell, value, i
            });
            return
        }

        toCell.value = cell.value
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
        let score = this.score
        sample && this.rollback()
        this.score = score
    }

    canMove(cell, toCell) {
        let moveable =
            !toCell.available ||
            toCell.available && !toCell.combined && toCell.value === cell.value
        return moveable && !this.haveObstacle(cell, toCell)
    }

    haveObstacle(cell, toCell) {
        let dir = this.moveDir(cell, toCell)
        if (dir.horizontal) {
            let sign = dir.dir
            let start = cell.index + sign
            let distance = dir.distance - 1
            for (let i = 0; Math.abs(i) < distance; i += sign) {
                if (this.cells[start + i].available)
                    return true
            }
        } else if (dir.vertical) {
            let sign = dir.dir
            let start = cell.index + sign * this.size
            let distance = dir.distance - 1
            for (let i = 0; Math.abs(i) < distance; i += sign) {
                if (this.cells[start + i * this.size].available)
                    return true
            }
        }

        return false

    }

    moveDir(cell, toCell) {
        let x, y
        x = toCell.x - cell.x
        y = toCell.y - cell.y
        return {
            x, y, get horizontal() {
                return Math.abs(this.x) > 0
            }, get vertical() {
                return Math.abs(this.y) > 0
            }, get distance() {
                return this.horizontal ? Math.abs(this.x) : Math.abs(this.y)
            }, get dir() {
                return this.horizontal ? Math.sign(this.x) : Math.sign(this.y)
            }
        }
    }

    increaseCell(cell, toCell) {
        if (cell.value === toCell.value) {
            this.score += cell.value
            cell.value *= 2
            toCell.combined = true
        }
    }

    /**
     * 向左移动
     */
    moveLeft(sample) {
        let size = this.size
        let cells = this.cells
        cells.forEach(cell => {
            if (!cell.available)
                return

            let start = cell.y * size
            for (let x = 0; x < cell.x; x++) {
                let i = start + x
                let toCell = cells[i];
                if (!this.canMove(cell, toCell))
                    continue
                this.increaseCell(cell, toCell)
                this.moveCell(cell, i, sample)

                break
            }
        })
    }

    /**
     * 向右移动
     */
    moveRight(sample) {
        let size = this.size
        let cells = this.cells

        for (let i = cells.length - 1; i >= 0; i--) {
            let cell = cells[i]
            if (!cell.available)
                continue

            let start = (cell.y + 1) * size - 1
            for (let x = 0; x < size - cell.x - 1; x++) {
                let i = start - x
                let toCell = cells[i];
                if (!this.canMove(cell, toCell))
                    continue
                this.increaseCell(cell, toCell)
                this.moveCell(cell, i, sample)
                break
            }
        }
    }

    /**
     * 向上移动
     */
    moveUp(sample) {
        let size = this.size
        let cells = this.cells
        cells.forEach(cell => {
            if (!cell.available)
                return

            let start = cell.x
            for (let y = 0; y < cell.y; y++) {
                let i = start + y * size
                let toCell = cells[i];
                if (!this.canMove(cell, toCell))
                    continue
                this.increaseCell(cell, toCell)
                this.moveCell(cell, i, sample)
                break
            }
        })
    }

    /**
     * 向下移动
     */
    moveDown(sample) {
        let size = this.size
        let cells = this.cells

        for (let i = cells.length - size - 1; i >= 0; i--) {
            let cell = cells[i]
            if (!cell.available)
                continue


            let start = (size - 1) * size + cell.x
            for (let y = 0; y < size - cell.y - 1; y++) {
                let i = start - y * size
                let toCell = cells[i];
                if (!this.canMove(cell, toCell))
                    continue
                this.increaseCell(cell, toCell)
                this.moveCell(cell, i, sample)
                break
            }
        }
    }

}

export default Table
