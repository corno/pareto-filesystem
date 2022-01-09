
export type Test = {
    assertEqual: <T>(
        expected: T,
        actual: T,
    ) => void
}

export type TestSet = {
    testSync: (
        name: string,
        callback: ($: Test) => void
    ) => void
}

export type TestContext = {
    testset(
        name: string,
        callback: ($: TestSet) => void
    ): void
}