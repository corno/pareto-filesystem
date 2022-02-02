import * as pr from "pareto-runtime"

import * as fs from "fs"
import * as pth from "path"
import { FSError } from "../../interface/types/FSError"
import { Directory, NodeCallbacks } from "../../interface/interfaces"
import { ReadDirError, ReadFileError, WriteFileErrorType } from "../../interface/types"

type Counter = {
    increment: () => void,
    decrement: () => void,
}

function createCounter(
    callback: ($: Counter) => void,
    onEnd: () => void,
) {
    let counter = 0
    let ended = false
    function wrapup() {
        if (counter === 0) {
            ended = true
            onEnd()
        }
    }
    callback({
        increment: () => {
            if (ended) {
                console.error("async call done after context is ended")
            }
            counter += 1

        },
        decrement: () => {
            counter -= 1
            wrapup()
        },
    })
    wrapup()
}

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
    createCounter(
        (counter) => {

            const rootDir = $.rootDirectory
            const onError = $i.onError
            function createDirectory(
                contextPath: string,
            ): Directory {
                function readFile(
                    path: string,
                    callback: ($: string) => void,
                ): void {
                    counter.increment()
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
                            counter.decrement()
                        }
                    )
                }

                function readDirWithFileTypes(
                    $: {
                        fullPath: string,
                        idStyle:
                        | ["absolute", {}]
                        | ["name only", {}]
                        | ["relative from root", {}]
                    },
                    $i: {
                        callbacks: NodeCallbacks
                        onEnd: () => void
                    }
                ) {

                    const idStyle = $.idStyle
                    const path = $.fullPath

                    counter.increment()
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
                            counter.decrement()
                        }
                    )
                }

                return {
                    getDirectory: ($, $i) => {
                        $i.callback(createDirectory(pr.join([contextPath, $])))
                    },
                    mkDir: ($, $i) => {
                        const path = pr.join([contextPath, $])
                        counter.increment()

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
                                counter.decrement()

                            }
                        )
                    },
                    readRecursively: ($, $i) => {
                        createCounter(
                            (recursiveCounter) => {

                                const d2e = $.directoriesToExclude
                                function recurse(
                                    path: string,
                                ) {
                                    recursiveCounter.increment()
                                    readDirWithFileTypes(
                                        {
                                            fullPath: path,
                                            idStyle: ["name only", {}],
                                        },
                                        {
                                            callbacks: {
                                                directory: ($, $i) => {
                                                    if (d2e === undefined || !d2e.includes($.id)) {
                                                        recurse(
                                                            pth.join(path, $.id)
                                                        )
                                                    }
                                                },
                                            },
                                            onEnd: () => {
                                                readDirWithFileTypes(
                                                    {
                                                        fullPath: path,
                                                        idStyle: $.idStyle,
                                                    },
                                                    {
                                                        callbacks: $i.callbacks,
                                                        onEnd: () => {
                                                            recursiveCounter.decrement()
                                                        }
                                                    },
                                                )
                                            }
                                        },
                                    )
                                }
                                recurse(
                                    contextPath,
                                )
                            },
                            () => {
                                $i.onEnd()
                            },
                        )
                    },
                    readDirWithFileTypes: ($, $i) => {
                        readDirWithFileTypes(
                            {
                                fullPath: pr.join([contextPath, $.path]),
                                idStyle: $.idStyle,
                            },
                            $i,
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
                        counter.increment()
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
                                counter.decrement()

                            }
                        )
                    },
                    writeFile: ($, $i) => {
                        const path = pr.join([contextPath, $.filePath])

                        counter.increment()
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
                                counter.decrement()

                            }
                        )
                    },
                }
            }
            $i.callback(createDirectory(
                $.rootDirectory
            ))
        },
        () => {
            $i.onEnd()
        },
    )
}
