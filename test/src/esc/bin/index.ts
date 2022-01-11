
import * as pr from "pareto-runtime"
import * as fp from "../../../../pub"
import * as pt from "pareto-test"
import * as rt from "../implementation/runTests"

const [,, testDataDir] = pr.getProcessArguments()

if (testDataDir === undefined) {
    throw new Error("missing testDataDir")
}

rt.runTests(
    testDataDir
)