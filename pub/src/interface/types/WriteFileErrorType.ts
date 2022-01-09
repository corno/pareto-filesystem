
export type WriteFileErrorType =
| ["no entity", {}]
//| ["is directory", {}]
| ["other", {
    readonly "message": string
}]