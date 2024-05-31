import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { Group, Texture } from 'three'
import Skeleton from './Skeleton'
import Player from './Player'
import PathFinder from '../libs/PathFinder'
import throttle from '@/libs/throttle'
import Character from './Character'

export default class Skeletons {

    model: any
    animations: any
    texture: Texture

    group: Group
    list: Array<Skeleton>

    count: number

    throttleUpdate: Function


    constructor (model: any, animations: any, texture: Texture) {
        this.model = model
        this.animations = animations
        this.texture = texture

        this.group = new Group()

        this.count = 10
        this.list = []

        this.findPaths = throttle(this.findPaths, 1000)

        this.init()
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            const model = SkeletonUtils.clone(this.model)
            const skeleton = new Skeleton(model, this.animations,this.texture)
            skeleton.setPosition(2 * Math.random(), 0, 2 * Math.random())
            skeleton.setRotation(0, Math.random() * Math.PI * 2, 0)
            
            this.group.add(skeleton.main)
            this.list.push(skeleton)
        }
    }

    

    findPaths (player: Player) {
        this.list.forEach((ske: Skeleton, index: number) => {
            const obstacles: Array<Character> = [player]
            for (let i = 0; i < this.list.length; i++) {
                if (index !== i) {
                    obstacles.push(this.list[i])
                }
            }
            const playPos = player.getPosition()
            const skePos = ske.getPosition()
            if (playPos.distanceTo(skePos) >= 2 * ske.scale) {
                // ske.pathFinder.find(skePos, playPos, obstacles).then(res => {
                    
                //     if (res && res.length) {
                //         ske.setPath(res) 
                //     }
                // })
                ske.goTo(playPos, obstacles)
            } else {
                ske.clearTarget()
                ske.setAction(ske.actions.Attack)
            }

            
        })
    }

    update (player: Player) {
        this.findPaths(player)

        this.list.forEach((ske: Skeleton) => {

            ske.update()
        })
    }
}