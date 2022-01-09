
export type Directory = {
    readDirWithFileTypes: (
        $: {
            path: string,
        },
        $i: {
            onFile: (name: string) => void
            onDirectory: (
                $: {
                    name: string,
                },
                $i: Directory
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
        $i: ($: string) => void
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