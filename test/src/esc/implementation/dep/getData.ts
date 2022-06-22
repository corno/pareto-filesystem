import * as pf from "../../../../../pub/dist"
import * as pr from "pareto-runtime"
import * as https from "https"
import * as cp from "child_process"
import { DependencyOverview, LocalPart, LocalProject, OptionalPart, Part, Project, ReferencedProject } from "./data"

function doHTTPS(
    hostname: string,
    path: string,
    onData: (data: string) => void,
    onError: (e: Error) => void,
    onEnd: () => void,
) {

    const options = {
        hostname: hostname,
        //port: 443,
        path: path,
        method: 'GET'
    }

    const req = https.request(options, res => {
        //console.log(`statusCode: ${res.statusCode}`)


        res.on('data', d => {
            onData(d)
        })
        res.on('end', () => {
            onEnd()
        })
    })

    req.on('error', error => {
        onError(error)
    })

    req.end()
}

function getRegistry(
    packageName: string,
    callback: (json: any) => void,
    onError: () => void,
) {
    let data = ""

    doHTTPS(
        'registry.npmjs.org',
        `/${packageName}`,
        (d) => {
            data += d
        },
        (err) => {
            onError()
        },
        () => {
            const json = pr.JSONparse(data)
            callback(json)
        }
    )
}

