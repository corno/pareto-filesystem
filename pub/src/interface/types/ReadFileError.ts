
export type ReadFileError =
| ["no entity", {}]
| ["is directory", {}]
| ["other", {
    readonly "message": string
}]