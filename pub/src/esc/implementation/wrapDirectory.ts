import * as pr from "pareto-runtime"

import * as fs from "fs"
import { FSError } from "../../interface/types/FSError"
import { Directory } from "../../interface/interfaces"
import { ReadDirError, DirentType, ReadFileError, WriteFileErrorType } from "../../interface/types"

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
    let ended = false
    function wrapup() {
        if (numberOfOpenAsyncCalls === 0) {
            ended = true
            $i.onEnd()
        }
    }
    function incrementNumberOfOpenAsyncCalls() {
        if (ended) {
            console.error("async call done after context is ended")
        }
        numberOfOpenAsyncCalls += 1
    }
    function decrementNumberOfOpenAsyncCalls() {
        numberOfOpenAsyncCalls -= 1
        wrapup()
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
                    }
                    decrementNumberOfOpenAsyncCalls()
                }
            )
        }

        return {
            getDirectory: ($, $i) => {
                $i.callback(createDirectory(pr.join([contextPath, $])))
            },
            mkDir: ($, $i) => {
                const path = pr.join([contextPath, $])
                incrementNumberOfOpenAsyncCalls()

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
                        decrementNumberOfOpenAsyncCalls()

                    }
                )
            },
            readDirWithFileTypes: ($, $i) => {
                const path = pr.join([contextPath, $.path])

                incrementNumberOfOpenAsyncCalls()
                fs.readdir(
                    path,
                    {
                        withFileTypes: true,
                    },
                    (err, files) => {
                        if (err === null) {
                            files.forEach(($) => {
                                const type = ((): DirentType => {
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
                                if (type[0] === "Directory") {
                                    $i.onDirectory(
                                        {
                                            name: $.name,
                                        },
                                        createDirectory(pr.join([path, $.name]))
                                    )
                                } else if (type[0] === "File") {
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

                        } else {
                            const errCode = err.code
                            onError({
                                path: path,
                                error: ["readdir", ((): ReadDirError => {
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
                                })()],
                            })
                        }
                        decrementNumberOfOpenAsyncCalls()
                    }
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
                fs.unlink(
                    path,
                    (err) => {
                        if (err !== null) {
                            const errCode = err.code
                            switch (errCode) {
                                case "ENOENT":
                                    if (!acceptNonExistence) {
                                        onError({
                                            path: path,
                                            error: ["unlink", ["no entity", {}]],
                                        })
                                    }
                                    break
                                default: {
                                    console.warn(`unknown error code in unlink: ${err.message}`)
                                    onError({
                                        path: path,
                                        error: ["unlink", ["other", { message: err.message }]],
                                    })
                                }
                            }
                        } else {
                            callback({})
                        }
                        decrementNumberOfOpenAsyncCalls()

                    }
                )
            },
            writeFile: ($, $i) => {
                const path = pr.join([contextPath, $.filePath])

                incrementNumberOfOpenAsyncCalls()
                fs.writeFile(
                    path,
                    $.data,
                    (err) => {
                        if (err !== null) {
                            const errCode = err.code
                            onError({
                                path: path,
                                error: ["writeFile", ((): WriteFileErrorType => {
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
                                })()],
                            })
                        } else {
                            $i({})
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
    wrapup()
}
