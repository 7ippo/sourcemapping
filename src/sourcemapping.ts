#!/usr/bin/env node
import * as path from 'path';
import * as ErrorStackParser from 'error-stack-parser';
import * as commander from 'commander';
import { readFileSync, read } from 'fs';
import { SourceMapConsumer } from 'source-map';

type sourcemapList = {
    [index: string]: any
}

let raw_stack_string_array: string[];

function stackStringProcess(value: any, previous: any): string {
    // input '\n' will be translated into '\\n' and cause ErrorStackParser parsing failure
    raw_stack_string_array = value.split(String.raw`\n`);
    return raw_stack_string_array.join('\n');
}

function printToConsole(error_msg: string, stack_frames: ErrorStackParser.StackFrame[]): void {

}

const program = new commander.Command();
program.version('0.0.1', '-v, --version');
program.option('-s, --stack <string>', 'stack string which can obtain from JSON.stringfy(Error.stack)', stackStringProcess);
program.option('-i, --msg <string>', 'error message. e.g. Uncaught ReferenceError: a is not defined');
program.option('-m, --map <string>', 'sourcemap dir path. Where to find sourcemap');
program.parse(process.argv);

console.debug("Check input")
console.log(program.opts());

if (program.stack && program.msg && program.map) {
    let error_obj: Error = {
        'stack': program.stack,
        'message': program.msg,
        'name': program.msg.split(':')[0]
    }
    console.log(error_obj);
    let stack_frame_array: ErrorStackParser.StackFrame[] = [];
    try {
        stack_frame_array = ErrorStackParser.parse(error_obj)
    } catch (error) {
        console.error('ErrorStackParser parsing failed' + error.toString());
        process.exit(0);
    }
    console.log(stack_frame_array);

    // 一次性把解析用到的sourcemap读进内存
    const sourcemap_list: sourcemapList = new Map();
    let regExp = /.+\/(.+)$/;
    for (const frame of stack_frame_array) {
        if (frame.hasOwnProperty('fileName')) {
            const name = regExp.exec(frame.fileName)[1];
            if (!sourcemap_list.has(name)) {
                let sourcemap_filepath = path.join(program.map, name + '.map');
                let sourcemap: any;
                try {
                    sourcemap = JSON.parse(readFileSync(sourcemap_filepath, 'utf-8'))
                } catch (error) {
                    console.error('Read&Parse sourcemap:' + sourcemap_filepath + 'failed. ' + error.toString());
                    process.exit(0);
                }
                sourcemap_list.set(name, sourcemap);
            }
        }
    }

    // 循环异步解析stack_frame_array
    stack_frame_array.forEach(stack_frame => {

    });

    // TODO: Translate line/column/fileName by using sourcemap
    // stack_frame_array.forEach(stack_frame => {
    // });
    // let frames_count = stack_frame_array.length;
    // let frames_done = 0;
    // while(frames_done < frames_count){
    //     const source_map = JSON.parse(readFileSync('','utf-8'));
    // }    
} else {
    console.error("No error stack string OR error msg string OR sourcemap dir found. Please Check input.");
}

// stack: "ReferenceError: exclued is not defined\n    at getParameterByName (http://localhost:7777/aabbcc/index.js:7:37)\n    at http://localhost:7777/aabbcc/index.js:15:11",
// message: "Uncaught ReferenceError: exclued is not defined",

// [ { columnNumber: 37,
//     lineNumber: 7,
//     fileName: 'http://localhost:7777/aabbcc/index.js',
//     functionName: 'getParameterByName',
//     source:
//      '    at getParameterByName (http://localhost:7777/aabbcc/index.js:7:37)' },
//   { columnNumber: 11,
//     lineNumber: 15,
//     fileName: 'http://localhost:7777/aabbcc/index.js',
//     source: '    at http://localhost:7777/aabbcc/index.js:15:11' } ]