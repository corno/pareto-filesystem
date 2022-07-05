
export type TWriteFileError =
    | ["no entity", {}]
    //| ["is directory", {}]
    | ["other", {
        readonly "message": string
    }]