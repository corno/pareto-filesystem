import * as pr from "pareto-runtime"
import { FSError } from "../../interface/types";

export function printFSError(
    $: FSError
) {
    return `${((): string => {

        switch ($.error[0]) {
            case "mkdir":
                return pr.cc($.error[1], ($) => {
                    return `mkdir failed: ${$[0]}`
                })
            case "readdir":
                return pr.cc($.error[1], ($) => {
                    return `readdir failed: ${$[0]}`

                })
            case "readFile":
                return pr.cc($.error[1], ($) => {
                    return `readFile failed: ${$[0]}`

                })
            case "rmdir":
                return pr.cc($.error[1], ($) => {
                    return `rmdir failed: ${$[0]}`

                })
            case "unlink":
                return pr.cc($.error[1], ($) => {
                    return `unlink failed: ${$[0]}`

                })
            case "writeFile":
                return pr.cc($.error[1], ($) => {
                    return `writeFile failed: ${$[0]}`

                })

            default: return pr.au($.error[0])
        }
    })()} @ '${$.path}'`
}
