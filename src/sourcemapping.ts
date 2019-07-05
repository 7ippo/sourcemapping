#!/usr/bin/env node
import * as ErrorStackParser from 'error-stack-parser';
import * as commander from 'commander';
let raw_stack_string_array: string[];

function stackStringProcess(value: any, previous: any): string {
    // input '\n' will be translated into '\\n' and cause ErrorStackParser parsing failure
    raw_stack_string_array = value.split(String.raw`\n`);
    return raw_stack_string_array.join('\n');
}

function printToConsole(error_msg: string, stack_frames: ErrorStackParser.StackFrame[]): void{

}

const program = new commander.Command();
program.version('0.0.1', '-v, --version');
program.option('-s, --stack <string>', 'stack string which can obtain from JSON.stringfy(Error.stack)', stackStringProcess);
program.option('-i, --msg <string>', 'error message. e.g. Uncaught ReferenceError: a is not defined');
program.option('-m, --map <string>', 'sourcemap dir. Where to find sourcemap');
program.parse(process.argv);

console.debug("Check input")
console.log(program.opts());

if (program.stack && program.msg) {
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
    // TODO: Translate line/column/fileName using sourcemap
    // stack_frame_array.forEach(stack_frame => {
    // });
} else {
    console.error("No error stack string or error msg string found. Please Check input.");
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