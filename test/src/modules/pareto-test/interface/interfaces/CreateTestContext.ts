import { TestContext } from "./TestContext";

export type CreateTestContext = (
    callback: ($: TestContext) => void
) => void