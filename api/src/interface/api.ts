import * as pa from "pareto-lang-api"
import * as asyncAPI from "pareto-async-api"
import { TReadDirError } from "./types/ReadDirError"
import { TReadFileError } from "./types/ReadFileError"
import { TWriteFileError } from "./types/WriteFileError"
import { TUnlinkError } from "./types/UnlinkError"

export type Path = string[]

export type File = <T>(
    path: Path,
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    /**
     * if the error callback returns a null, the execute of the IAsync will never be called
     */
    error: (
        err: TReadFileError,
        path: string,
    ) => null | asyncAPI.IAsync<T>,
) => asyncAPI.IAsync<T>


export type DirNodeData = {
    name: string
    path: string
    type:
    | ["directory", {}]
    | ["file", {}]
    | ["other", {}]
}

export type Directory = <T>(
    path: Path,
    /**
     * if the callback returns a null, the entry is not added to the final collection
     */
    callback: (
        data: DirNodeData,
    ) => null | asyncAPI.IAsync<T>,
    /**
     * if the error callback returns a null, the execute of the IAsync will never be called
     */
    error: (
        err: TReadDirError,
        path: string,
    ) => null | asyncAPI.IAsync<pa.IReadonlyDictionary<T>>,
) => asyncAPI.IAsync<pa.IReadonlyDictionary<T>>

export type WriteFileAndWait = (
    path: Path,
    data: string,
    /**
     * if the error callback returns a false, the execute of the IAsync will never be called
     */
    error: (
        err: TWriteFileError,
        path: string,
    ) => boolean,
) => asyncAPI.IAsync<null>

export type WriteFile = (
    path: Path,
    data: string,
    error: (
        err: TWriteFileError,
        path: string,
    ) => void
) => void

export type Unlink = (
    path: Path,
    error: (
        err: TUnlinkError,
        path: string,
    ) => void
) => void

export type API = {
    file: File,
    directory: Directory
    writeFileAndWait: WriteFileAndWait
    writeFile: WriteFile,
    unlink: Unlink,
}
