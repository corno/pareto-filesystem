import * as pr from "pareto-runtime"

export type LocalPart = {
    dependencies: pr.IReadonlyDictionary<string>
    devDependencies: pr.IReadonlyDictionary<string>
    publishData: null | {
        version: string
        name: string
    }
}

export type LocalProject = {
    gitHeadSha: string
    gitClean: boolean
    parts: pr.IReadonlyDictionary<null | LocalPart>
}
