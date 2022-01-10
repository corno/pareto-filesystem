import { MkDirErrorType } from "./MkDirError";
import { ReadDirError } from "./ReadDirError";
import { ReadFileError } from "./ReadFileError";
import { UnlinkErrorType } from "./UnlinkErrorType";
import { WriteFileErrorType } from "./WriteFileErrorType";

export type FSError = {
    path: string
    error:
    | ["mkdir", MkDirErrorType]
    | ["writeFile", WriteFileErrorType]
    | ["readFile", ReadFileError]
    | ["readdir", ReadDirError]
    | ["unlink", UnlinkErrorType]
}