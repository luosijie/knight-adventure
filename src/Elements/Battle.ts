

import EventEmitter from '@/libs/EventEmitter'
import Character from './Character'
import Player from './Player'

// Define the relative position of the car
// const cameraPosition = new Vector3(81.8107, -68.4092, 96.8815).normalize()



export default class Battle extends EventEmitter {
    
    player: Player
    target: Character | null
    list: Array<Character>

    interval: any
    
    // change
    constructor (player: Player){
        super()

        this.player = player
        this.target = null
        this.list = []

        this.interval = null


        this.on('change', () => {
            if (this.target) {
                if (!this.interval) {
                    this.interval = setInterval(() => {
                        this.list.forEach(e => {
                            this.player.getHurt(e.demage)
                        })
                        if (this.player.currentAction === this.player.actions.Attack) {
                            this.target && this.target.getHurt(this.player.demage)
                        }
                    }, 500)
                }

            } else {
                window.clearInterval(this.interval)
                this.interval = null
                this.player.setAction(this.player.actions.Idle)
            }
        })
    }

    has (character: Character) {
        const index = this.list.findIndex(e => e.id === character.id)
        if (index < 0) return null
        return {
            index,
            elem: this.list[index]
        }
    }

    add (character: Character) {
        if (this.has(character)) return
        this.list.push(character)

        if (this.target === null) this.target = character

        this.emit('change')
    }

    remove (character: Character) {
        const item = this.has(character)

        if (!item) return

        this.list.splice(item.index, 1)

        if (this.target === character) {
            if (this.getCount() === 0) {
                this.target = null
            } else {
                this.target = this.list[0]
            }
        }
        this.emit('change')
    }

    getCount () {
        return this.list.length
    }

}