
export type TWriteFileErrorType =
| ["no entity", {}]
//| ["is directory", {}]
| ["other", {
    readonly "message": string
}]