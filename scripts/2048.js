import Table from './Table.js'
import {EventTrigger, KeyCode} from './EventTrigger.js'

let {createApp, reactive} = Vue

const g2048 = {
    data() {
        return {
            table: {},
            bestScore: 0
        }
    },
    methods: {
        /**
         * 进入2048
         */
        init() {
            this.initial()
            let size = Number(localStorage.getItem("size"))
            this.table = new Table({size, animDuration: 200})
            this.table.initial()

            this.registerEvent()
        },
        /**
         * 注册事件
         */
        registerEvent() {
            let table = this.table
            let keys = ["Left", "Right", "Up", "Down"]
            let refresh
            keys.forEach(key => {
                let swapCallback = () => {
                    this.table.anim = false
                    refresh && clearTimeout(refresh)
                    this.table.refresh()
                    table.moveAndCombine(key, true)
                    table.allCellAnim()
                    refresh = setTimeout(() => {
                        this.table.anim = false
                        this.table.refresh()
                    }, this.table.animDuration * 2)
                }
                EventTrigger.Keys(key).keydownAny(swapCallback)
                EventTrigger.swaps(key).swapAny(swapCallback)

            })
        },
        /**
         * 初始化2048
         */
        initial() {
            let width = () => document.body.clientWidth
            window.onload = () => this.changeWidth(width())

            window.onresize = () => {
                this.changeWidth(width())
            };

            this.bestScore = localStorage.getItem("best")
        },
        /**
         * 改变棋盘尺寸
         * @param {Number} width 棋盘尺寸
         */
        changeWidth(width) {
            if (width < 768) {
                this.table.width = width * .8
            }
        },
        /**
         * 开始新游戏
         */
        newGame() {
            this.table.newGame()
        },
        /**
         * 撤销当前操作
         */
        rollback() {
            this.table.rollback()
        },
        /**
         * 消除基本块(2和4)
         */
        eliminate() {
            this.table.eliminate()
        },
        /**
         * 重设棋盘大小
         * @param offset
         */
        resize(offset) {
            let size = this.table.size
            size += offset
            console.log(size)
            if (size > 1 && size < 8) {
                this.table.resize(size)
                localStorage.setItem("size", size)
            }

        }
    },

    computed: {
        /**
         * 返回分数信息 包含当前分数和最佳分数
         * @returns {{cur:Number,best:Number}}
         */
        score() {
            let cur = this.table.score
            let best = this.bestScore
            if (cur > best) {
                best = this.bestScore = cur
                localStorage.setItem("best", best)
            }
            return {
                cur, best,
            }
        }
    },
    mounted() {
        this.init()
    }
}
let table = createApp(g2048).mount('#g-2048')

