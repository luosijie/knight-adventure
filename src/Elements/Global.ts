import PathFinder from '@/libs/PathFinder'




interface Time {
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

    pathFinder: PathFinder
    

    constructor () {
        
        this.time = {
            elapsed: 0, 
            delta: 0
        }

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)


        // this.isDev = checkDev()

        this.pathFinder = new PathFinder()
        
        this.isDev = true

    }

    update (elapsed: number) {
        this.time.delta = elapsed - this.time.elapsed
        this.time.elapsed = elapsed

        this.pathFinder.crowd?.update(this.time.delta)
    }


    static getInstance () {
        if (!Global.instance)  Global.instance = new Global()
        return Global.instance
    }

}
