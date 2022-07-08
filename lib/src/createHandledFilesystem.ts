import { TReadDirError, TReadFileError, TWriteFileError } from "pareto-filesystem-api"
import * as hfs from "pareto-handledfilesystem-api"
import { directory } from "./asyncAPI/directory"
import { file } from "./asyncAPI/file"
import { unlink } from "./asyncAPI/unlink"
import { writeFile } from "./asyncAPI/writeFile"
import { writeFileAndWait } from "./asyncAPI/writeFileAndWait"


export type Error =
    | ["file read", TReadFileError]
    | ["file write", TWriteFileError]
    | ["directory read", TReadDirError]

export function createHandledFilesystem(
    onError: ($: Error, path: string) => void,
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
                    onError(["file read", err], path)
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
                        onError(["file read", err], path)
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
                    onError(["directory read", err], path)
                    return null
                }
            )

        },
        writeFile: (path, data) => {
            writeFile(
                path,
                data,
                (err, path) => {
                    onError(["file write", err], path)
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
