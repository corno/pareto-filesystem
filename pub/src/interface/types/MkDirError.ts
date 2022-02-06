
export type TMkDirErrorType =
| ["no entity", {}]
| ["exists", {}]
//| ["is directory", {}]
| ["other", {
    readonly "message": string
}]
