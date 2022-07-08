import { TReadDirError } from "./ReadDirError"
import { TReadFileError } from "./ReadFileError"
import { TWriteFileError } from "./WriteFileError"

export type FileSystemError = {
    path: string
    type:
    | ["file read", TReadFileError]
    | ["file write", TWriteFileError]
    | ["directory read", TReadDirError]
}
