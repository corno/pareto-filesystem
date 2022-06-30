
export type TUnlinkErrorType =
| ["no entity", {}]
| ["is directory", {}]
| ["other", {
    readonly "message": string
}]