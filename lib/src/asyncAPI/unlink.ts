
import * as fs from "fs"
import * as api from "pareto-filesystem-api"
//import * as asyncAPI from "pareto-async-api"
import * as pth from "path"


export type TUnlinkError =
| ["no entity", {}]
| ["is directory", {}]
| ["other", {
    readonly "message": string
}]

export function unlink(
    path: api.Path,
    error: (
        err: TUnlinkError,
        path: string,
    ) => void,
): void {
    const joinedPath = pth.join(...path)
    fs.unlink(
        pth.join(...path),
        (err) => {
            if (err !== null) {
                const errCode = err.code
                const errMessage = err.message

                function createError(): TUnlinkError {

                    switch (errCode) {
                        case "ENOENT":
                            return ["no entity", {}]
                        default: {
                            return ["other", { message: errMessage }]
                        }
                    }
                }
                error(createError(), joinedPath)
            }
        }
    )
}