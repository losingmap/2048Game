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
        init() {
            this.table = new Table({animDuration: 100})
            this.table.initial()

            this.load()
            this.registerEvent()
        },
        registerEvent() {
            let table = this.table
            let keys = ["Left", "Right", "Up", "Down"]
            let refresh
            keys.forEach(key => {
                EventTrigger.Keys(key).keydownAny(() => {
                    this.table.anim = false
                    refresh && clearTimeout(refresh)
                    this.table.refresh()
                    table.moveAndCombine(key, true)
                    table.allCellAnim()
                    refresh = setTimeout(() => {
                        this.table.anim = false
                        this.table.refresh()
                    }, this.table.animDuration * 2)
                })
            })
        },
        load(){
            this.bestScore = localStorage.getItem("best")
        },
        newGame(){
            this.table.newGame()
        },
        rollback(){
            this.table.rollback()
        }
    },

    computed: {
        score() {
            let cur = this.table.score
            let best = this.bestScore
            if (cur > best) {
                best = this.bestScore = cur
                localStorage.setItem("best",best)
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

