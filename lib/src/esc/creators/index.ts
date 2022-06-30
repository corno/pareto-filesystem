import * as pr from "pareto-runtime"
export type IFile = {
    readonly "read": (
        $i: IReadFile,
    ) => void
}

export type INodeCallbacks = {
    readonly "blockDevice"?: (
        $d: {
            readonly "id": string,
        },
    ) => void
    readonly "characterDevice"?: (
        $d: {
            readonly "id": string,
        },
    ) => void
    readonly "directory"?: (
        $d: {
            readonly "id": string,
        },
        $i: IDirectory,
    ) => void
    readonly "fifo"?: (
        $d: {
            readonly "id": string,
        },
    ) => void
    readonly "file"?: (
        $d: {
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
        $d: {
            readonly "id": string,
        },
    ) => void
}

export type IReadFile = {
    readonly "callback": ($d: string) => void,
    readonly "onNotExists"?: () => void,
}

export type IWriteFile = {
    readonly "onSuccess"?: () => void
    readonly "onDone"?: () => void
}

export type IDirectory = {
    readonly "createWriteStream": (
        $d: {
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
        $d: string,
        $i: {
            readonly "callback": ($i: IDirectory) => void
        }
    ) => void
    readonly "mkDir": (
        $d: {
            readonly "path": string,
            readonly "recursive": boolean,
        },
        $i: {
            readonly "onSuccess": ($i: IDirectory) => void
        }
    ) => void
    readonly "readDirWithFileTypes": (
        $d: {
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
        $d: string,
        $i: IReadFile,
    ) => void
    /**
     * this is readRecursively
     */
    readonly "readRecursively": (
        $d: {
            /**
             * directories to exclude
             */
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
        $d: {
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
        $d: {
            readonly "path": string,
        },
        $i: {
            readonly "onDone"?: () => void
            readonly "onSuccess"?: () => void
            readonly "onNotExists"?: () => void
        },
    ) => void
    readonly "wrapAsync": (
        $i: {
            callback: ($i: { onDone: () => void }) => void
        }
    ) => void
    readonly "writeFile": (
        $d: {
            readonly "path": string
            readonly "data": string,
            readonly "createMissingDirectories": boolean,
        },
        $i: IWriteFile
    ) => void
}