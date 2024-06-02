import { CrowdAgent } from 'recast-navigation'
import {  AnimationClip, Texture, Vector3 } from 'three'
import Battle from './Battle'

import Character from './Character'
import Global from './Global'
const global = Global.getInstance()


export default class Skeleton extends Character {

    origin: Vector3
    agent: CrowdAgent | null

    constructor (model: any,animations: any, texture: Texture) {

        super(model, animations, texture, { scale: .18, basicLife: 20 })

        this.origin = new Vector3()
        this.agent = null

    }

    init () {
        this.setPosition(this.origin.x, this.origin.y, this.origin.z)
        this.setRotation(0, Math.random() * Math.PI * 2, 0)

        this.setActions()
        if (this.currentAction) {
            this.currentAction.play()
        }

    }

    respawn () {
        // this.clearEvents()
        // this.main.visible = false

        this.setPosition(this.origin.x, this.origin.y, this.origin.z)
        this.setRotation(0, Math.random() * Math.PI * 2, 0)

        this.setAction(this.actions.Idle, {fadeIn: 0})



        this.life = this.basicLife
        this.liefbar.visible = true
        this.setLifebar(this.life)

        // this.main.visible = true

        // setTimeout(() => {
        // }, 1000)

        // this.init()

        // this.liefbar.material.uniforms.uLife

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

    clearAgent() {
        if (!global.pathFinder.crowd || !this.agent) return
        global.pathFinder.crowd.removeAgent(this.agent)
        this.agent = null
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

        if (this.life <= 0) {
            this.clearAgent()
            battle.remove(this)
            return
        }

        const player = battle.player
        
        const distToOrigin = this.origin.distanceTo(player.main.position)
        if (distToOrigin < this.range) {
            if (!this.agent) {
                this.setAgent(this.main.position)
            }
        } else {
            if (this.agent) {
                this.clearAgent()
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

        // Move to player
        const target = player.getPosition().clone()
        const dir = target.clone().sub(this.getPosition().clone())
        dir.normalize()
        target.sub(dir.multiplyScalar(.2))
        this.agent.requestMoveTarget(target)
        const position = this.agent.position()
        
        this.main.lookAt(player.getPosition())
        this.setPosition(position.x, 0, position.z)
        // console.log(this.agent)
    }
}