import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { Group, Texture, Vector3 } from 'three'
import Skeleton from './Skeleton'

import Battle from './Battle'

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

        this.count = 3
        this.list = []
       
    }

    add (position: Vector3) {

        if (this.list.length >= this.count) return
        
        const model = SkeletonUtils.clone(this.model)
        const skeleton = new Skeleton(model, this.animations,this.texture)
        skeleton.origin.copy(position)
        // const point = global.pathFinder.query.findRandomPoint().randomPoint
        
        // global.pathFinder.query
        // skeleton.setAgent(position)

        skeleton.init()

        skeleton.on('die', () => {
            setTimeout(() => {
                skeleton.respawn()
            }, 20 * 1000)
        })
        
        this.group.add(skeleton.main)
        this.list.push(skeleton)
    }

    

    update (battle: Battle) {
        // this.findPaths(player)

        this.list.forEach((ske: Skeleton) => {
            ske.update(battle)
        })
    }
}