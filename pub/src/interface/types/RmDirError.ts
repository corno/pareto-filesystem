
export type RmDirError =
| ["no entity", {}]
| ["not empty", {}]
| ["other", {
    readonly "message": string
}]