
export type UnlinkErrorType =
| ["no entity", {}]
//| ["is directory", {}]
| ["other", {
    readonly "message": string
}]