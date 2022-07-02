
import { API } from "./api"
import { directory, file } from "./esc/asyncAPI"

export * from "./esc"
export * from "./interface"
export * from "./modules/counter"


export function init(): API {
    return {
        file: file,
        directory: directory,
    }
}