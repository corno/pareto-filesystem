
import * as fs from "fs"
import * as asyncAPI from "pareto-async-api"
import * as asyncLib from "pareto-async-lib"
import * as pth from "path"


export type DirNodeData = {
    name: string
    path: string
    type:
    | ["directory", {}]
    | ["file", {}]
    | ["other", {}]
}

export function createDirNodeData(path: string, dirent: fs.Dirent): DirNodeData {
    return {
        name: dirent.name,
        path: `${path}/${dirent.name}`,
        type: dirent.isDirectory()
            ? ["directory", {}]
            : dirent.isFile()
                ? ["file", {}] :
                ["other", {}]
    }
}

export function createLeafFileReader<T>(
    path: string[],
    callback: (
        data: string,
    ) => T,
    error: (
        err: NodeJS.ErrnoException,
    ) => T,
): asyncAPI.IAsync<T> {
    return {
        execute: (cb) => {
            fs.readFile(
                pth.join(... path),
                {
                    encoding: "utf-8",
                },
                (err, data) => {
                    if (err !== null) {
                        cb(error(err))
                    } else {
                        cb(callback(data))
                    }
                }
            )
        },
    }
}

export function createCompositeFileReader<T>(
    path: string[],
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    error: (
        err: NodeJS.ErrnoException,
    ) => asyncAPI.IAsync<T>,
): asyncAPI.IAsync<T> {
    return {
        execute: (cb) => {
            fs.readFile(
                pth.join(... path),
                {
                    encoding: "utf-8",
                },
                (err, data) => {
                    if (err !== null) {
                        error(err).execute(cb)
                    } else {
                        (callback(data)).execute(cb)
                    }
                }
            )
        },
    }
}

export function createLeafDirReader<T>(
    path: string,
    callback: (
        data: DirNodeData,
    ) => null | T,
): asyncAPI.IAsync<asyncAPI.IDictionary<T>> {
    return {
        execute: (cb) => {
            fs.readdir(
                path,
                {
                    withFileTypes: true,
                },
                (err, files) => {
                    if (err !== null) {
                        cb(asyncLib.createDictionary({}))
                    } else {
                        let values: { [key: string]: T } = {}

                        files.forEach(($) => {
                            const res = callback(createDirNodeData(path, $))
                            if (res !== null) {
                                values[$.name] = res
                            }
                        })

                        cb(asyncLib.createDictionary(values))
                    }
                }
            )
        }
    }
}

export function createCompositeDirReader<T>(
    path: string,
    callback: (
        data: DirNodeData,
    ) => null | asyncAPI.IAsync<T>,
): asyncAPI.IAsync<asyncAPI.IDictionary<T>> {
    return {
        execute: (cb) => {
            fs.readdir(
                path,
                {
                    withFileTypes: true,
                },
                (err, files) => {
                    if (err !== null) {
                        cb(asyncLib.createDictionary({}))
                    } else {
                        let values: { [key: string]: T } = {}
                        asyncLib.createCounter(
                            (counter) => {
                                files.forEach(($) => {
                                    const subAsync = callback(createDirNodeData(path, $))
                                    if (subAsync !== null) {
                                        counter.increment()
                                        subAsync.execute(
                                            (x) => {
                                                values[$.name] = x
                                                counter.decrement()
                                            }
                                        )
                                    }
                                })
                            },
                            () => {
                                cb(asyncLib.createDictionary(values))
                            }
                        )
                    }
                }
            )
        }
    }
}
