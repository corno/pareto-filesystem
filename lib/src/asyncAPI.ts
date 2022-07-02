
import * as fs from "fs"
import * as asyncAPI from "pareto-async-api"
import * as asyncLib from "pareto-async-lib"
import * as pth from "path"
import { DirNodeData } from "./api"


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

export function file<T>(
    path: string[],
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    error: (
        err: null,
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
                        console.error("FIX ERROR DATA")
                        error(null).execute(cb)
                    } else {
                        (callback(data)).execute(cb)
                    }
                }
            )
        },
    }
}

export function directory(
    asyncLib: asyncAPI.API,
) {
    function directory<T>(
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
    
    return directory
}
