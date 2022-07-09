
export type ICounter = {
    readonly "increment": () => void
    readonly "decrement": () => void
}


export function createCounterImp(
    callback: ($: ICounter) => void,
    onEnd: () => void
) {

    let counter = 0

    /*
     * we need to keep track of if the registration phase is ended or not.
     * it can happen that the counter reaches 0 during the registration phase, specifically if there is no real async call being made
     * in that case the decrement counter is als called during the registration phase.
     * If that happens there should not yet be a call to onEnd().
     */
    let registrationPhaseEnded = false


    let onEndHasBeenCalled = false
    function wrapup() {
        if (registrationPhaseEnded && counter === 0) {
            if (onEndHasBeenCalled === true) {
                throw new Error("already ended")
            }
            onEndHasBeenCalled = true
            onEnd()
        }
    }
    callback({
        increment: () => {
            if (onEndHasBeenCalled) {
                throw new Error("async call done after context is ready")
            }
            counter += 1

        },
        decrement: () => {
            counter -= 1
            wrapup()
        },
    })
    registrationPhaseEnded = true
    wrapup()
}
