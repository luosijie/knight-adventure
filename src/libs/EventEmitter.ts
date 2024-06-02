interface Events {
    [key: string]:Array<Function>
}
export default class EventEmitter {
    events: Events

    constructor () {
        this.events = {}
    }

    on (type: string, event: Function) {
        if (!this.events[type]) {
            this.events[type] = []
        }

        this.events[type].push(event)
    }

    emit (type: string, ...args: any) {
        const fns = this.events[type]
        if (fns && fns.length) {
            fns.forEach(fn => {
                fn.apply(this, args)
            })
        }
    }

    clearEvents () {
        for (const key in this.events) {
            delete(this.events[key])
        }
    }
}