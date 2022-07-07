
// import * as fsLib from "../../../../lib"
// import * as pt from "pareto-test-lib"
// import * as pl from "pareto-lang-lib"
import * as pa from "pareto-lang-api"
// import * as pr from "pareto-runtime"
// import * as diff from "pareto-diff-lib"
import * as asyncLib from "pareto-async-functions-lib"
//import * as asyncAPI from "pareto-async-api"

const async = asyncLib.init()

type TestNode =
    | ["test", {
        success: boolean
    }]
    | ["set", {
        children: pa.IReadonlyDictionary<TestNode>
    }]


// function printTestNode(
//     $: TestNode, indentation: string
//     ) {
//     switch ($[0]) {
//         case "set":
//             pl.cc($[1], ($) => {
//                 console.log(`SET`)
//                 $.children.forEach((v, k) => {
//                     console.log(`${indentation}${k}`)
//                     printTestNode(v, `${indentation}    `)
//                 })
//             })
//             break
//         case "test":
//             pl.cc($[1], ($) => {
//                 console.log(`TEST`)

//             })
//             break
//         default: pl.au($[0])
//     }
// }


export function runTests(
    testDataDir: string,
) {
    // const fs = fsLib.init()
    // async.rewrite<TestNode, pa.IReadonlyDictionary<TestNode>>(
    //     async.rawDictionary<TestNode>(
    //         {
    //             "a": async.rewrite(
    //                 fs.directory(
    //                     testDataDir,
    //                     ($) => async.value($.type),
    //                     (err) => {
    //                         return null
    //                     }
    //                 ),
    //                 ($) => {
    //                     return ["set", {
    //                         children: pl.createDictionary({})
    //                     }]
    //                 }
    //             ),
    //             "b": async.value(["test", {
    //                 success: false,
    //             }])
    //         }
    //     ),
    //     ($) => {
    //         return ["set", {
    //             children: $
    //         }]
    //     }

    // ).execute(($) => {
    //     //printTestNode($, ``)
    // })
    // fs.directory(
    //     testDataDir,
    //     ($) => {
    //         //console.log($.name)
    //         return async.value(null)
    //     },
    //     (err) => {
    //         return null
    //     },
    // ).execute(() => {
    //     //console.log("DONE")
    // })
    // pt.runTests(
    //     {
    //         callback: ($i) => {
    //             $i.asyncSubset(
    //                 {
    //                     name: "My Test",
    //                 },
    //                 ($i) => {
    //                     const testSet = $i
    //                     fsLib.wrapDirectory(
    //                         {
    //                             rootDirectory: testDataDir,
    //                         },
    //                         {
    //                             callback: ($i) => {

    //                                 $i.rm(
    //                                     {
    //                                         path: "tmp",
    //                                         recursive: true,
    //                                     },
    //                                     {
    //                                         onNotExists: () => {
    //                                             //don't do anything //but the callback should be here
    //                                         },
    //                                         onDone: () => {
    //                                             $i.mkDir(
    //                                                 {
    //                                                     path: "tmp",
    //                                                     recursive: false,
    //                                                 },
    //                                                 {
    //                                                     onSuccess: () => {

    //                                                         function testWrite(
    //                                                             filePath: string,
    //                                                             writeCallback: (
    //                                                                 $: {
    //                                                                     fileName: string
    //                                                                 },
    //                                                             ) => void
    //                                                         ) {
    //                                                             $i.getDirectory(
    //                                                                 "tmp",
    //                                                                 {
    //                                                                     callback: ($i) => {
    //                                                                         $i.readFile(filePath, {
    //                                                                             callback: ($) => {
    //                                                                                 testSet.testSet.assert({
    //                                                                                     testName: `file should not exist: ${filePath}`,
    //                                                                                     condition: false
    //                                                                                 })
    //                                                                             },
    //                                                                             onNotExists: () => {
    //                                                                                 writeCallback(
    //                                                                                     {
    //                                                                                         fileName: pr.join(["tmp", filePath]),
    //                                                                                     }
    //                                                                                 )
    //                                                                             },
    //                                                                         })

    //                                                                     }
    //                                                                 }
    //                                                             )
    //                                                         }
    //                                                         testWrite(
    //                                                             "tmp.txt",
    //                                                             ($) => {

    //                                                                 $i.writeFile(
    //                                                                     {
    //                                                                         path: $.fileName,
    //                                                                         data: "FOO",
    //                                                                         createMissingDirectories: false,
    //                                                                     },
    //                                                                     {
    //                                                                     },
    //                                                                 )
    //                                                             }
    //                                                         )
    //                                                         testWrite(
    //                                                             "tmp2.txt",
    //                                                             ($) => {

    //                                                                 $i.createWriteStream(
    //                                                                     {
    //                                                                         path: $.fileName,
    //                                                                         createMissingDirectories: false,
    //                                                                     },
    //                                                                     {
    //                                                                         consumer: ($i) => {
    //                                                                             $i.onData("FOO")
    //                                                                             $i.onEnd(null)
    //                                                                         },
    //                                                                     },
    //                                                                 )
    //                                                             }
    //                                                         )
    //                                                         testWrite(
    //                                                             "dir/tmp2.txt",
    //                                                             ($) => {
    //                                                                 $i.createWriteStream(
    //                                                                     {
    //                                                                         path: $.fileName,
    //                                                                         createMissingDirectories: true,
    //                                                                     },
    //                                                                     {
    //                                                                         consumer: ($i) => {
    //                                                                             $i.onData("FOO")
    //                                                                             $i.onEnd(null)
    //                                                                         },
    //                                                                     },
    //                                                                 )
    //                                                             }
    //                                                         )

    //                                                         $i.readFile("a file.txt", {
    //                                                             callback: ($) => {
    //                                                                 testSet.testSet.testString({
    //                                                                     testName: "readFile",
    //                                                                     expected: "foo",
    //                                                                     actual: $,
    //                                                                 })
    //                                                             }
    //                                                         })
    //                                                         $i.readDirWithFileTypes(
    //                                                             {

    //                                                                 path: "a dir",
    //                                                                 idStyle: ["name only", {}],
    //                                                             },
    //                                                             {
    //                                                                 callbacks: {

    //                                                                 },
    //                                                                 onEnd: () => {

    //                                                                 }
    //                                                             }
    //                                                         )
    //                                                         $i.getDirectory(
    //                                                             "a recursive dir",
    //                                                             {
    //                                                                 callback: ($i) => {
    //                                                                     const files: string[] = []
    //                                                                     $i.readRecursively(
    //                                                                         {
    //                                                                             idStyle: ["relative from root", {}],
    //                                                                             directoriesToExclude: [
    //                                                                                 "excludedDir"
    //                                                                             ]
    //                                                                         },
    //                                                                         {
    //                                                                             callbacks: {
    //                                                                                 file: ($) => {
    //                                                                                     files.push($.id)
    //                                                                                 }
    //                                                                             },
    //                                                                             onEnd: () => {
    //                                                                                 testSet.testSet.testString(
    //                                                                                     {
    //                                                                                         testName: "expected files",
    //                                                                                         expected: "[\n\t\"a recursive dir/sub/a file.txt\"\n]",
    //                                                                                         actual: pr.JSONstringify(files),
    //                                                                                     }
    //                                                                                 )
    //                                                                             }
    //                                                                         }
    //                                                                     )
    //                                                                 }
    //                                                             }
    //                                                         )
    //                                                     }
    //                                                 }
    //                                             )
    //                                         }
    //                                     }
    //                                 )
    //                             },
    //                             onError: ($) => {

    //                                 $i.testSet.assert({
    //                                     testName: `unexpected error: ${fsLib.createFSErrorMessage($)}`,
    //                                     condition: false,
    //                                 })
    //                             },
    //                             onEnd: () => $i.done({}),
    //                         }
    //                     )
    //                 }


    //             )
    //         },
    //         log: pr.log,
    //     },
    //     diff.init(),
    // )
}
