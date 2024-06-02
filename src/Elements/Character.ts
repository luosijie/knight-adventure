import { AnimationAction, AnimationMixer, BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Path, PlaneGeometry, Quaternion, ShaderMaterial, SkinnedMesh, SRGBColorSpace, Texture, Vector3 } from 'three'


import fakeShadowMaterial from '@/materials/fakeShadowMaterial'
import createDefaultMaterial from '@/materials/createDefaultMaterial'

import Global from './Global'
import uuid from '@/libs/uuid'
import createLifebar from '@/utils/createLifebar'
const global = Global.getInstance()

export interface Config {
    scale?: number
    basicLife?: number
    demage?: number
}

interface Next {
    position: Vector3
    quaternion: Quaternion
    dir: Vector3
    dist: number
}

interface Speeds  {
    Forward: number
    Backward: number
    Rotation: number
}

type Action = AnimationAction | null

export type Actions = {
    Attack: Action
    Cheer: Action
    Death: Action
    // Death_Pose: AnimationAction
    Idle: Action
    Running: Action
    Walking: Action
    WalkingBackwards: Action
}

export default class Character {
    id: string

    basicLife: number
    life: number
    demage: number


    liefbar: Mesh

    model: any
    texture: Texture
    animations: any

    main: Object3D
    scale: number
    

    body: Object3D
    animationMixer: AnimationMixer

    currentAction: AnimationAction | null

    actions: Actions

    speeds: Speeds

    walking: boolean

    fakeShadow: Mesh

    collision: Mesh

    path: Array<Vector3>

    target: Vector3 | null
    next: Next | null

    range: number



    constructor (model: any, animations: any,texture: Texture, config: Config = { basicLife: 100 }) {
        this.id = uuid(20)

        this.scale = config.scale || .2
        this.basicLife = config.basicLife || 100
        this.life = config.basicLife || 100
        this.demage = config.demage || 1
        
        this.range = 2
        
        

        this.model = model
        this.animations = animations
        this.texture = texture


        this.main = new Object3D()

        this.actions = {
            Attack: null,
            Cheer: null,
            Death: null,
            // Death_Pose: AnimationAction
            Idle: null,
            Running: null,
            Walking: null,
            WalkingBackwards: null
        }

        this.body = this.createBody()
        this.animationMixer = new AnimationMixer(this.body)

        this.liefbar = createLifebar()
        this.liefbar.position.y = .6

        this.fakeShadow = this.createFakeShadow()

        this.walking = false

        this.speeds = {
            Forward: .01,
            Backward: .01,
            Rotation: .02
        }

        this.currentAction = null

        this.collision = this.createCollision()

        this.path = []

        this.target = null
        this.next = null

        
        
        // this.main.add(this.fakeShadow)
        this.body.scale.set(this.scale, this.scale, this.scale) 
        
        
        this.main.add(this.body)
        this.main.add(this.liefbar)
        // this.main.add(this.collision)

    }



    private createCollision () {
        const geometry = new BoxGeometry(1, 4, 1)
        const material = new MeshBasicMaterial({
            wireframe: true
        })
        return new Mesh(geometry, material)
    }


    private createFakeShadow () {
        const geometry = new PlaneGeometry(3,3)
        const material = fakeShadowMaterial()

        const mesh = new Mesh(geometry, material)
        mesh.position.z = .003

        return mesh
    }



    setAction(action: Action) {
        if (action === null) return
        if (this.currentAction === action) return

        this.cancelCurrentAction()
        this.currentAction = action
        this.currentAction.reset()
        this.currentAction.fadeIn(1)
        this.currentAction.play()
    }

    cancelCurrentAction () {
        if (this.currentAction) {
            this.currentAction.fadeOut(1)
        }
    }

    private createBody () {
        const body = this.model
        
        const texturePlayer: Texture = this.texture
        texturePlayer.flipY = false   
        texturePlayer.colorSpace = SRGBColorSpace
        

        const material = createDefaultMaterial(texturePlayer)


        body.traverse((e:any) => {
            if (e instanceof SkinnedMesh || e instanceof Mesh) {
                e.castShadow = true
                if (e.name === 'Skeleton_Shield') {
                    // e.position.copy(new Vector3())
                    e.scale.copy(new Vector3(1, 1, 1))
                    console.log(e.name, e)
                }
                e.material = material
            }
        })

        return body
    }

    setPath (path: Array<Vector3>) {
        this.path = path

        if (this.path.length) {
            this.setNext(this.path.shift())
        }

        
    }

    setNext (position: Vector3 | null | undefined ) {
        if  (position === null || position === undefined) {
            this.next = null
            this.target = null

            this.setAction(this.actions.Idle)
            return null
        }

        position.y = 0

        const dir = position.clone().sub(this.main.position).normalize()

        const dummy = new Object3D()
        dummy.position.copy(this.main.position)
        dummy.lookAt(position)

        const dist = dummy.position.distanceTo(position)

        const next =  {
            position,
            quaternion: dummy.quaternion,
            dist,
            dir
        }

        this.next = next
        return next
    }

    clearPath () {
        this.next = null
        this.path = []

        this.target = null
    }

    async goTo (target: Vector3) {
        if (this.target) return
        this.target = target

        const res = await global.pathFinder.find(this.getPosition(), target)
        
        
        if (res && res.length) {
            const path = res.map(v => new Vector3(v.x, v.y, v.z))
            this.setPath(path)
        }

    }

    setPosition (x: number, y: number, z: number) {
        this.main.position.set(x, y, z)
    }

    getPosition () {
        return this.main.position
    }

    setRotation (x:number, y: number, z: number) {
        this.main.rotation.x = x
        this.main.rotation.y = y
        this.main.rotation.z = z
    }

    getHurt (value?: number) {
        value = value || 1
        this.life -= value
        if (this.liefbar.material instanceof ShaderMaterial) {
            this.liefbar.material.uniforms.uLife.value = this.life / this.basicLife
        }
    }

    animate () {
    
        this.animationMixer.update(.02)
       
        if (this.next) {
            this.setAction(this.actions.Walking)
            this.next.dist = this.main.position.distanceTo(this.next.position)
      

            if (this.next.dist < this.speeds.Forward) {
                this.main.position.copy(this.next.position)
                this.setNext(this.path.shift())
            } else {
                this.main.position.add(this.next.dir.clone().multiplyScalar(this.speeds.Forward))
                this.main.quaternion.slerp(this.next.quaternion, .06)
            }

        } 


    }
}