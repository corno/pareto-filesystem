
export type File = {
    read:  (
        $i: ($: string) => void,
    ) => void
}

export type Directory = {
    readDirWithFileTypes: (
        $: {
            path: string,
        },
        $i: {
            onFile: (
                $: {
                    name: string,
                    absolutePath: string,
                },
                $i: File,
            ) => void
            onDirectory: (
                $: {
                    name: string,
                    absolutePath: string,
                },
                $i: Directory,
            ) => void
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