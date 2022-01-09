
export type ReadDirError =
| ["no entity", {}]
| ["is not directory", {}]
| ["other", {
    readonly "message": string
}]