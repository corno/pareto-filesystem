
import { API } from "pareto-filesystem-api"
import { directory } from "./asyncAPI/directory"
import { file } from "./asyncAPI/file"
import { unlink } from "./asyncAPI/unlink"
import { writeFile } from "./asyncAPI/writeFile"
import { writeFileAndWait } from "./asyncAPI/writeFileAndWait"

export * from "./esc" //FIXME!!! REMOVE

export function init(
): API {
    return {
        file: file,
        directory: directory,
        writeFile: writeFile,
        writeFileAndWait: writeFileAndWait,
        unlink: unlink,
    }
}