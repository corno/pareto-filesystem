
import * as fp from "../../../../pub"
import * as pt from "pareto-test"


export function runTests(
    testDataDir: string
) {
    let isEnded = false
    process.on("beforeExit", ($) => {
        console.log("before exit")
        if (!isEnded) {
            throw new Error("NOT ENDED")
        }
    })
    fp.wrapDirectory(
        {
            startPath: testDataDir,
        },
        {
            callback: ($i) => {
                $i.readFile("a file.txt", ($) => {
                    if ($ !== "foo") {
                        throw new Error("UNEXPECTED VALUE")
                    }
                })

            },
            onError: ($) => {

            },
            onEnd: () => {
                isEnded = true
            }
        }
    )
}
