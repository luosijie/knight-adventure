import { AmbientLight, ArrowHelper, AxesHelper, Clock, DirectionalLight, Fog, Mesh, PCFSoftShadowMap, Raycaster, Scene, SRGBColorSpace, Vector2, WebGLRenderer } from 'three'
import Stats from 'stats.js'

import Camera from './Camera'

import Player from './Player'
import Global from './Global'
import Controls from './Controls'
import createDefaultMaterial from '@/materials/createDefaultMaterial'

import Skeletons from './Skeletons'
import PathFinder from '../libs/PathFinder'
import Battle from './Battle'
const global = Global.getInstance()

// import Sound from './Sound'

export default class World {
    resources: any

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
   

    navmesh: Mesh
    pathFinder: PathFinder
    // sound: Sound

    light: DirectionalLight
    ambientLight: AmbientLight

    player: Player
    skeletons: Skeletons
    battle: Battle

    points: Array<ArrowHelper>
    


    constructor (canvas: HTMLCanvasElement, resources: any) {
        this.resources = resources

        this.isReady = false
        this.isActive = false

        this.canvas = canvas

        this.clock = new Clock()

        this.stats = new Stats()

        this.renderer = this.createRenderer()
        this.scene = new Scene()

        this.navmesh = new Mesh()
        this.pathFinder = new PathFinder()

        this.controls = new Controls()
        this.raycaster = new Raycaster()

        const modelPlayer = resources['model-knight']
        this.player = new Player(modelPlayer.scene, modelPlayer.animations, resources['texture-kight'])
        

        const modelSkeleton = resources['model-skeleton']
        this.skeletons = new Skeletons(modelSkeleton.scene, modelSkeleton.animations, resources['texture-skeleton'])

        this.battle = new Battle(this.player)

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

        this.scene.add(this.light)
        this.scene.add(this.ambientLight)
        this.scene.add(this.player.main)
        this.scene.add(this.skeletons.group)

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

                this.player.clearPath()
                this.player.goTo(p)

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


        renderer.outputColorSpace = SRGBColorSpace
        return renderer
    }

    // Passed to renderer.setAnimationLoop
    private render () {
        const elapsed = this.clock.getElapsedTime()
        global.update(elapsed)

        this.stats.update()

        this.controls.update()

        this.navmesh && this.player.update(this.navmesh, this.battle)
        this.skeletons.update(this.battle)

        // this.dummy.position.copy(this.player.dummy.position).add(new Vector3(0, 1, 0))
        // this.dummy.applyQuaternion(new Quaternion(0, 0.8697615032757793, 0, 0.4934723167711199))
        // this.dummy.updateMatrix()

        // this.findPath(this.player.main.position, this.skeleton.main.position)

        this.camera.update(this.player, this.controls)
        

        this.renderer.render( this.scene, this.camera.perspective )

    }


    // Build world elements with resources
    build (resources: any) {
        const sceneModel = resources['model-scene'].scene
        const sceneTexture = resources['texture-scene']
        sceneTexture.flipY = false   
        sceneTexture.colorSpace = SRGBColorSpace

        const defaultMaterial = createDefaultMaterial(sceneTexture)
       console.log(sceneModel)
        sceneModel.traverse(async (e: any) => {
            if (e.name.includes('skeleton')) {
                this.skeletons.add(e.position)
            }
            if (e instanceof Mesh) {
                // Set navmesh
                if (e.name === 'Navmesh') {
                    this.navmesh = e
                    global.pathFinder.init(e)
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