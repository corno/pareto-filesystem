import * as fs from "fs"
import * as api from "pareto-filesystem-api"

export function createDirNodeData(path: string, dirent: fs.Dirent): api.DirNodeData {
    return {
        name: dirent.name,
        path: `${path}/${dirent.name}`,
        type: dirent.isDirectory()
            ? ["directory", {}]
            : dirent.isFile()
                ? ["file", {}] :
                ["other", {}]
    }
}