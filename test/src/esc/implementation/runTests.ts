
import * as fp from "../../../../pub"
import * as pt from "pareto-test"
import * as pr from "pareto-runtime"


export function runTests(
    testDataDir: string
) {

    pt.runTests(
        {
            callback: ($i) => {
                $i.asyncSubset(
                    {
                        name: "My Test",
                    },
                    {
                        registerListener: ($i) => {
                            const testSet = $i
                            fp.wrapDirectory(
                                {
                                    rootDirectory: testDataDir,
                                },
                                {
                                    callback: ($i) => {
                                        $i.readFile("a file.txt", ($) => {
                                            testSet.testSet.testString({
                                                testName: "readFile",
                                                expected: "foo",
                                                actual: $,
                                            })
                                        })
                                        $i.readDirWithFileTypes(
                                            {

                                                path: "a dir",
                                                idStyle: ["name only", {}],
                                            },
                                            {
                                                callbacks: {

                                                },
                                                onEnd: () => {

                                                }
                                            }
                                        )
                                        $i.getDirectory(
                                            "a recursive dir",
                                            {
                                                callback: ($i) => {
                                                    const files: string[] = []
                                                    $i.readRecursively(
                                                        {
                                                            idStyle: ["relative from root", {}],
                                                            directoriesToExclude: [
                                                                "excludedDir"
                                                            ]
                                                        },
                                                        {
                                                            callbacks: {
                                                                file: ($) => {
                                                                    files.push($.id)
                                                                }
                                                            },
                                                            onEnd: () => {
                                                                testSet.testSet.testString(
                                                                    {
                                                                        testName: "expected files",
                                                                        expected: "[\n\t\"a recursive dir/sub/a file.txt\"\n]",
                                                                        actual: pr.JSONstringify(files),
                                                                    }
                                                                )
                                                            }
                                                        }
                                                    )
                                                }
                                            }
                                        )
                                    },
                                    onError: ($) => {
                                        $i.testSet.assert({
                                            testName: "unexpected Error",
                                            condition: false,
                                        })
                                    },
                                    onEnd: $i.done,
                                }
                            )
                        }

                    }
                )
            },
            log: pr.log,
        }
    )
}
