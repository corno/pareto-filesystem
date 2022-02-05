
import * as pf from "../../../../pub"
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
                            pf.wrapDirectory(
                                {
                                    rootDirectory: testDataDir,
                                },
                                {
                                    callback: ($i) => {

                                        $i.rm(
                                            {
                                                path: "tmp",
                                                recursive: true,
                                            },
                                            {
                                                onNotExists: () => {
                                                    //don't do anything //but the callback should be here
                                                },
                                                onDone: () => {
                                                    $i.mkDir(
                                                        {
                                                            path: "tmp",
                                                            recursive: false,
                                                        },
                                                        {
                                                            onSuccess: () => {

                                                                function testWrite(
                                                                    filePath: string,
                                                                    writeCallback: (
                                                                        $: {
                                                                            fileName: string
                                                                        },
                                                                    ) => void
                                                                ) {
                                                                    $i.getDirectory(
                                                                        "tmp",
                                                                        {
                                                                            callback: ($i) => {
                                                                                $i.readFile(filePath, {
                                                                                    callback: ($) => {
                                                                                        testSet.testSet.assert({
                                                                                            testName: `file should not exist: ${filePath}`,
                                                                                            condition: false
                                                                                        })
                                                                                    },
                                                                                    onNotExists: () => {
                                                                                        writeCallback(
                                                                                            {
                                                                                                fileName: pr.join(["tmp", filePath]),
                                                                                            }
                                                                                        )
                                                                                    },
                                                                                })

                                                                            }
                                                                        }
                                                                    )
                                                                }
                                                                testWrite(
                                                                    "tmp.txt",
                                                                    ($) => {

                                                                        $i.writeFile(
                                                                            {
                                                                                path: $.fileName,
                                                                                data: "FOO",
                                                                                createMissingDirectories: false,
                                                                            },
                                                                            {
                                                                            },
                                                                        )
                                                                    }
                                                                )
                                                                testWrite(
                                                                    "tmp2.txt",
                                                                    ($) => {

                                                                        $i.createWriteStream(
                                                                            {
                                                                                path: $.fileName,
                                                                                createMissingDirectories: false,
                                                                            },
                                                                            {
                                                                                consumer: ($i) => {
                                                                                    $i.onData("FOO")
                                                                                    $i.onEnd(null)
                                                                                },
                                                                            },
                                                                        )
                                                                    }
                                                                )
                                                                testWrite(
                                                                    "dir/tmp2.txt",
                                                                    ($) => {
                                                                        $i.createWriteStream(
                                                                            {
                                                                                path: $.fileName,
                                                                                createMissingDirectories: true,
                                                                            },
                                                                            {
                                                                                consumer: ($i) => {
                                                                                    $i.onData("FOO")
                                                                                    $i.onEnd(null)
                                                                                },
                                                                            },
                                                                        )
                                                                    }
                                                                )

                                                                $i.readFile("a file.txt", {
                                                                    callback: ($) => {
                                                                        testSet.testSet.testString({
                                                                            testName: "readFile",
                                                                            expected: "foo",
                                                                            actual: $,
                                                                        })
                                                                    }
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
                                                            }
                                                        }
                                                    )
                                                }
                                            }
                                        )
                                    },
                                    onError: ($) => {

                                        $i.testSet.assert({
                                            testName: `unexpected error: ${pf.printFSError($)}`,
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
