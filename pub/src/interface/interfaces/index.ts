
export type File = {
    read:  (
        $i: ($: string) => void,
    ) => void
}

export type Directory = {
    readDirWithFileTypes: (
        $: {
            path: string,
            idStyle:
            | ["absolute", {}]
            | ["name only", {}]
            | ["relative from root", {}]
        },
        $i: {
            callbacks: {
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
                    $i: Directory,
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
                    $i: File,
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
            onEnd: () => void
        }
    ) => void
    getDirectory: (
        $: string,
        $i: {
            callback: ($i: Directory) => void
        }
    ) => void
    readFile: (
        $: string,
        $i: ($: string) => void,
    ) => void
    mkDir: (
        $: string,
        $i: {
            callback: ($i: Directory) => void
        }
    ) => void
    writeFile: (
        $: {
            filePath: string
            data: string
        },
        $i: ($: {}) => void
    ) => void
    unlink: (
        $: {
            path: string,
            acceptNonExistence: boolean,
        },
        $i: ($: {}) => void,
    ) => void
}