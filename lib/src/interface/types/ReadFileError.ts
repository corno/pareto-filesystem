
export type TReadFileError =
| ["no entity", {}]
| ["is directory", {}]
| ["other", {
    readonly "message": string
}]