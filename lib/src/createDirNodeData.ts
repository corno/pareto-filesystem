import * as fs from "fs"
import { DirNodeData } from "./api"

export function createDirNodeData(path: string, dirent: fs.Dirent): DirNodeData {
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