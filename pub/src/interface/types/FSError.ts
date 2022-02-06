import { TMkDirErrorType } from "./MkDirError";
import { TReadDirError } from "./ReadDirError";
import { TReadFileError } from "./ReadFileError";
import { TUnlinkErrorType } from "./UnlinkErrorType";
import { TRmDirError } from "./RmDirError";
import { TWriteFileErrorType } from "./WriteFileErrorType";

export type TFSError = {
    readonly "path": string
    readonly "error":
    | ["mkdir", TMkDirErrorType]
    | ["writeFile", TWriteFileErrorType]
    | ["readFile", TReadFileError]
    | ["readdir", TReadDirError]
    | ["rmdir", TRmDirError]
    | ["unlink", TUnlinkErrorType]
}