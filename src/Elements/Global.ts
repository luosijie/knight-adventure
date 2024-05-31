import { Mesh } from "three"

type Time = {
    elapsed: number
    delta: number
}

export default class Global {

    private static instance: Global
    
    isDev: boolean

    time: Time

    width: number
    height: number
    pixelRatio: number

    

    navmesh: Mesh
    

    constructor () {
        
        this.time = {
            elapsed: 0, 
            delta: 0
        }

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)


        // this.isDev = checkDev()
        this.navmesh = new Mesh()
        this.isDev = true

    }

    setNavmesh (mesh: Mesh) {
        this.navmesh = mesh
    }

    static getInstance () {
        if (!Global.instance)  Global.instance = new Global()
        return Global.instance
    }

}
