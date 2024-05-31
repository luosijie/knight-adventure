import { AnimationAction, AnimationMixer, BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Path, PlaneGeometry, Quaternion, SkinnedMesh, SRGBColorSpace, Texture, Vector3 } from 'three'


import fakeShadowMaterial from '@/materials/fakeShadowMaterial'
import createDefaultMaterial from '@/materials/createDefaultMaterial'
import PathFinder from '../libs/PathFinder'

import workerScript from '@/workers/findPath'

import Global from './Global'
import PathWorker from '@/libs/PathWorker'
const global = Global.getInstance()


interface Target {
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

    pathFinder: PathFinder
    path: Array<Vector3>

    target: Target | null

    worker: PathWorker



    constructor (model: any, animations: any,texture: Texture) {
        this.worker = this.createWorker()
        
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

        this.fakeShadow = this.createFakeShadow()

        this.walking = false

        this.speeds = {
            Forward: .015,
            Backward: .01,
            Rotation: .02
        }

        this.currentAction = null

        this.collision = this.createCollision()

        this.pathFinder = new PathFinder()

        this.path = []

        this.target = null

        this.scale = .2

        
        this.main.scale.set(this.scale, this.scale, this.scale)        
        
        this.main.add(this.body)
        this.main.add(this.collision)

        this.main.add(this.pathFinder.helper)



        
        // this.main.add(this.fakeShadow)

    }

    private createWorker () {
        const worker = new PathWorker()
        worker.onmessage = e => {
            console.log(`11`, e)
        }
        return worker
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
            this.setTarget(this.path.shift())
        }

        
    }

    setTarget (position: Vector3 | null | undefined ) {
        if  (position === null || position === undefined) {
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

        const target =  {
            position,
            quaternion: dummy.quaternion,
            dist,
            dir
        }

        this.target = target
        return target
    }

    clearTarget () {
        this.target = null
        this.path = []
    }

    async goTo (target: Vector3, collisions: Array<Character>) {

        
        // const path = await this.pathFinder.find(this.getPosition(), target, collisions)
        
        // if (path && path.length) {
        //     this.setPath(path)
        // }

        // // webworker calculate
        // this.worker.postMessage(
        //     this.getPosition(),
        //     target,
        //     collisions,
        //     global.navmesh
        // )
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

    animate () {
        
    
        this.animationMixer.update(.02)
       
        if (this.target) {
            this.setAction(this.actions.Walking)
            this.target.dist = this.main.position.distanceTo(this.target.position)
      

            if (this.target.dist < this.speeds.Forward) {
                this.main.position.copy(this.target.position)
                this.setTarget(this.path.shift())
            } else {
                this.main.position.add(this.target.dir.clone().multiplyScalar(this.speeds.Forward))
                this.main.quaternion.slerp(this.target.quaternion, .06)
              
            }

        } 


    }
}