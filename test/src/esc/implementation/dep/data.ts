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

export type ReferencedProject = {
    latestVersion: string
}

export type Part = {
    publishStatus: 
    | ["unpublished", {}]
    | ["missing", {}]
    | ["found", {
        latestVersion: string
        gitSha: string
        shaKeysEqual: boolean
    }]
    local: LocalPart
}

export type OptionalPart =
    | ["missing", {
        required: boolean
    }]
    | ["found", Part]

export type Project = {
    gitHeadSha: string
    gitClean: boolean
    parts: pr.IReadonlyDictionary<OptionalPart>
}

export type DependencyOverview = {
    projects: pr.IReadonlyDictionary<Project>
    referencedProjects: pr.IReadonlyDictionary<ReferencedProject>
}