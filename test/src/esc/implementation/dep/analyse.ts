import * as pr from "pareto-runtime"
import { getData } from "./getData"

const red = "\x1b[31m"
const green = "\x1b[32m"
const yellow = "\x1b[33m"
const cyan = "\x1b[36m"
const reset = "\x1b[0m"

pr.runProgram(
    (programData) => {
        if (programData.argument === undefined) {
            throw new Error("missing dataDir")
        }
        getData(
            programData.argument,
            (statusOverview) => {

                //local project overview
                console.log(``)
                console.log(`local project overview`)
                statusOverview.projects.forEach(($, projectName) => {

                    console.log(`\t${projectName} ${$.project.isClean ? "" : `${red}!! ${reset}` } ${!$.project.gitClean ? `${red}uncommitted changes${reset}` : ""}`)
                    $.project.parts.forEach(($, partName) => {
                        //console.log(`$#### ${partName}`)
                        if ($[0] === "found") {
                            const $2 = $[1]
                            const remark = (() => {
                                switch ($2.publishStatus[0]) {
                                    case "found": {
                                        const $3 = $2.publishStatus[1]
                                        return !$3.shaKeysEqual
                                            ? `${red}unpublished commits${reset}`
                                            : ``
                                    }
                                    case "missing": {
                                        return `${red}not published${reset}`
                                    }
                                    case "unpublished": {
                                        return ""
                                    }
                                }
                            })()
                            
                            console.log(`\t\t${partName} ${remark} ${$2.publishData !== null && $2.publishData.name !== projectName ? "INVALID NAME" : ""}`)
                            $[1].deps.dependencies.forEach(($, depName) => {

                                statusOverview.referencedProjects.find(
                                    depName,
                                    ($$) => {
                                        console.log(`\t\t\t${depName} (${!$.isEqual
                                            ? `${red}${$.versionX} <> ${$$.latestVersion}${reset}`
                                            : `${green}${$.versionX}${reset}`
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
                statusOverview.projects.forEach(($, projectName) => {
                    console.log(`\t${projectName}`)

                    $.project.parts.forEach(($, partName) => {
                        if ($[0] === "found") {
                            console.log(`\t\t${partName}`)

                            $[1].deps.devDependencies.forEach(($, depName) => {
                                console.log(`\t\t\t${depName} (${$})`)
                            })
                        }
                    })
                })

                //outdated deps
                console.log("")
                console.log("outdated:")
                statusOverview.projects.forEach(($, projectName) => {
                    $.project.parts.forEach(($, partName) => {
                        if ($[0] === "found") {
                            $[1].deps.dependencies.forEach(($, depName) => {
                                statusOverview.referencedProjects.find(
                                    depName,
                                    ($$) => {
                                        if (!$.isEqual) {
                                            console.log(`${projectName}>${depName}: ${$$.latestVersion} <> ${$.versionX}`)
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




                //reversed dependencies
                console.log(``)
                console.log(`reversed dependencies`)
                statusOverview.referencedProjects.forEach(($, refProjectName) => {
                    const lv = $.latestVersion
                    console.log(`\t${refProjectName} (${$.latestVersion})`)
                    statusOverview.projects.forEach(($, projectName) => {

                        $.project.parts.forEach(($, partName) => {
                            if ($[0] === "found") {
                                $[1].deps.dependencies.forEach(($, depName) => {
                                    if (depName === refProjectName) {
                                        console.log(`\t\t\t${projectName} (${partName}, (${!$.isEqual ? red : green}${$.versionX}${reset})`)
                                    }
                                })
                            }
                        })
                    })
                })


                //digraph
                console.log(``)
                console.log(`digraph G {`)
                statusOverview.projects.forEach(($, projectName) => {
                    console.log(`\t"${projectName}"${!$.project.isClean ? ` [ color="red" ]` : ""}`)
                })
                console.log(``)
                statusOverview.projects.forEach(($, projectName) => {
                    $.project.parts.forEach(($, partName) => {
                        if (partName === "pub") {
                            if ($[0] === "found") {
                                $[1].deps.dependencies.forEach(($, depName) => {
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

