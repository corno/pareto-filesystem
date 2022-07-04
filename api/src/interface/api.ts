import * as asyncAPI from "pareto-async-api"
import { TReadDirError } from "./types/ReadDirError"
import { TReadFileError } from "./types/ReadFileError"

export type File = <T>(
    path: string[],
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    /**
     * if the error callback returns a null, the execute of the IAsync will never be called
     */
    error: (
        err: TReadFileError,
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
    path: string,
    callback: (
        data: DirNodeData,
    ) => null | asyncAPI.IAsync<T>,
    /**
     * if the error callback returns a null, the execute of the IAsync will never be called
     */
    error: (
        err: TReadDirError,
    ) => null | asyncAPI.IAsync<asyncAPI.IDictionary<T>>,
) => asyncAPI.IAsync<asyncAPI.IDictionary<T>>

export type API = {
    file: File,
    directory: Directory
}
