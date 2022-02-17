import { ICounter } from "../interface/interfaces/counter"

export function createCounter(
    callback: ($: ICounter) => void,
    onEnd: () => void,
) {
    let counter = 0
    let ended = false
    function wrapup() {
        if (counter === 0) {
            ended = true
            onEnd()
        }
    }
    callback({
        increment: () => {
            if (ended) {
                console.error("async call done after context is ended")
            }
            counter += 1

        },
        decrement: () => {
            counter -= 1
            wrapup()
        },
    })
    wrapup()
}