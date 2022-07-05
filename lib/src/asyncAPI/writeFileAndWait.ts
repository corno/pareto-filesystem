
import * as fs from "fs"
import * as api from "pareto-filesystem-api"
import * as asyncAPI from "pareto-async-api"
import * as pth from "path"


export type TWriteFileError =
    | ["no entity", {}]
    //| ["is directory", {}]
    | ["other", {
        readonly "message": string
    }]

export function writeFileAndWait(
    path: api.Path,
    data: string,
    error: (
        err: TWriteFileError,
    ) => boolean,
): asyncAPI.IAsync<null> {
    return {
        execute: (cb) => {
            fs.writeFile(
                pth.join(...path),
                data,
                {
                    encoding: "utf-8",
                },
                (err) => {
                    if (err !== null) {
                        const errCode = err.code
                        const errMessage = err.message

                        function createError(): TWriteFileError {

                            switch (errCode) {
                                case "ENOENT":
                                    return ["no entity", {}]
                                default: {
                                    return ["other", { message: errMessage }]
                                }
                            }
                        }
                        const mustCall = error(createError())
                        if (mustCall) {
                            cb(null)
                        }
                    } else {
                        cb(null)
                    }
                }
            )
        }
    }
}