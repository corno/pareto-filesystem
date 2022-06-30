import * as pl from "pareto-lang-lib"
import { TFSError } from "../../interface";

export function createFSErrorMessage(
    $: TFSError
) {
    return `${((): string => {

        switch ($.error[0]) {
            case "mkdir":
                return pl.cc($.error[1], ($) => {
                    return `mkdir failed: ${$[0]}`
                })
            case "readdir":
                return pl.cc($.error[1], ($) => {
                    return `readdir failed: ${$[0]}`

                })
            case "readFile":
                return pl.cc($.error[1], ($) => {
                    return `readFile failed: ${$[0]}`

                })
            case "rmdir":
                return pl.cc($.error[1], ($) => {
                    return `rmdir failed: ${$[0]}`

                })
            case "unlink":
                return pl.cc($.error[1], ($) => {
                    return `unlink failed: ${$[0]}`

                })
            case "writeFile":
                return pl.cc($.error[1], ($) => {
                    return `writeFile failed: ${$[0]}`

                })

            default: return pl.au($.error[0])
        }
    })()} @ '${$.path}'`
}
