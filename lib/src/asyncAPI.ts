
import * as pa from "pareto-lang-api"
import * as fs from "fs"
import * as api from "pareto-filesystem-api"
import * as asyncAPI from "pareto-async-api"
import * as pl from "pareto-lang-lib"
import * as pth from "path"
import { createDirNodeData } from "./createDirNodeData"
import { createCounterImp } from "./esc/createCounter"

export function file<T>(
    path: string[],
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    error: (
        err: api.TReadFileError,
    ) => null | asyncAPI.IAsync<T>,
): asyncAPI.IAsync<T> {
    return {
        execute: (cb) => {
            fs.readFile(
                pth.join(... path),
                {
                    encoding: "utf-8",
                },
                (err, data) => {
                    if (err === null) {
                        (callback(data)).execute(cb)
                    } else {
                        const errCode = err.code
                        const errMessage = err.message

                        function createError(): api.TReadFileError {

                            switch (errCode) {
                                case "ENOENT":
                                    return ["no entity", {}]
                                case "EISDIR":
                                    return ["is directory", {}]
                                default: {
                                    return ["other", { message: errMessage}]
                                }
                            }
                        }
                        const result = error(createError())
                        if (result !== null) {
                            result.execute(cb)
                        }
                        
                    }
                }
            )
        },
    }
}

export function directory(
) {
    function directory<T>(
        path: string,
        callback: (
            data: api.DirNodeData,
        ) => null | asyncAPI.IAsync<T>,
        error: (err: api.TReadDirError) => null | asyncAPI.IAsync<pa.IReadonlyDictionary<T>>,
    ): asyncAPI.IAsync<pa.IReadonlyDictionary<T>> {
        return {
            execute: (cb) => {
                fs.readdir(
                    path,
                    {
                        withFileTypes: true,
                    },
                    (err, files) => {
                        if (err !== null) {
                            const errCode = err.code
                            const errMessage = err.message
                            function createError(): api.TReadDirError {
    
                                switch (errCode) {
                                    case "ENOENT":
                                        return ["no entity", {}]
                                    case "ENOTDIR":
                                        return ["is not directory", {}]
                                    default: {
                                        return ["other", { message: errMessage}]
                                    }
                                }
                            }
                            const res = error(createError())
                            if (res !== null) {
                                res.execute(cb)
                            }
                        } else {
                            let values: { [key: string]: T } = {}
                            createCounterImp(
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
                                    cb(pl.createDictionary(values))
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
