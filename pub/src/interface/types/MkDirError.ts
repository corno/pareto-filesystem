
export type MkDirErrorType =
| ["no entity", {}]
//| ["is directory", {}]
| ["other", {
    readonly "message": string
}]
