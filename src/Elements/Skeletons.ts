import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { Group, Object3D, Texture, Vector3 } from 'three'
import Skeleton from './Skeleton'
import Player from './Player'
import throttle from '@/libs/throttle'
import Character from './Character'

import Global from './Global'
import Battle from './Battle'
const global = Global.getInstance()

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
       
    }

    add (position: Vector3) {
        const model = SkeletonUtils.clone(this.model)
        const skeleton = new Skeleton(model, this.animations,this.texture)
        skeleton.origin.copy(position)
        // const point = global.pathFinder.query.findRandomPoint().randomPoint
        
        // global.pathFinder.query
        // skeleton.setAgent(position)
        skeleton.setPosition(position.x, position.y, position.z)
        skeleton.setRotation(0, Math.random() * Math.PI * 2, 0)
        
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