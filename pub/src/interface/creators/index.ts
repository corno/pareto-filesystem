import * as pr from "pareto-runtime"
export type IFile = {
    readonly "read": (
        $i: IReadFile,
    ) => void
}

export type INodeCallbacks = {
    readonly "blockDevice"?: (
        $: {
            readonly "id": string,
        },
    ) => void
    readonly "characterDevice"?: (
        $: {
            readonly "id": string,
        },
    ) => void
    readonly "directory"?: (
        $: {
            readonly "id": string,
        },
        $i: IDirectory,
    ) => void
    readonly "fifo"?: (
        $: {
            readonly "id": string,
        },
    ) => void
    readonly "file"?: (
        $: {
            readonly "id": string,
        },
        $i: IFile,
    ) => void
    readonly "socket"?: (
        $: {
            readonly "id": string,
        },
    ) => void
    readonly "symbolicLink"?: (
        $: {
            readonly "id": string,
        },
    ) => void
}

export type IReadFile = {
    readonly "callback": ($: string) => void,
    readonly "onNotExists"?: () => void,
}

export type IWriteFile = {
    readonly "onSuccess"?: () => void
    readonly "onDone"?: () => void
}

export type IDirectory = {
    readonly "createWriteStream": (
        $: {
            readonly "path": string,
            readonly "createMissingDirectories": boolean,
        },
        $i: {
            readonly "consumer": ($i: pr.IStreamConsumer<string, null>) => void,
            readonly "onSuccess"?: () => void
            readonly "onDone"?: () => void
        }
    ) => void
    readonly "getDirectory": (
        $: string,
        $i: {
            readonly "callback": ($i: IDirectory) => void
        }
    ) => void
    readonly "mkDir": (
        $: {
            readonly "path": string,
            readonly "recursive": boolean,
        },
        $i: {
            readonly "onSuccess": ($i: IDirectory) => void
        }
    ) => void
    readonly "readDirWithFileTypes": (
        $: {
            readonly "path": string,
            readonly "idStyle":
            | ["absolute", {}]
            | ["name only", {}]
            | ["relative from root", {}]
        },
        $i: {
            readonly "callbacks": INodeCallbacks
            readonly "onEnd": () => void
        }
    ) => void
    readonly "readFile": (
        $: string,
        $i: IReadFile,
    ) => void
    readonly "readRecursively": (
        $: {
            readonly "directoriesToExclude"?: string[],
            readonly "idStyle":
            | ["absolute", {}]
            | ["relative from root", {}]
        },
        $i: {
            readonly "callbacks": INodeCallbacks
            readonly "onEnd": () => void
        }
    ) => void
    readonly "rm": (
        $: {
            readonly "path": string,
            readonly "recursive": boolean,
        },
        $i: {
            readonly "onNotExists"?: () => void
            readonly "onSuccess"?: () => void
            readonly "onDone"?: () => void
        }
    ) => void
    readonly "unlink": (
        $: {
            readonly "path": string,
        },
        $i: {
            readonly "onDone"?: () => void
            readonly "onSuccess"?: () => void
            readonly "onNotExists"?: () => void
        },
    ) => void
    readonly "writeFile": (
        $: {
            readonly "path": string
            readonly "data": string,
            readonly "createMissingDirectories": boolean,
        },
        $i: IWriteFile
    ) => void
}