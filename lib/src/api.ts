import * as asyncAPI from "pareto-async-api"

export type File = <T>(
    path: string[],
    callback: (
        data: string,
    ) => asyncAPI.IAsync<T>,
    error: (
        err: null,
    ) => asyncAPI.IAsync<T>,
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
) => asyncAPI.IAsync<asyncAPI.IDictionary<T>> 

export type API = {
    file: File,
    directory: Directory
}
