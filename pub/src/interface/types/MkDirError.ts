
export type MkDirErrorType =
| ["no entity", {}]
| ["exists", {}]
//| ["is directory", {}]
| ["other", {
    readonly "message": string
}]
