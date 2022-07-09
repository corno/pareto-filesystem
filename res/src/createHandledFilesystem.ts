import * as api from "pareto-filesystem-api"
import * as hfs from "pareto-handledfilesystem-api"
import { directory } from "./asyncAPI/directory"
import { file } from "./asyncAPI/file"
import { unlink } from "./asyncAPI/unlink"
import { writeFile } from "./asyncAPI/writeFile"
import { writeFileAndWait } from "./asyncAPI/writeFileAndWait"

export function createHandledFilesystem(
    onError: ($: api.FileSystemError) => void,
): hfs.IHandledFilesystem {
    return {
        file: (
            path,
            callback,
        ) => {
            return file(
                path,
                callback,
                (err, path) => {
                    onError({
                        path: path,
                        type: ["file read", err],
                    })
                    return null
                }
            )
        },
        optionalFile: (
            path,
            callback,
            notExists,
        ) => {
            return file(
                path,
                callback,
                (err, path) => {
                    if (err[0] === "no entity") {
                        return notExists()
                    } else {
                        onError({
                            type: ["file read", err],
                            path: path,
                        })
                        return null
                    }
                }
            )
        },
        directory: (
            path,
            callback,
        ) => {
            return directory(
                path,
                callback,
                (err, path) => {
                    onError({
                        type: ["directory read", err],
                        path: path
                    })
                    return null
                }
            )

        },
        writeFile: (path, data) => {
            writeFile(
                path,
                data,
                (err, path) => {
                    onError({
                        type: ["file write", err],
                        path: path,
                    })
                }
            )

        },
        writeFileAndWait: (path, data) => {
            return writeFileAndWait(
                path,
                data,
                (err, path) => {
                    //         if (err[0] === "no entity") {
                    //         } else {
                    //         }
                    throw new Error("IMPLEMENT ME")
                }
            )
        },
        unlink: (path) => {
            unlink(
                path,
                (err, path) => {

                }
            )
        }
    }
}
