import * as pf from "../../../../../pub/dist"
import * as pr from "pareto-runtime"
import * as https from "https"
import * as cp from "child_process"
import { Dependencies, Dependency, ProjectStatusOverview, OptionalPart, Part, Project, ReferencedProject } from "./data"
import { LocalPart, LocalProject } from "./data2"

function topologicalSort<T>(
    dictionary: pr.IReadonlyDictionary<T>,
    callback: (
        element: T,
        add: (dependencyName: string) => void,
    ) => void
) {
    const sorted: { key: string, value: T }[] = []
    const alreadyProcessed: string[] = []
    function inner(
        key: string
    ) {
        //console.log("\t!!", key)
        if (alreadyProcessed.indexOf(key) !== -1) {
            //console.log("\t\tdone")

        } else {
            //console.log("\t\tprocessing")
            alreadyProcessed.push(key)
            dictionary.getLookup().with(
                key,
                (x) => {
                    callback(
                        x,
                        (key) => {
                            inner(key)
                        }
                    )
                    sorted.push({
                        key: key,
                        value: x,
                    })
                    
                },
                (y) => {
                    
                }
            )
        }
    }
    dictionary.forEach(($, key) => {
        //console.log(">>>", key)
        inner(key)
    })
    return sorted
}

function asyncMapDictionary<T, TN>(
    dict: pr.IReadonlyDictionary<T>,
    callback: (
        $: {
            value: T,
            key: string,
            counter: pf.ICounter,
            add: (v: TN) => void
        }
    ) => void,
    onEnd: (v: pr.IReadonlyDictionary<TN>) => void
) {
    const builder = pr.createDictionaryBuilder<TN>()
    pf.createCounter(
        ($) => {
            dict.forEach((elem, key) => {
                callback({
                    value: elem,
                    key: key,
                    counter: $,
                    add: (v) => {
                        builder.add(key, v)
                    },
                })

            })
        },
        () => {
            onEnd(builder.toDictionary())
        }
    )
}

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

function versionIsEqual(linkedVersion: string, latestVersion: string) {
    return linkedVersion === `^${latestVersion}`
}

function getRegistry(
    packageName: string,
    counter: pf.ICounter,
    callback: (json: any | null) => void,
) {
    let data = ""

    counter.increment({})
    doHTTPS(
        'registry.npmjs.org',
        `/${packageName}`,
        (d) => {
            data += d
        },
        (err) => {
            callback(null)
            counter.decrement({})
        },
        () => {
            const json = pr.JSONparse(data)
            callback(json)
            counter.decrement({})
        }
    )
}

function mapDictionary<T, NT>(
    dict: pr.IReadonlyDictionary<T>,
    callback: (v: T, key: string) => NT
) {
    const newDictBuilder = pr.createDictionaryBuilder<NT>()
    dict.forEach(($, key) => {
        newDictBuilder.add(key, callback($, key))
    })
    return newDictBuilder.toDictionary()
}

