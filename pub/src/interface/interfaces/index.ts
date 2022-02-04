import * as pr from "pareto-runtime"
export type IFile = {
    read: (
        $i: IReadFile,
    ) => void
}

export type INodeCallbacks = {
    blockDevice?: (
        $: {
            id: string,
        },
    ) => void
    characterDevice?: (
        $: {
            id: string,
        },
    ) => void
    directory?: (
        $: {
            id: string,
        },
        $i: IDirectory,
    ) => void
    fifo?: (
        $: {
            id: string,
        },
    ) => void
    file?: (
        $: {
            id: string,
        },
        $i: IFile,
    ) => void
    socket?: (
        $: {
            id: string,
        },
    ) => void
    symbolicLink?: (
        $: {
            id: string,
        },
    ) => void
}

export type IReadFile = {
    callback: ($: string) => void,
    onNotExists?: () => void,
}

export type IWriteFile = {
    onDone?: () => void
}

export type IDirectory = {
    createWriteStream: (
        $: {
            path: string
        },
        $i: ($i: pr.IStreamConsumer<string, null>) => void
    ) => void
    getDirectory: (
        $: string,
        $i: {
            callback: ($i: IDirectory) => void
        }
    ) => void
    readDirWithFileTypes: (
        $: {
            path: string,
            idStyle:
            | ["absolute", {}]
            | ["name only", {}]
            | ["relative from root", {}]
        },
        $i: {
            callbacks: INodeCallbacks
            onEnd: () => void
        }
    ) => void
    readFile: (
        $: string,
        $i: IReadFile,
    ) => void
    readRecursively: (
        $: {
            directoriesToExclude?: string[],
            idStyle:
            | ["absolute", {}]
            | ["relative from root", {}]
        },
        $i: {
            callbacks: INodeCallbacks
            onEnd: () => void
        }
    ) => void
    mkDir: (
        $: string,
        $i: {
            callback: ($i: IDirectory) => void
        }
    ) => void
    unlink: (
        $: {
            path: string,
        },
        $i: {
            onDone?: () => void
            onNotExists?: () => void
        },
    ) => void
    writeFile: (
        $: {
            filePath: string
            data: string
        },
        $i: IWriteFile
    ) => void
}