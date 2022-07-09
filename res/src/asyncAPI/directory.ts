
import * as pa from "pareto-lang-api"
import * as fs from "fs"
import * as pth from "path"
import * as api from "pareto-filesystem-api"
import * as asyncAPI from "pareto-async-api"
import * as pl from "pareto-lang-lib"
import { createDirNodeData } from "../createDirNodeData"
import { createCounterImp } from "../esc/createCounter"

export function directory<T>(
    path: api.Path,
    callback: (
        data: api.DirNodeData,
    ) => null | asyncAPI.IAsync<T>,
    error: (
        err: api.TReadDirError,
        path: string,
        ) => null | asyncAPI.IAsync<pa.IReadonlyDictionary<T>>,
): asyncAPI.IAsync<pa.IReadonlyDictionary<T>> {
    const joinedPath = pth.join(...path)
    return {
        execute: (cb) => {
            fs.readdir(
                joinedPath,
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
                                    return ["other", { message: errMessage }]
                                }
                            }
                        }
                        const res = error(createError(), joinedPath)
                        if (res !== null) {
                            res.execute(cb)
                        }
                    } else {
                        let values: { [key: string]: T } = {}
                        createCounterImp(
                            (counter) => {
                                files.forEach(($) => {
                                    const subAsync = callback(createDirNodeData(joinedPath, $))
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