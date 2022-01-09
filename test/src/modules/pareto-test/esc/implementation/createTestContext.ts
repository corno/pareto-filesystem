import { TestContext } from "../../interface/interfaces/TestContext";

import * as pt from "pareto-test"

// console.log('\x1b[31m', 'sometext');
// console.log('sometext2' ,'\x1b[0m');
// console.log('sometext3');

export function createTestContext(
): TestContext {
    return {
        testset: (
            testSetName,
            testSetCallback,
        ) => {
            pt.testset(
                testSetName,
                () => {
                    testSetCallback({
                        testSync: (
                            testName,
                            testCallback,
                        ) => {
                            pt.testSync(
                                testName,
                                () => {
                                    testCallback({
                                        assertEqual: (
                                            expected,
                                            actual,
                                        ) => {
                                            pt.assertEqual(expected, actual)
                                        },
                                    })
                                }
                            )
                        },
                    })
                }
            )
        },
    }
}