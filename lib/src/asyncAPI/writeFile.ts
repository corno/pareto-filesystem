
import * as fs from "fs"
import * as api from "pareto-filesystem-api"
//import * as asyncAPI from "pareto-async-api"
import * as pth from "path"


export function writeFile(
    path: api.Path,
    data: string,
    error: (
        err: api.TWriteFileError,
        path: string,
    ) => void,
): void {
    const joinedPath = pth.join(...path)
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

                function createError(): api.TWriteFileError {

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