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

            this.initial()
            this.registerEvent()
        },
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
        initial(){
            let width = document.body.clientWidth
            this.resize(width)
            window.onresize =  () => {
                let width = document.body.clientWidth
                this.resize(width)
            };

            this.bestScore = localStorage.getItem("best")
        },
        resize(width){
            if(width < 768){
                this.table.width = width * .8
            }
        },
        newGame(){
            this.table.newGame()
        },
        rollback(){
            this.table.rollback()
        },
        eliminate(){
            this.table.eliminate()
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

