
import { API } from "pareto-filesystem-api"
import { directory, file } from "./asyncAPI"

export * from "./esc" //FIXME!!! REMOVE
export * from "./interface" //FIXME!!! REMOVE

export function init(
): API {
    return {
        file: file,
        directory: directory(),
    }
}