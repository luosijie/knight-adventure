import checkDev from "@/utils/checkDev"
import { Mesh, Raycaster } from "three"

type Time = {
    elapsed: number
    delta: number
}

export default class Global {

    private static instance: Global

    time: Time

    width: number
    height: number
    pixelRatio: number

    raycaster: Raycaster
    

    

    isDev: boolean

    constructor () {
        
        this.time = {
            elapsed: 0, 
            delta: 0
        }



        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)


        // this.isDev = checkDev()
        this.isDev = true

    }

    static getInstance () {
        if (!Global.instance)  Global.instance = new Global()
        return Global.instance
    }

}
