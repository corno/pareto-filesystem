import { MkDirErrorType } from "./MkDirError";
import { ReadDirError } from "./ReadDirError";
import { ReadFileError } from "./ReadFileError";
import { UnlinkErrorType } from "./UnlinkErrorType";
import { WriteFileErrorType } from "./WriteFileErrorType";

export type FSError = {
    operation: string
    path: string
    error:
    | ["mkDir", MkDirErrorType]
    | ["writeFile", WriteFileErrorType]
    | ["readFile", ReadFileError]
    | ["readDir", ReadDirError]
    | ["unlink", UnlinkErrorType]
}