
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

    constructor () {
        
        this.time = {
            elapsed: 0, 
            delta: 0
        }

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = window.devicePixelRatio

    }

    static getInstance () {
        if (!Global.instance)  Global.instance = new Global()
        return Global.instance
    }

}
