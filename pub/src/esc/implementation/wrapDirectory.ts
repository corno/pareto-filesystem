import * as pr from "pareto-runtime"

import * as fs from "fs"
import * as pth from "path"
import { TFSError } from "../../interface/types/FSError"
import { IDirectory, INodeCallbacks, IReadFile, IWriteFile } from "../../interface/creators"
import { TReadDirError } from "../../interface"
import { createCounter } from "../../modules/counter/esc/createCounter"

export function wrapDirectory(
    $: {
        rootDirectory: string
    },
    $i: {
        callback: ($: IDirectory) => void,
        onError: ($: TFSError) => void,
        onEnd: () => void,
    }
): void {
    createCounter(
        (counter) => {

            const rootDir = $.rootDirectory
            const onError = $i.onError
            function createDirectory(
                contextPath: string,
            ): IDirectory {
                function mkDir(
                    path: string,
                    recursive: boolean,
                    $i: {
                        callback: ($i: IDirectory) => void,
                    }
                ) {
                    counter.increment({})
                    fs.mkdir(
                        path,
                        { recursive: recursive },
                        (err) => {
                            if (err !== null) {
                                const errCode = err.code
                                switch (errCode) {
                                    case "EEXIST":
                                        onError({
                                            path: path,
                                            error: ["mkdir", ["exists", {}]],
                                        })
                                        break
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
                                    pr.join([contextPath, path])
                                ))
                            }
                            counter.decrement({})
                        }
                    )
                }
                function readFile(
                    path: string,
                    $i: IReadFile,
                ): void {
                    counter.increment({})
                    fs.readFile(
                        path,
                        { encoding: "utf-8" },
                        (err, data) => {
                            if (err === null) {
                                $i.callback(data)
                            } else {
                                const errCode = err.code
                                switch (errCode) {
                                    case "ENOENT":
                                        if ($i.onNotExists !== undefined) {
                                            $i.onNotExists()
                                        } else {
                                            onError({
                                                path: path,
                                                error: ["readFile", ["no entity", {}]],
                                            })
                                        }
                                        break
                                    case "EISDIR":
                                        onError({
                                            path: path,
                                            error: ["readFile", ["is directory", {}]],
                                        })
                                        break
                                    default: {
                                        console.warn(`unknown error code in readFile: ${err.message}`)
                                        onError({
                                            path: path,
                                            error: ["readFile", ["other", { message: err.message }]],
                                        })
                                    }
                                }
                            }
                            counter.decrement({})
                        }
                    )
                }
                function writeFile(
                    $: {
                        filePath: string,
                        data: string,
                        createMissingDirectories: boolean,
                    },
                    $i: IWriteFile
                ) {

                    const path = pr.join([contextPath, $.filePath])

                    function wf() {
                        counter.increment({})
                        fs.writeFile(
                            path,
                            $.data,
                            (err) => {
                                if (err !== null) {
                                    const errCode = err.code
                                    switch (errCode) {
                                        case "ENOENT":
                                            onError({
                                                path: path,
                                                error: ["writeFile", ["no entity", {}]],
                                            })
                                            break
                                        default: {
                                            console.warn(`unknown error code in writeFile: ${err.message}`)
                                            onError({
                                                path: path,
                                                error: ["writeFile", ["other", { message: err.message }]],
                                            })
                                        }
                                    }
                                } else {
                                    if ($i.onSuccess !== undefined) {

                                        $i.onSuccess()
                                    }
                                }
                                if ($i.onDone !== undefined) {

                                    $i.onDone()
                                }
                                counter.decrement({})
                            }
                        )
                    }
                    if ($.createMissingDirectories) {
                        mkDir(
                            pth.dirname(path),
                            true,
                            {
                                callback: ($i) => {
                                    wf()
                                }
                            }
                        )
                    } else {
                        wf()
                    }
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
                        callbacks: INodeCallbacks
                        onEnd: () => void
                    }
                ) {

                    const idStyle = $.idStyle
                    const path = $.fullPath

                    counter.increment({})
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
                                    error: ["readdir", ((): TReadDirError => {
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
                            counter.decrement({})
                        }
                    )
                }

                return {
                    createWriteStream: ($, $i) => {
                        let data = ""
                        $i.consumer(
                            {
                                onData: ($) => {
                                    data += $
                                },
                                onEnd: () => {
                                    writeFile(
                                        {
                                            filePath: $.path,
                                            data: data,
                                            createMissingDirectories: $.createMissingDirectories,
                                        },
                                        {
                                            onDone: $i.onDone
                                        }
                                    )
                                }
                            }
                        )
                    },
                    getDirectory: ($, $i) => {
                        $i.callback(createDirectory(pr.join([contextPath, $])))
                    },
                    mkDir: ($, $i) => {
                        const path = pr.join([contextPath, $.path])
                        mkDir(
                            path,
                            $.recursive,
                            {
                                callback: $i.onSuccess
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
                            $i,
                        )
                    },
                    readRecursively: ($, $i) => {
                        createCounter(
                            (recursiveCounter) => {

                                const d2e = $.directoriesToExclude
                                function recurse(
                                    path: string,
                                ) {
                                    recursiveCounter.increment({})
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
                                                            recursiveCounter.decrement({})
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
                    rm: ($, $i) => {
                        const path = pr.join([contextPath, $.path])
                        const nonExistenceHandler = $i.onNotExists
                        counter.increment({})
                        fs.rm(
                            path,

                            { recursive: $.recursive },
                            (err) => {
                                if (err !== null) {
                                    const errCode = err.code
                                    switch (errCode) {
                                        case "ENOENT":
                                            if (nonExistenceHandler !== undefined) {
                                                nonExistenceHandler()
                                            } else {
                                                onError({
                                                    path: path,
                                                    error: ["rmdir", ["no entity", {}]],
                                                })
                                            }
                                            break
                                        case "ENOTEMPTY":
                                            onError({
                                                path: path,
                                                error: ["rmdir", ["not empty", {}]],
                                            })
                                            break
                                        // case "EISDIR":
                                        //     onError({
                                        //         path: path,
                                        //         error: ["unlink", ["is directory", {}]],
                                        //     })
                                        //     break
                                        default: {
                                            console.warn(`unknown error code in rmdir: ${err.message}`)
                                            onError({
                                                path: path,
                                                error: ["rmdir", ["other", { message: err.message }]],
                                            })
                                        }
                                    }
                                } else {
                                    if ($i.onSuccess !== undefined) {
                                        $i.onSuccess()
                                    }
                                }
                                if ($i.onDone !== undefined) {
                                    $i.onDone()
                                }
                                counter.decrement({})
                            }
                        )
                    },
                    unlink: (
                        $,
                        $i,
                    ) => {
                        const path = pr.join([contextPath, $.path])
                        const nonExistenceHandler = $i.onNotExists
                        counter.increment({})
                        fs.unlink(
                            path,
                            (err) => {
                                if (err !== null) {
                                    const errCode = err.code
                                    switch (errCode) {
                                        case "ENOENT":
                                            if (nonExistenceHandler !== undefined) {
                                                nonExistenceHandler()
                                            } else {
                                                onError({
                                                    path: path,
                                                    error: ["unlink", ["no entity", {}]],
                                                })
                                            }
                                            break
                                        case "EISDIR":
                                            onError({
                                                path: path,
                                                error: ["unlink", ["is directory", {}]],
                                            })
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
                                    if ($i.onSuccess !== undefined) {
                                        $i.onSuccess()
                                    }
                                }
                                if ($i.onDone !== undefined) {
                                    $i.onDone()
                                }
                                counter.decrement({})

                            }
                        )
                    },
                    writeFile: ($, $i) => {
                        writeFile(
                            {
                                filePath: $.path,
                                data: $.data,
                                createMissingDirectories: $.createMissingDirectories,
                            },
                            $i,
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
