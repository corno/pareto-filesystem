import * as pr from "pareto-runtime"

import * as fs from "fs"
import * as pth from "path"
import { FSError } from "../../interface/types/FSError"
import { Directory } from "../../interface/interfaces"
import { ReadDirError, DirentType, ReadFileError, WriteFileErrorType } from "../../interface/types"

export function wrapDirectory(
    $: {
        rootDirectory: string
    },
    $i: {
        callback: ($: Directory) => void,
        onError: ($: FSError) => void,
        onEnd: () => void,
    }
): void {
    const rootDir = $.rootDirectory
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
                const idStyle = $.idStyle
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
                                const dirent = $
                                function createID(): string {
                                    switch (idStyle[0]) {
                                        case "absolute":
                                            return pr.cc(idStyle[1], ($) => {
                                                return pth.resolve(pth.join(path, dirent.name))
                                            })
                                        case "name only":
                                            return pr.cc(idStyle[1], ($) => {
                                                return dirent.name
                                            })
                                        case "relative from root":
                                            return pr.cc(idStyle[1], ($) => {
                                                return pth.relative(rootDir, pth.resolve(pth.join(path, dirent.name)))
                                            })
                                        default: return pr.au(idStyle[0])
                                    }
                                }
                                if ($.isBlockDevice()) {
                                    if ($i.callbacks.blockDevice !== undefined) {
                                        $i.callbacks.blockDevice(
                                            {
                                                id: createID(),
                                            },
                                        )
                                    }
                                } else if ($.isCharacterDevice()) {
                                    if ($i.callbacks.characterDevice !== undefined) {
                                        $i.callbacks.characterDevice(
                                            {
                                                id: createID(),
                                            },
                                        )
                                    }
                                } else if ($.isDirectory()) {
                                    if ($i.callbacks.directory !== undefined) {
                                        $i.callbacks.directory(
                                            {
                                                id: createID(),
                                            },
                                            createDirectory(pr.join([path, $.name]))
                                        )
                                    }
                                } else if ($.isFIFO()) {
                                    if ($i.callbacks.fifo !== undefined) {
                                        $i.callbacks.fifo(
                                            {
                                                id: createID(),
                                            },
                                        )
                                    }
                                } else if ($.isFile()) {
                                    if ($i.callbacks.file !== undefined) {
                                        $i.callbacks.file(
                                            {
                                                id: createID(),
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
                                    }
                                } else if ($.isSocket()) {
                                    if ($i.callbacks.socket !== undefined) {
                                        $i.callbacks.socket(
                                            {
                                                id: createID(),
                                            },
                                        )
                                    }
                                } else if ($.isSymbolicLink()) {
                                    if ($i.callbacks.symbolicLink !== undefined) {
                                        $i.callbacks.symbolicLink(
                                            {
                                                id: createID(),
                                            },
                                        )
                                    }
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
        $.rootDirectory
    ))
    wrapup()
}
