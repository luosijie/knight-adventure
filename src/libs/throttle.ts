export default function(fn: Function, delay: number) {
    let flag = true

    return function (this:any) {
        if (!flag) return
        flag = false
        fn.apply(this, arguments)
        setTimeout(() => {
            flag = true
        }, delay)
    }
}