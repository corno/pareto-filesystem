
import * as pr from "pareto-runtime"
import * as rt from "../implementation/runTests"


pr.runProgram(
    ($) => {
        if ($.argument === undefined) {
            throw new Error("missing testDataDir")
        }
        rt.runTests(
            $.argument,
        )
    }
)
