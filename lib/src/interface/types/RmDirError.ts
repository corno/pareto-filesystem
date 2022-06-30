
export type TRmDirError =
| ["no entity", {}]
| ["not empty", {}]
| ["other", {
    readonly "message": string
}]