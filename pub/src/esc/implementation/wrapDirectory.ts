import * as pr from "pareto-runtime"

import * as fs from "fs"
import { FSError } from "../../interface/types/FSError"
import { Directory } from "../../interface/interfaces"
import { MkDirErrorType, ReadDirError, UnlinkErrorType, Dirent, DirentType, ReadFileError, WriteFileErrorType } from "../../interface/types"





export function wrapDirectory(
    $: {
        startPath: string
    },
    $i: {
        callback: ($: Directory) => void,
        onError: ($: FSError) => void,
        onEnd: () => void,
    }
): void {
    const onError = $i.onError
    let numberOfOpenAsyncCalls = 0
    function incrementNumberOfOpenAsyncCalls() {
        numberOfOpenAsyncCalls += 1
    }
    function decrementNumberOfOpenAsyncCalls() {
        numberOfOpenAsyncCalls -= 1
        if (numberOfOpenAsyncCalls === 0) {
            $i.onEnd()
        }
    }
    function createDirectory(
        contextPath: string,
    ): Directory {
        function readFile(
            path: string,
            callback: ($: string) => void,
        ): void {
            incrementNumberOfOpenAsyncCalls()

            fs.readFile(
                path,
                { encoding: "utf-8" },
                (err, data) => {
                    if (err === null) {
                        callback(data)

                    } else {
                        const errCode = err.code
                        onError({
                            path: path,
                            error: ["readFile", ((): ReadFileError => {
                                switch (errCode) {
                                    case "ENOENT":
                                        return ["no entity", {}]
                                    case "EISDIR":
                                        return ["is directory", {}]

                                    default: {
                                        console.warn(`unknown error code in readFile: ${err.message}`)
                                        return ["other", { message: err.message }]
                                    }
                                }
                            })()],
                        })
                        decrementNumberOfOpenAsyncCalls()
                    }
                }
            )
        }

        return {
            getDirectory: ($, $i) => {
                $i.callback(createDirectory(pr.join([contextPath, $])))
            },
            mkDir: ($, $i) => {
                const path = pr.join([contextPath, $])
                fs.mkdir(
                    path,
                    { recursive: true },
                    (err) => {
                        if (err !== null) {
                            const errCode = err.code
                            switch (errCode) {
                                case "ENOENT":
                                    onError({
                                        path: path,
                                        error: ["mkdir", ["no entity", {}]],
                                    })
                                    break
                                // case "EISDIR":
                                //     return ["is directory", {}]
                                default: {
                                    console.warn(`unknown error code in mkdir: ${err.message}`)
                                    return ["other", { message: err.message }]
                                }
                            }
                        } else {
                            $i.callback(createDirectory(
                                pr.join([contextPath, $])
                            ))
                        }
                    }
                )
            },
            readDirWithFileTypes: ($, $i) => {
                const path = pr.join([contextPath, $.path])

                incrementNumberOfOpenAsyncCalls()
                function readdirWithFileTypes(
                    path: string,
                    callback: (
                        $:
                            | ["error", {
                                type: ReadDirError
                            }]
                            | ["success", {
                                files: Dirent[]
                            }],
                    ) => void,
                ): void {
                    fs.readdir(
                        path,
                        {
                            withFileTypes: true,
                        },
                        (err, files) => {

                            if (err === null) {
                                callback(["success", {
                                    files: files.map(($) => {
                                        return {
                                            name: $.name,
                                            type: ((): DirentType => {
                                                if ($.isFile()) {
                                                    return ["File", {}]
                                                } else if ($.isDirectory()) {
                                                    return ["Directory", {}]
                                                } else if ($.isBlockDevice()) {
                                                    return ["BlockDevice", {}]
                                                } else if ($.isCharacterDevice()) {
                                                    return ["CharacterDevice", {}]
                                                } else if ($.isFIFO()) {
                                                    return ["FIFO", {}]
                                                } else if ($.isSocket()) {
                                                    return ["Socket", {}]
                                                } else if ($.isSymbolicLink()) {
                                                    return ["Socket", {}]
                                                } else {
                                                    throw new Error(`unexpected Dirent type`)
                                                }
                                            })()
                                        }
                                    }),
                                }])

                            } else {
                                const errCode = err.code
                                callback(["error", {
                                    type: ((): ReadDirError => {
                                        switch (errCode) {
                                            case "ENOENT":
                                                return ["no entity", {}]
                                            case "ENOTDIR":
                                                return ["is not directory", {}]

                                            default: {
                                                console.warn(`unknown error code in readdir: ${err.message}`)
                                                return ["other", { message: err.message }]
                                            }
                                        }
                                    })()
                                }])
                            }
                        }
                    )
                }
                readdirWithFileTypes(
                    path,
                    ($) => {
                        switch ($[0]) {
                            case "error":
                                pr.cc($[1], ($) => {
                                    onError({
                                        path: path,
                                        error: ["readdir", $.type],
                                    })
                                })
                                break
                            case "success":
                                pr.cc($[1], ($) => {
                                    $.files.forEach(($) => {
                                        if ($.type[0] === "Directory") {
                                            $i.onDirectory(
                                                {
                                                    name: $.name,
                                                },
                                                createDirectory(pr.join([path, $.name]))
                                            )
                                        } else if ($.type[0] === "File") {
                                            $i.onFile(
                                                {
                                                    name: $.name,
                                                },
                                                {
                                                    read: ($i) => {
                                                        readFile(
                                                            pr.join([path, $.name]),
                                                            $i,
                                                        )
                                                    }
                                                }
                                            )
                                        } else {
                                            throw new Error("IMPLEMENT ME")
                                        }
                                    })
                                    $i.onEnd()
                                })
                                break
                            default:
                                pr.au($[0])
                        }
                        decrementNumberOfOpenAsyncCalls()
                    },
                )
            },
            readFile: ($, $i) => {
                const path = pr.join([contextPath, $])

                readFile(
                    path,
                    $i
                )
            },
            unlink: (
                $,
                callback,
            ) => {
                const path = pr.join([contextPath, $.path])

                const acceptNonExistence = $.acceptNonExistence
                incrementNumberOfOpenAsyncCalls()

                function unlink(
                    path: string,
                    callback: (
                        $:
                            | ["error", {
                                type: UnlinkErrorType
                            }]
                            | ["success", {
                            }],
                    ) => void,
                ) {
                    fs.unlink(
                        path,
                        (err) => {
                            if (err !== null) {
                                const errCode = err.code
                                callback(["error", {
                                    type: ((): UnlinkErrorType => {
                                        switch (errCode) {
                                            case "ENOENT":
                                                return ["no entity", {}]
                                            // case "EISDIR":
                                            //     return ["is directory", {}]
                                            default: {
                                                console.warn(`unknown error code in unlink: ${err.message}`)
                                                return ["other", { message: err.message }]
                                            }
                                        }
                                    })()
                                }])
                            } else {
                                callback(["success", {}])
                            }

                        }
                    )
                }
                unlink(
                    path,
                    ($) => {
                        switch ($[0]) {
                            case "error":
                                pr.cc($[1], ($) => {
                                    if ($.type[0] !== "no entity" || !acceptNonExistence) {
                                        onError({
                                            path: path,
                                            error: ["unlink", $.type],
                                        })
                                    }
                                })
                                break
                            case "success":
                                pr.cc($[1], ($) => {
                                    callback({})
                                })
                                break
                            default:
                                pr.au($[0])
                        }
                        decrementNumberOfOpenAsyncCalls()
                    },
                )
            },
            writeFile: ($, $i) => {
                const path = pr.join([contextPath, $.filePath])

                incrementNumberOfOpenAsyncCalls()
                function writeFile(
                    path: string,
                    data: string,
                    callback: (
                        $:
                            | ["error", {
                                type: WriteFileErrorType
                            }]
                            | ["success", {
                            }],
                    ) => void,
                ) {
                    fs.writeFile(
                        path,
                        data,
                        (err) => {
                            if (err !== null) {
                                const errCode = err.code
                                callback(["error", {
                                    type: ((): WriteFileErrorType => {
                                        switch (errCode) {
                                            case "ENOENT":
                                                return ["no entity", {}]
                                            // case "EISDIR":
                                            //     return ["is directory", {}]
                                            default: {
                                                console.warn(`unknown error code in writeFile: ${err.message}`)
                                                return ["other", { message: err.message }]
                                            }
                                        }
                                    })()
                                }])
                            } else {
                                callback(["success", {}])
                            }
                        }
                    )
                }
                writeFile(
                    path,
                    $.data,
                    ($) => {
                        switch ($[0]) {
                            case "error":
                                pr.cc($[1], ($) => {
                                    onError({
                                        path: path,
                                        error: ["writeFile", $.type],
                                    })
                                })
                                break
                            case "success":
                                pr.cc($[1], ($) => {
                                    $i({})
                                })
                                break
                            default:
                                pr.au($[0])
                        }
                        decrementNumberOfOpenAsyncCalls()
                    }

                )
            },
        }
    }
    $i.callback(createDirectory(
        $.startPath
    ))

    if (numberOfOpenAsyncCalls === 0) {
        $i.onEnd()
    }
}
