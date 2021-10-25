import Cell from './Cell.js'
import ShuffleArray from './ShuffleArray.js'

/**
 * 2048桌面
 */
class Table {
    /**
     *
     * @param {Number} size 棋盘尺寸
     * @param {Number} width 棋盘宽度
     */
    constructor({size, width, animDuration, margin}) {
        this._width = 0
        this.score = 0
        this.margin = margin ? margin : 10
        this.animDuration = animDuration ? animDuration : 200
        this.width = width ? width : 400
        this.size = size ? size : 4
        this.cellSize = (this.width - 10 * (this.size - 1)) / this.size
        this.cells = []
        this.randomCellList = new ShuffleArray(10)
        this.moveQueue = []
        this.history = []
        this.anim = false
        this.init()
    }

    /**
     * 获取桌面宽度
     * @returns {number} 桌面宽度
     */
    get width() {
        return this._width
    }

    /**
     * 设置左面宽度
     * @param {Number} value
     */
    set width(value) {
        this._width = value ? value : 400
        this.cellSize = (this.width - 10 * (this.size - 1)) / this.size
    }

    /**
     * 初始化棋盘数据
     */
    init() {
        this.cells.length = 0
        for (let i = 0; i < this.size * this.size; i++) {
            let x = i % this.size
            let y = Math.floor(i / this.size)
            let cell = new Cell(x, y, i, this)
            this.cells.push(cell)
        }
    }

    /**
     * 初始化游戏数据
     */
    initial() {
        this.randomCellList.initial(this.cells)
        this.score = 0
        this.load()

        if (!this.history || this.history.length <= 0) {
            this.generate()
            this.generate()
            this.refresh()
            this.save(true)
        }
    }

    /**
     * 开始新游戏
     */
    newGame() {
        let cells = this.cells
        for (const cell of cells) {
            cell.reset()
        }
        localStorage.removeItem("history")
        this.initial()
    }

    /**
     * 保存游戏
     * @param store
     */
    save(store) {
        let history = this.history
        let values = this.cells.map(cell => cell.value)
        let score = this.score
        let size = this.size
        history.push(JSON.stringify({values, score, size}))
        store && localStorage.setItem("history", JSON.stringify(history))
    }

    /**
     * 加载游戏
     */
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

    /**
     * 回退记录(悔棋功能)
     */
    rollback() {
        if (this.history.length < 2)
            return
        this.history.pop()
        let {values, score, size} = JSON.parse(this.history[this.history.length - 1])
        this.score = score
        if (values.length !== this.size * this.size)
            this.resize(size)

        for (let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            cell.value = values[i]
            cell.left = 0
            cell.top = 0
            cell.combined = false
            if (values[i] > 0) {
                this.randomCellList.remove(cell)
            } else {
                this.randomCellList.put(cell)
            }
        }
    }

    /**
     * 重设桌面大小
     * @param {Number} size 每一行能放多少个Cell
     */
    resize(size) {
        if (this.size === size)
            return
        this.size = size
        this.cellSize = (this.width - 10 * (this.size - 1)) / this.size
        this.init()
        this.newGame()
    }

    /**
     * 刷新桌面
     */
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

    /**
     * 播放所有Cell的移动动画
     */
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

    /**
     * 移动并合并相同值的Cell
     * @param {String} dir 移动方向
     * @param {Boolean} sample 是否为采样移动
     */
    moveAndCombine(dir, sample) {
        sample && this.save(false)
        this[`move${dir}`](sample)
        let score = this.score
        sample && this.rollback()
        this.score = score
    }

    /**
     * 判断是否可以移动到指定方块处
     * @param {Cell} cell 开始Cell
     * @param {Cell} toCell 抵达Cell
     * @returns {Boolean} 是否可以移动过去
     */
    canMove(cell, toCell) {
        let moveable =
            !toCell.available ||
            toCell.available && !toCell.combined && toCell.value === cell.value
        return moveable && !this.haveObstacle(cell, toCell)
    }

    /**
     * 判断两个Cell之间是否有障碍Cell
     * @param {Cell} cell 开始的Cell
     * @param {Cell} toCell 结束的Cell
     * @returns {Boolean} 是否有障碍物
     */
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

    /**
     * 获取移动方向信息
     * @param cell
     * @param toCell
     * @returns {boolean|{readonly horizontal: boolean, readonly distance: number, x: number, y: number, readonly vertical: boolean, readonly dir: number}|number}
     */
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

    /**
     * 移动Cell并扩大Cell的值
     * @param {Cell} cell
     * @param {Cell} toCell
     */
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

    /**
     * 消除基本块(2和4)
     */
    eliminate() {
        this.cells.forEach(cell => {
            if (cell.value === 2 || cell.value === 4) {
                cell.value = 0
                this.randomCellList.put(cell)
            }
        })
        this.save(true)
    }

}

export default Table
