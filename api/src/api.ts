import * as pa from "pareto-api-core"
import * as hfs from "pareto-handledfilesystem-api"
import { TReadDirError } from "./interface/types/ReadDirError"
import { TReadFileError } from "./interface/types/ReadFileError"
import { TWriteFileError } from "./interface/types/WriteFileError"
import { TUnlinkError } from "./interface/types/UnlinkError"
import { FileSystemError } from "./interface/types/FileSystemError"

export type Path = string[]

export type File = <T>(
    path: Path,
    callback: (
        data: string,
    ) => pa.IAsync<T>,
    /**
     * if the error callback returns a null, the execute of the IAsync will never be called
     */
    error: (
        err: TReadFileError,
        path: string,
    ) => null | pa.IAsync<T>,
) => pa.IAsync<T>


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
    ) => null | pa.IAsync<T>,
    /**
     * if the error callback returns a null, the execute of the IAsync will never be called
     */
    error: (
        err: TReadDirError,
        path: string,
    ) => null | pa.IAsync<pa.IReadonlyDictionary<T>>,
) => pa.IAsync<pa.IReadonlyDictionary<T>>

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
) => pa.IAsync<null>

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

export type CreateHandledFilesystem = (
    onError: ($: FileSystemError) => void,
) => hfs.IHandledFilesystem

export type API = {
    file: File,
    directory: Directory
    writeFileAndWait: WriteFileAndWait
    writeFile: WriteFile
    unlink: Unlink
    createHandledFilesystem: CreateHandledFilesystem
}
