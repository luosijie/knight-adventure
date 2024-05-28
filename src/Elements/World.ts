import { AmbientLight, ArrowHelper, AxesHelper, Clock, DirectionalLight, Fog, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PCFSoftShadowMap, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer } from 'three'
import Stats from 'stats.js'

import Camera from './Camera'

import Player from './Player'
import Skeleton from './Skeleton'

import Global from './Global'
import Controls from './Controls'
import createDefaultMaterial from '@/materials/createDefaultMaterial'
import { Pathfinding, PathfindingHelper } from 'three-pathfinding'
const global = Global.getInstance()

// import Sound from './Sound'

export default class World {
    isReady: boolean
    isActive: boolean

    width: number
    height: number

    clock: Clock

   
    canvas: HTMLCanvasElement
    renderer: WebGLRenderer
    scene: Scene

    controls: Controls
    raycaster: Raycaster

    camera: Camera

    stats: Stats

    fog: Fog
   
    pathfinding: Pathfinding
    pathfindingHelper: PathfindingHelper
    navmesh: Mesh
    // sound: Sound

    light: DirectionalLight
    ambientLight: AmbientLight

    player: Player
    skeleton: Skeleton

    points: Array<ArrowHelper>

    constructor (canvas: HTMLCanvasElement, resources: any) {

        this.isReady = false
        this.isActive = false

        this.canvas = canvas

        this.clock = new Clock()

        this.stats = new Stats()

        this.renderer = this.createRenderer()
        this.scene = new Scene()

        this.navmesh = new Mesh()
        this.pathfinding = new Pathfinding()
        this.pathfindingHelper = new PathfindingHelper()
        this.controls = new Controls()
        this.raycaster = new Raycaster()

        this.player = new Player(resources['model-knight'], resources['texture-kight'])
        this.skeleton = new Skeleton(resources['model-skeleton'], resources['texture-skeleton'])
        
        this.camera = new Camera(global.width, global.height)

        this.light = this.createLight()

        this.ambientLight = new AmbientLight('#ffffff', 2.5)

        
        this.build(resources)
        this.init()
        
    }


    private createLight () {
        const light = new DirectionalLight('#ffffff', 1.)
        light.position.set(1, 3, -1)
        light.castShadow = true
        light.shadow.mapSize.width = 512
        light.shadow.mapSize.height = 512
        light.shadow.autoUpdate = true
        light.shadow.camera.near = .1
        light.shadow.camera.far = 5000

        return light
    }

    private init () { 
        this.stats.showPanel(0)
        document.body.appendChild(this.stats.dom)

        this.player.main.position.x = -1
        this.skeleton.main.position.x = 2

        this.scene.add(this.pathfindingHelper)

        this.scene.add(this.light)
        this.scene.add(this.ambientLight)
        this.scene.add(this.player.main)
        this.scene.add(this.skeleton.main)

        this.initControls()

        if (global.isDev) {
            const axesHelper = new AxesHelper(50)
            this.scene.add(axesHelper)
        }
    }

    private initControls() {
        // Contex Menu
        window.addEventListener('contextmenu', (evt:MouseEvent) => {
            evt.preventDefault()
            const pointer = new Vector2(
                (evt.clientX / global.width) * 2 - 1,
                1 - (evt.clientY / global.height) * 2
            )
            this.raycaster.setFromCamera(pointer, this.camera.perspective)
            
            const intersets = this.raycaster.intersectObject(this.navmesh)
          
            if (intersets && intersets.length) {

                const p = intersets[0].point
                const path = this.findPath(this.player.main.position, p)
                console.log('path', path)


            }
            // console.log(evt)
        })
    }


    private createRenderer () {
        const renderer = new WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,  
            alpha: true 
        })
        renderer.setSize( global.width, global.height)
        renderer.setAnimationLoop( this.render.bind(this) )
        renderer.setPixelRatio(global.pixelRatio)
        renderer.outputColorSpace = SRGBColorSpace

        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = PCFSoftShadowMap
        // renderer.out

        // renderer.outputEncoding = sRGBEncoding
        return renderer
    }

    // Passed to renderer.setAnimationLoop
    private render () {
        // const delta = this.clock.getDelta()
        this.stats.update()

        const elapsedTime = this.clock.getElapsedTime()


        this.controls.update()

        this.navmesh && this.player.update(this.navmesh)
        this.skeleton.update()

        // this.findPath(this.player.main.position, this.skeleton.main.position)

        this.camera.update(this.player, this.controls)
        

        this.renderer.render( this.scene, this.camera.perspective )

    }

    findPath (a: Vector3, b: Vector3) {
        if (!this.navmesh) return


        const ZONE = 'level'
        this.pathfinding.setZoneData(ZONE, Pathfinding.createZone(this.navmesh.geometry))
        
        const groupId = this.pathfinding.getGroup(ZONE, a)
        const groupIdB = this.pathfinding.getGroup(ZONE, b)
        const clostA = this.pathfinding.getClosestNode(a, ZONE, groupId)
        const clostB = this.pathfinding.getClosestNode(b, ZONE, groupId)

        console.log(groupId, groupIdB)

        const path = this.pathfinding.findPath(a, b, ZONE, groupId)
        

        this.pathfindingHelper.reset()
        this.pathfindingHelper.setPlayerPosition(a)
        this.pathfindingHelper.setTargetPosition(b)
        this.pathfindingHelper.setPath(path)

        return path
    }

    // Build world elements with resources
    build (resources: any) {
        const sceneModel = resources['model-scene'].scene
        const sceneTexture = resources['texture-scene']
        sceneTexture.flipY = false   
        sceneTexture.colorSpace = SRGBColorSpace

        const defaultMaterial = createDefaultMaterial(sceneTexture)
       
        sceneModel.traverse((e: any) => {
            if (e instanceof Mesh) {
                // Set navmesh
                if (e.name === 'Navmesh') {
                    this.navmesh = e
                    // this.navmesh.position.z = 0.1

                }

                e.castShadow = true

                if (e.name === 'ground' || e.name.includes('rock')) {
                    e.receiveShadow = true
                }

                e.material = defaultMaterial
            }
        })

        this.scene.add(sceneModel)
    }


    // Update canvas size when window resizing
    updateSize () {

        // update camera        
        this.camera.updateSize(global.width, global.height)
        
        // update renderer
        this.renderer.setSize(global.width, global.height)
        
    }
    
}