export function getData(
    rootDirectory: string,
    callback: ($: ProjectStatusOverview) => void
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
                                                    if (err !== null) {
                                                        console.log("GIT DIFF", $d.id, stderr)

                                                    } else {

                                                        cp.exec(
                                                            `git -C ${$d.id} rev-parse HEAD`,
                                                            (err, shastdout, stderr) => {
                                                                if (err !== null) {
                                                                    console.log("GIT REV-PARSE", $d.id, stderr)
                                                                } else {
                                                                    //console.log(stdout)
                                                                    const partsBuilder = pr.createDictionaryBuilder<null | LocalPart>()
                                                                    const sourceDirs = ["pub", "test", "dev", "pareto"]
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

                const depPackagesBuilder = pr.createDictionaryBuilder<null>()

                const localProjects = projectsBuilder.toDictionary()

                localProjects.forEach(($) => {
                    $.parts.forEach(($) => {
                        if ($ !== null) {
                            $.dependencies.forEach(($, depName) => {
                                // if (depPackageNames.indexOf(depName) === -1) {
                                //     depPackageNames.push(depName)
                                // }

                                //WARNING: what happens when key is not unique
                                depPackagesBuilder.add(depName, null)
                            })
                            $.devDependencies.forEach(($, depName) => {
                                // if (depPackageNames.indexOf(depName) === -1) {
                                //     depPackageNames.push(depName)
                                // }

                                //WARNING: what happens when key is not unique
                                depPackagesBuilder.add(depName, null)
                            })
                        }
                    })
                })

                asyncMapDictionary<null, ReferencedProject>(
                    depPackagesBuilder.toDictionary(),
                    ($x) => {
                        getRegistry(
                            $x.key,
                            $x.counter,
                            (json) => {
                                if (json !== null) {
                                    $x.add({ latestVersion: json["dist-tags"].latest })
                                }
                            },
                        )
                    },
                    (referencedProjects) => {
                        asyncMapDictionary<LocalProject, Project>(
                            localProjects,
                            ($x) => {

                                $x.counter.increment({})

                                const sha = $x.value.gitHeadSha

                                asyncMapDictionary<LocalPart | null, OptionalPart>(
                                    $x.value.parts,
                                    ($x) => {
                                        const $ = $x.value
                                        const partName = $x.key

                                        if ($ === null) {
                                            $x.add(["missing", {
                                                required: partName === "pub" || partName === "test"
                                            }])
                                        } else {
                                            let allInSync = true
                                            const createDeps = (
                                                source: pr.IReadonlyDictionary<string>,
                                            ) => {
                                                return mapDictionary<string, Dependency>(
                                                    source,
                                                    (v, key) => {
                                                        referencedProjects.getLookup().getUnsafe(key).latestVersion
                                                        const equal = versionIsEqual(v, referencedProjects.getLookup().getUnsafe(key).latestVersion)
                                                        if (!equal) { allInSync = false }
                                                        return {
                                                            versionX: v,
                                                            isEqual: equal
                                                        }
                                                    }
                                                )
                                            }

                                            const deps: Dependencies = {
                                                dependencies: createDeps($.dependencies),
                                                devDependencies: createDeps($.devDependencies),
                                                allDepsInSync: allInSync,
                                            }

                                            if ($.publishData === null) {
                                                $x.add(["found", {
                                                    publishStatus: ["unpublished", {}],
                                                    deps: deps,
                                                    publishData: $.publishData,
                                                    isClean: allInSync,
                                                }])
                                            } else {
                                                getRegistry(
                                                    $.publishData.name,
                                                    $x.counter,
                                                    (json) => {
                                                        const pubData = $.publishData
                                                        if (json === null) {
                                                            //console.log(`>>>> ${$x.key} ${partName}`)
                                                            $x.add(["found", {
                                                                publishStatus: ["missing", {}],
                                                                deps: deps,
                                                                publishData: pubData,
                                                                isClean: false,
                                                            }])
                                                        } else {
                                                            if (json["dist-tags"] === undefined) {
                                                                throw new Error(`no dist-tags, ${$x.key}`)
                                                            }
                                                            const latest = json["dist-tags"].latest
                                                            if (latest === undefined) {
                                                                throw new Error(`no latest, ${$x.key}`)
                                                            }
                                                            const shaKey: string = json["versions"][latest].gitHead
                                                            $x.add(["found", {
                                                                //required: partName === "pub" || partName === "test",
                                                                publishStatus: ["found", {
                                                                    latestVersion: latest,
                                                                    gitSha: shaKey,
                                                                    shaKeysEqual: shaKey === sha
                                                                }],
                                                                deps: deps,
                                                                publishData: pubData,
                                                                isClean: shaKey === sha && allInSync,
                                                            }])

                                                        }
                                                    },
                                                )
                                            }
                                        }

                                    },
                                    (parts) => {
                                        let partsClean = true
                                        parts.forEach(
                                            ($) => {
                                                if ($[0] === "missing") {
                                                    if ($[1].required) {
                                                        partsClean = false
                                                    }
                                                } else {
                                                    if (!$[1].isClean) {
                                                        partsClean = false
                                                    }
                                                }
                                            },
                                        )
                                        $x.add({
                                            gitHeadSha: $x.value.gitHeadSha,
                                            gitClean: $x.value.gitClean,
                                            parts: parts,
                                            isClean: partsClean && $x.value.gitClean,
                                        })
                                        $x.counter.decrement({})

                                    }
                                )
                            },
                            (projects) => {
                                console.log("TOPSORT")
                                topologicalSort(
                                    projects,
                                    (elem, add) => {
                                        elem.parts.forEach(($, key) => {
                                            if ($ !== null && key === "pub") {
                                                if ($[0] === "found") {
                                                    $[1].deps.dependencies.forEach(($, key) => {
                                                        add(key)
                                                    })
                                                }
                                            }
                                        })
                                    }
                                ).forEach(($) => {
                                    console.log($.key)
                                })
                                const depOverview: ProjectStatusOverview = {
                                    referencedProjects: referencedProjects,
                                    projects: mapDictionary(projects, ($) => {
                                        return {
                                            project: $
                                        }
                                    }),
                                }
                                callback(depOverview)
                            }
                        )

                    }
                )
            },
        }
    )
}
