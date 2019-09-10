#!/usr/bin/env node
import * as path from 'path';
import * as ErrorStackParser from 'error-stack-parser';
import * as commander from 'commander';
import { readFileSync, existsSync } from 'fs';
import { SourceMapConsumer } from 'source-map';

let raw_stack_string_array: string[];

function stackStringProcess(value: any, previous: any): string {
    // input '\n' will be translated into '\\n' and cause ErrorStackParser parsing failure
    raw_stack_string_array = value.split(String.raw`\n`);
    return raw_stack_string_array.join('\n');
}

function printToConsole(error_msg: string, stack_frames: ErrorStackParser.StackFrame[]): void {
    console.log("----Sourcemap Result----")
    console.log(error_msg);
    for (const frame of stack_frames) {
        let msg = "    at ";
        if (frame.functionName) msg += frame.functionName + " ";
        msg += "(";
        if (frame.fileName) msg += frame.fileName + ":";
        if (frame.lineNumber) msg += frame.lineNumber + ":";
        if (frame.columnNumber) msg += frame.columnNumber;
        msg += ")";
        console.log(msg);
    }
    console.log("------------------------")
}

async function loadAllConsumer(dir_path: string, stack_frame_array: ErrorStackParser.StackFrame[],
    sourcemap_map: Map<string, SourceMapConsumer>) {
    // 一次性把解析用到的sourcemap读进内存
    const sourcemap_list = new Set();
    const regExp = /.+\/(.+)$/;
    for (const frame of stack_frame_array) {
        if (frame.hasOwnProperty('fileName')) {
            const name = regExp.exec(frame.fileName)[1];
            frame.fileName = name;
            if (!sourcemap_list.has(name)) {
                sourcemap_list.add(name);
                let sourcemap_filepath = path.join(dir_path, name + '.map');
                if (existsSync(sourcemap_filepath)) {
                    // console.debug(sourcemap_filepath + " exist!");
                    let sourcemap: any;
                    try {
                        sourcemap = JSON.parse(readFileSync(sourcemap_filepath, 'utf-8'))
                    } catch (error) {
                        console.error('Read&Parse sourcemap:' + sourcemap_filepath + 'failed. ' + error.toString());
                        process.exit(0);
                    }
                    const consumer = await new SourceMapConsumer(sourcemap);
                    !sourcemap_map.has(name) && sourcemap_map.set(name, consumer);
                }
            }
        }
    }
}

const program = new commander.Command();
program.version('0.0.1', '-v, --version');
program.option('-s, --stack <string>', 'stack string which can obtain from JSON.stringfy(Error.stack)', stackStringProcess);
program.option('-i, --msg <string>', 'error message. e.g. Uncaught ReferenceError: a is not defined');
program.option('-m, --map <string>', 'sourcemap dir path. Where to find sourcemap');
program.parse(process.argv);

// console.debug("Check input")
// console.log(program.opts());

if (program.stack && program.msg && program.map) {
    let error_obj: Error = {
        'stack': program.stack,
        'message': program.msg,
        'name': program.msg.split(':')[0]
    }
    let stack_frame_array: ErrorStackParser.StackFrame[] = [];
    try {
        stack_frame_array = ErrorStackParser.parse(error_obj)
    } catch (error) {
        console.error('ErrorStackParser parsing failed' + error.toString());
        process.exit(0);
    }
    // console.debug(stack_frame_array);

    const sourcemap_map = new Map<string, SourceMapConsumer>();

    // 加载全部要用到的sourcemap文件
    loadAllConsumer(program.map, stack_frame_array, sourcemap_map).then(() => {
        // 遍历解析stack_frame_array
        stack_frame_array.forEach(stack_frame => {
            let name = stack_frame.fileName;
            if (sourcemap_map.has(name)) {
                // console.log("using " + name + ".map to mapping!");
                let consumer = sourcemap_map.get(name);
                let origin = consumer.originalPositionFor({
                    line: stack_frame.lineNumber,
                    column: stack_frame.columnNumber
                });
                // console.debug("before analyzed");
                // console.debug(stack_frame);
                // console.debug("after analyzed");
                // console.debug(origin);
                if (origin.line) stack_frame.lineNumber = origin.line;
                if (origin.column) stack_frame.columnNumber = origin.column;
                if (origin.source) stack_frame.fileName = origin.source;
                if (origin.name) stack_frame.functionName = origin.name;
            }
        });

        // 打印结果
        // console.log(stack_frame_array);
        printToConsole(program.msg, stack_frame_array);
    });

    // 解析结束后destroy所有consumer
    for (let consumer of Array.from(sourcemap_map.values())) {
        consumer.destroy();
    }
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

// "ReferenceError: exclued is not defined\n at getParameterByName (http://localhost:7777/logline.min.js:1:99)\n at http://localhost:7777/aabbcc/index.js:15:11"