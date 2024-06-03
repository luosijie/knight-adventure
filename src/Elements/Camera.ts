
import { PerspectiveCamera, Vector3 } from 'three'
import Controls from './Controls'
import Player from './Player'

// Define the relative position of the car
// const cameraPosition = new Vector3(81.8107, -68.4092, 96.8815).normalize()


const OFFSET = {
    TARGET: new Vector3(0, 0, .1),
}

export default class Camera {
    perspective: PerspectiveCamera

    radius: number
    horizontalRadian: number
    verticelRadian: number
    
    constructor (width: number, height: number) {

        this.perspective = this.createCamera(width, height)

        this.radius = 20
        this.horizontalRadian =   0
        this.verticelRadian = Math.PI / 180 * 65
    }

    private createCamera (width: number, height: number) {
        const camera = new PerspectiveCamera( 40, width / height, 0.1, 1000 )
        camera.up.set(0, 1, 0)

        return camera
    }

    updateSize (width:number, height:number) {
        this.perspective.aspect = width / height
        this.perspective.updateProjectionMatrix()
    }


    update (player:Player, controls: Controls) {

        if (controls.pointer.down) {
            const normalizeDelta = controls.getNormalisedPointerDelta()
            this.horizontalRadian -= normalizeDelta.x * 2
            this.verticelRadian -= normalizeDelta.y * 2

            const max = Math.PI / 180 * 80
            const min = Math.PI  / 180 * 30
            if (this.verticelRadian < min) this.verticelRadian = min
            if (this.verticelRadian > max) this.verticelRadian = max

        }

        // this.radius += Math.sign(controls.scroll.delta) * .5
        this.radius += controls.scroll.delta / 100

        if (this.radius > 100) this.radius = 100
        if (this.radius < 5) this.radius = 5


        const sinPhiRadius = Math.cos(this.verticelRadian) * this.radius
        const sphericalPosition = new Vector3(
            sinPhiRadius * Math.sin(this.horizontalRadian),
            sinPhiRadius * Math.cos(this.horizontalRadian),
            this.radius * Math.sin(this.verticelRadian)
        )

        const newPosition = player.main.position.clone().add(sphericalPosition)
        
        // this.perspective.position.lerp(newPosition, .2)
        this.perspective.position.copy(newPosition)

        const target = new Vector3()
        player.main.getWorldPosition(target)
        target.add(OFFSET.TARGET)
        this.perspective.lookAt(target)
    }
}