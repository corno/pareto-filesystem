import * as pf from "../../../../../pub/dist"
import * as pr from "pareto-runtime"
import { createDictionaryBuilder } from "pareto-runtime"
import * as https from "https"
import * as fs from "fs"
import { LocalProject } from "./data"
import { getData } from "./getData"

const red = "\x1b[31m"
const green = "\x1b[32m"
const yellow = "\x1b[33m"
const cyan = "\x1b[36m"
const reset = "\x1b[0m"

function versionIsEqual(linkedVersion: string, latestVersion: string) {
    return linkedVersion === `^${latestVersion}`
}

pr.runProgram(
    (programData) => {
        if (programData.argument === undefined) {
            throw new Error("missing dataDir")
        }
        getData(
            programData.argument,
            (depOverview) => {

                //outdated deps
                console.log("")
                console.log("outdated:")
                depOverview.projects.forEach(($, projectName) => {
                    $.parts.forEach(($, partName) => {
                        if ($[0] === "found") {
                            $[1].local.dependencies.forEach(($, depName) => {
                                depOverview.referencedProjects.find(
                                    depName,
                                    ($$) => {
                                        if (!versionIsEqual($, $$.latestVersion)) {
                                            console.log(`${projectName}>${depName}: ${$$.latestVersion} <> ${$}`)
                                        }
                                    },
                                    () => {
                                        throw new Error("!!!!!")
                                    }
                                )
                            })
                        }
                    })
                })

                //local project overview
                console.log(``)
                console.log(`local project overview`)
                depOverview.projects.forEach(($, projectName) => {

                    console.log(`\t${projectName} ${!$.gitClean ? `${red}!uncommitted changes${reset}` : ""}`)
                    $.parts.forEach(($, partName) => {
                        //console.log(`$#### ${partName}`)
                        if ($[0] === "found") {

                            const remark = (() => {
                                const $2 = $[1]
                                switch ($2.publishStatus[0]) {
                                    case "found": {
                                        const $3 = $2.publishStatus[1]
                                        return !$3.shaKeysEqual
                                            ? `${red}!unpublished commits${reset}`
                                            : ``
                                    }
                                    case "missing": {
                                        return `${red}!not published${reset}`
                                    }
                                    case "unpublished": {
                                        return ""
                                    }
                                }
                            })()
                            console.log(`\t\t${partName} ${remark}`)
                            $[1].local.dependencies.forEach(($, depName) => {

                                depOverview.referencedProjects.find(
                                    depName,
                                    ($$) => {
                                        console.log(`\t\t\t${depName} (${!versionIsEqual($, $$.latestVersion)
                                                ? `${red}${$} <> ${$$.latestVersion}${reset}`
                                                : `${green}${$}${reset}`
                                            })`)
                                    },
                                    () => {
                                        throw new Error("!!!!!")
                                    }
                                )
                            })
                        } else {
                            if ($[1].required) {
                                console.log(`\t\t${partName} ${red}!missing${reset}`)
                            }
                        }

                    })
                })

                //dev dependencies
                console.log(`dev dependencies`)
                depOverview.projects.forEach(($, projectName) => {
                    console.log(`\t${projectName}`)

                    $.parts.forEach(($, partName) => {
                        if ($[0] === "found") {
                            console.log(`\t\t${partName}`)

                            $[1].local.devDependencies.forEach(($, depName) => {
                                console.log(`\t\t\t${depName} (${$})`)
                            })
                        }
                    })
                })



                //reversed dependencies
                console.log(``)
                console.log(`reversed dependencies`)
                depOverview.referencedProjects.forEach(($, refProjectName) => {
                    const lv = $.latestVersion
                    console.log(`\t${refProjectName} (${$.latestVersion})`)
                    depOverview.projects.forEach(($, projectName) => {

                        $.parts.forEach(($, partName) => {
                            if ($[0] === "found") {
                                $[1].local.dependencies.forEach(($, depName) => {
                                    if (depName === refProjectName) {
                                        console.log(`\t\t\t${projectName} (${partName}, (${!versionIsEqual($, lv) ? red : green}${$}${reset})`)
                                    }
                                })
                            }
                        })
                    })
                })


                //digraph
                console.log(``)
                console.log(`digraph G {`)
                depOverview.projects.forEach(($, projectName) => {
                    console.log(`\t"${projectName}"`)
                })
                console.log(``)
                depOverview.projects.forEach(($, projectName) => {
                    $.parts.forEach(($, partName) => {
                        if (partName === "pub") {
                            if ($[0] === "found") {
                                $[1].local.dependencies.forEach(($, depName) => {
                                    console.log(`\t"${projectName}" -> "${depName}"`)
                                })
                            }
                        }
                    })
                })
                console.log(`}`)


                console.log("Done!")
            }
        )
    }
)

