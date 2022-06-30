
export type TReadDirError =
| ["no entity", {}]
| ["is not directory", {}]
| ["other", {
    readonly "message": string
}]