export function getData(
    rootDirectory: string,
    callback: ($: DependencyOverview) => void
) {

    const projectsBuilder = pr.createDictionaryBuilder<LocalProject>()
    pf.wrapDirectory({
        rootDirectory: rootDirectory,
    },
        {
            callback: ($) => {
                $.readDirWithFileTypes(
                    {
                        path: "",
                        idStyle: ["name only", {}]
                    },
                    {
                        callbacks: {
                            directory: ($d, $i) => {
                                $i.wrapAsync(
                                    {
                                        callback: ($) => {
                                            cp.exec(
                                                `git -C ${$d.id} diff`,
                                                (err, cleanstdout, stderr) => {
                                                    cp.exec(
                                                        `git -C ${$d.id} rev-parse HEAD`,
                                                        (err, shastdout, stderr) => {
                                                            if (err !== null) {
                                                                console.log(shastdout, stderr)
                                                            } else {
                                                                //console.log(stdout)
                                                                const partsBuilder = pr.createDictionaryBuilder<null | LocalPart>()
                                                                const sourceDirs = ["pub", "test", "dev"]
                                                                sourceDirs.forEach($ => {
                                                                    $i.readFile(
                                                                        `${$}/package.json`,
                                                                        {
                                                                            callback: ($d) => {
                                                                                const packageData = pr.JSONparse($d)
                                                                                partsBuilder.add($, {
                                                                                    publishData: packageData.version === undefined || packageData.name === undefined
                                                                                        ? null
                                                                                        : {
                                                                                            version: packageData.version,
                                                                                            name: packageData.name
                                                                                        },
                                                                                    dependencies: packageData.dependencies === undefined
                                                                                        ? pr.createDictionaryBuilder<string>().toDictionary()
                                                                                        : (() => {
                                                                                            const depBuilder = pr.createDictionaryBuilder<string>()
                                                                                            pr.Objectkeys(packageData.dependencies).forEach(key => {
                                                                                                let data = ""
                                                                                                depBuilder.add(key, packageData.dependencies[key])
                                                                                            })
                                                                                            return depBuilder.toDictionary()
                                                                                        })(),
                                                                                    devDependencies: packageData.devDependencies === undefined
                                                                                        ? pr.createDictionaryBuilder<string>().toDictionary()
                                                                                        : (() => {
                                                                                            const depBuilder = pr.createDictionaryBuilder<string>()
                                                                                            pr.Objectkeys(packageData.devDependencies).forEach(key => {
                                                                                                let data = ""
                                                                                                depBuilder.add(key, packageData.devDependencies[key])
                                                                                            })
                                                                                            return depBuilder.toDictionary()
                                                                                        })(),
                                                                                })
                                                                            },
                                                                            onNotExists: () => {
                                                                                partsBuilder.add($, null)
                                                                            },
                                                                        }
                                                                    )

                                                                })
                                                  
                                                                projectsBuilder.add($d.id, {
                                                                    gitHeadSha: shastdout.trimEnd(),
                                                                    parts: partsBuilder.toDictionary(),
                                                                    gitClean: cleanstdout.trimEnd() === "",
                                                                })

                                                            }
                                                            $.onDone()

                                                        }
                                                    )
                                                }
                                            )
                                        },
                                    }
                                )
                            }
                        },
                        onEnd: () => {
                        }
                    }
                )
            },
            onError: ($) => {
                console.error(pf.createFSErrorMessage($))
            },
            onEnd: () => {

                const depPackageNames: string[] = []

                const localProjects = projectsBuilder.toDictionary()

                localProjects.forEach(($) => {
                    $.parts.forEach(($) => {
                        if ($ !== null) {
                            $.dependencies.forEach(($, depName) => {
                                if (depPackageNames.indexOf(depName) === -1) {
                                    depPackageNames.push(depName)
                                }
                            })
                        }
                    })
                })

                const depPackBuilder = pr.createDictionaryBuilder<ReferencedProject>()
                const publishedPackBuilder = pr.createDictionaryBuilder<Project>()
                pf.createCounter(
                    (projectCounter) => {
                        localProjects.forEach(($, key) => {
                            projectCounter.increment({})
                            const partsBuilder = pr.createDictionaryBuilder<OptionalPart>()

                            const sha = $.gitHeadSha
                            pf.createCounter(
                                (partCounter) => {
                                    $.parts.forEach(($, partName) => {
                                        if ($ === null) {
                                            partsBuilder.add(partName, ["missing", {
                                                required: partName === "pub" || partName === "test"
                                            }])
                                        } else {
                                            if ($.publishData === null) {
                                                partsBuilder.add(partName, ["found", {
                                                    publishStatus: ["unpublished", {}],
                                                    local: $,
                                                }])
                                            } else {
                                                partCounter.increment({})
                                                getRegistry(
                                                    $.publishData.name,
                                                    (json) => {
                                                        if (json["dist-tags"] === undefined) {
                                                            throw new Error(`no dist-tags, ${key}`)
                                                        }
                                                        const latest = json["dist-tags"].latest
                                                        if (latest === undefined) {
                                                            throw new Error(`no latest, ${key}`)
                                                        }
                                                        const shaKey: string = json["versions"][latest].gitHead
                                                        partsBuilder.add(partName, ["found", {
                                                            //required: partName === "pub" || partName === "test",
                                                            publishStatus: ["found", {
                                                                latestVersion: latest,
                                                                gitSha: shaKey,
                                                                shaKeysEqual: shaKey === sha
                                                            }],
                                                            local: $,
                                                        }])
                                                        partCounter.decrement({})
                                                    },
                                                    () => {
                                                        console.log(`>>>> ${key} ${partName}`)
                                                        partsBuilder.add(partName, ["found", {
                                                            publishStatus: ["missing", {}],
                                                            local: $,

                                                        }])
                                                        partCounter.decrement({})
                                                    }
                                                )
                                            }
                                        }
                                    })
                                },
                                () => {
                                    publishedPackBuilder.add(key, {
                                        gitHeadSha: $.gitHeadSha,
                                        gitClean: $.gitClean,
                                        parts: partsBuilder.toDictionary()
                                    })
                                    projectCounter.decrement({})
                                }
                            )
                            // counter.increment({})
                            // getRegistry(
                            //     key,
                            //     (json) => {
                            //         if (json["dist-tags"] === undefined) {
                            //             throw new Error(`no dist-tags, ${key}`)
                            //         }
                            //         const latest = json["dist-tags"].latest
                            //         if (latest === undefined) {
                            //             throw new Error(`no latest, ${key}`)
                            //         }
                            //         const shaKey: string = json["versions"][latest].gitHead
                            //         publishedPackBuilder.add(key, {
                            //             published: {
                            //                 latestVersion: latest,
                            //                 gitSha: shaKey,
                            //                 shaKeysEqual: shaKey === $.gitHeadSha
                            //             },
                            //             local: $,
                            //         })
                            //         counter.decrement({})
                            //     },
                            //     () => {
                            //         publishedPackBuilder.add(key, {
                            //             published: null,
                            //             local: $,
                            //         })
                            //         counter.decrement({})
                            //     }
                            // )
                        })
                        depPackageNames.forEach(($) => {
                            projectCounter.increment({})
                            getRegistry(
                                $,
                                (json) => {
                                    depPackBuilder.add($, { latestVersion: json["dist-tags"].latest })
                                    projectCounter.decrement({})
                                },
                                () => {
                                    // missing referenced package
                                }
                            )
                        })
                    },
                    () => {
                        const depOverview: DependencyOverview = {
                            referencedProjects: depPackBuilder.toDictionary(),
                            projects: publishedPackBuilder.toDictionary(),
                        }
                        callback(depOverview)

                    }

                )


            },
        }
    )
}
