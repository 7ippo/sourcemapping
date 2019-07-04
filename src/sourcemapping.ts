#!/usr/bin/env node
import * as ErrorStackParser from 'error-stack-parser';

let error_obj : Error= {
    stack:"ReferenceError: exclued is not defined\n    at getParameterByName (http://localhost:7777/aabbcc/index.js:7:37)\n    at http://localhost:7777/aabbcc/index.js:15:11",
    message:"Uncaught ReferenceError: exclued is not defined",
    name:"Uncaught ReferenceError"
}
console.log(ErrorStackParser.parse(error_obj));