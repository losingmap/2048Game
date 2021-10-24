import Table from './Table.js'
import {EventTrigger, KeyCode} from './EventTrigger.js'

let {createApp, reactive} = Vue

const g2048 = {
    data() {
        return {
            table: {},
            score: {
                cur: 0,
                best: 0,
            }
        }
    },
    methods: {
        init() {
            this.table = new Table({animDuration: 200})
            this.table.initial()

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
                    refresh = setTimeout(() =>{
                        this.table.anim = false
                        this.table.refresh()
                    }, this.table.animDuration * 2)
                })
            })
        }

    },
    mounted() {
        this.init()
    }
}
let table = createApp(g2048).mount('#g-2048')

