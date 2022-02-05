import { MkDirErrorType } from "./MkDirError";
import { ReadDirError } from "./ReadDirError";
import { ReadFileError } from "./ReadFileError";
import { UnlinkErrorType } from "./UnlinkErrorType";
import { RmDirError } from "./RmDirError";
import { WriteFileErrorType } from "./WriteFileErrorType";

export type FSError = {
    path: string
    error:
    | ["mkdir", MkDirErrorType]
    | ["writeFile", WriteFileErrorType]
    | ["readFile", ReadFileError]
    | ["readdir", ReadDirError]
    | ["rmdir", RmDirError]
    | ["unlink", UnlinkErrorType]
}