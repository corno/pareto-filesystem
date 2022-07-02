
import { API } from "./api"
import { directory, file } from "./esc/asyncAPI"
import * as asyncAPI from "pareto-async-api"

export * from "./esc"
export * from "./interface"
export * from "./modules/counter"


export function init(
    asyncLib: asyncAPI.API,
): API {
    return {
        file: file,
        directory: directory(asyncLib),
    }
}