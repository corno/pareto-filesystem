import * as pr from "pareto-runtime"

export type ReferencedProject = {
    latestVersion: string
}

export type Dependency = {
    versionX: string
    isEqual: boolean
}

export type Dependencies = {
    allDepsInSync: boolean
    dependencies: pr.IReadonlyDictionary<Dependency>
    devDependencies: pr.IReadonlyDictionary<Dependency>
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

    publishData: null | {
        version: string
        name: string
    }
    deps: Dependencies
    isClean: boolean
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
    isClean: boolean
}

export type DependentProject = {
    project: Project
}

export type ProjectStatusOverview = {
    projects: pr.IReadonlyDictionary<DependentProject>
    referencedProjects: pr.IReadonlyDictionary<ReferencedProject>
}