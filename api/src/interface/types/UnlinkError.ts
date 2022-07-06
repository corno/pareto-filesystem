
export type TUnlinkError =
| ["no entity", {}]
| ["is directory", {}]
| ["other", {
    readonly "message": string
}]