
import * as fs from "fs"
import * as api from "pareto-filesystem-api"
import * as asyncAPI from "pareto-async-api"
import * as pth from "path"

export function file<T>(
    path: string[],
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    error: (
        err: api.TReadFileError,
        path: string
    ) => null | asyncAPI.IAsync<T>,
): asyncAPI.IAsync<T> {
    const joinedPath = pth.join(... path)
    return {
        execute: (cb) => {
            fs.readFile(
                joinedPath,
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
                        const result = error(createError(), joinedPath)
                        if (result !== null) {
                            result.execute(cb)
                        }
                        
                    }
                }
            )
        },
    }
}