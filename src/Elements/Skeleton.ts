import { CrowdAgent } from 'recast-navigation'
import {  AnimationClip, CircleGeometry, Mesh, MeshBasicMaterial, Texture, Vector3 } from 'three'
import Battle from './Battle'

import Character from './Character'
import Global from './Global'
import Player from './Player'
const global = Global.getInstance()


export default class Skeleton extends Character {

    origin: Vector3
    agent: CrowdAgent | null

    constructor (model: any,animations: any, texture: Texture) {

        super(model, animations, texture, { scale: .18 })

        this.origin = new Vector3()
        this.agent = null

        this.init()
    }

    private init () {

        this.setActions()
        if (this.currentAction) {
            this.currentAction.play()
        }

        // const circle = new Mesh(
        //     new CircleGeometry(this.range),
        //     new MeshBasicMaterial({ color: '#ff0000' })
        // )
        // circle.position.y = .1
        // circle.rotateX(-Math.PI / 2)
        // this.main.add(circle)
    }

    setAgent (position: Vector3) {
        if (!global.pathFinder.crowd) return
        const agent = global.pathFinder.crowd.addAgent(position, {
            radius: 1 * this.scale,
            height: 4 * this.scale,
            maxAcceleration: 1.0,
            maxSpeed: .5,
            collisionQueryRange: .5,
            pathOptimizationRange: 0.0,
            separationWeight: 3.0,
        })
        this.agent = agent
    }



    private setActions () {
        const animations = this.animations
        const Attack = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Attack'))
        const Cheer = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Cheer'))
        const Death = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Death'))
        const Idle = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Idle'))
        const Running = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Running'))
        const Walking = this.animationMixer.clipAction(animations.find((a: AnimationClip) => a.name === 'Walking'))
        
        this.currentAction = Idle
        
        this.actions.Attack = Attack
        this.actions.Cheer = Cheer
        this.actions.Death = Death
        this.actions.Idle = Idle
        this.actions.Running = Running
        this.actions.Walking = Walking
    }

    update (battle: Battle) {
        
        this.animate()

        const player = battle.player
        
        const distToOrigin = this.origin.distanceTo(player.main.position)
        if (distToOrigin < this.range) {
            if (!this.agent) {
                this.setAgent(this.main.position)
            }
        } else {
            if (this.agent) {
                global.pathFinder.crowd?.removeAgent(this.agent)
                this.agent = null
                this.goTo(this.origin)

                battle.remove(this)
            }
        }

        if (!this.agent) return

        
        const distToPlayer = this.getPosition().distanceTo(player.getPosition())
        if (distToPlayer < .5) {
            this.setAction(this.actions.Attack)
            battle.add(this)
            // this.agent.resetMoveTarget()
        } else {
            this.setAction(this.actions.Walking)
            battle.remove(this)
        }
        this.agent.requestMoveTarget(player.getPosition())
        const position = this.agent.position()
        
        this.main.lookAt(player.getPosition())
        this.setPosition(position.x, 0, position.z)
        // console.log(this.agent)
    }
}