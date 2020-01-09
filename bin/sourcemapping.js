#!/usr/bin/env node
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path = require("path");
var ErrorStackParser = require("error-stack-parser");
var commander = require("commander");
var fs_1 = require("fs");
var source_map_1 = require("source-map");
var raw_stack_string_array;
function stackStringProcess(value, previous) {
    // input '\n' will be translated into '\\n' and cause ErrorStackParser parsing failure
    raw_stack_string_array = value.split(String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n"], ["\\n"]))));
    return raw_stack_string_array.join('\n');
}
function printToConsole(error_msg, stack_frames) {
    console.log("----Sourcemap Result----");
    console.log(error_msg);
    for (var _i = 0, stack_frames_1 = stack_frames; _i < stack_frames_1.length; _i++) {
        var frame = stack_frames_1[_i];
        var msg = "    at ";
        if (frame.functionName)
            msg += frame.functionName + " ";
        msg += "(";
        if (frame.fileName)
            msg += frame.fileName + ":";
        if (frame.lineNumber)
            msg += frame.lineNumber + ":";
        if (frame.columnNumber)
            msg += frame.columnNumber;
        msg += ")";
        console.log(msg);
    }
    console.log("------------------------");
}
function loadAllConsumer(dir_path, stack_frame_array, sourcemap_map) {
    return __awaiter(this, void 0, void 0, function () {
        var sourcemap_list, regExp, _i, stack_frame_array_1, frame, name_1, sourcemap_filepath, sourcemap, consumer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sourcemap_list = new Set();
                    regExp = /.+\/(.+)$/;
                    _i = 0, stack_frame_array_1 = stack_frame_array;
                    _a.label = 1;
                case 1:
                    if (!(_i < stack_frame_array_1.length)) return [3 /*break*/, 4];
                    frame = stack_frame_array_1[_i];
                    if (!frame.hasOwnProperty('fileName')) return [3 /*break*/, 3];
                    name_1 = regExp.exec(frame.fileName)[1];
                    frame.fileName = name_1;
                    if (!!sourcemap_list.has(name_1)) return [3 /*break*/, 3];
                    sourcemap_list.add(name_1);
                    sourcemap_filepath = path.join(dir_path, name_1 + '.map');
                    if (!fs_1.existsSync(sourcemap_filepath)) return [3 /*break*/, 3];
                    sourcemap = void 0;
                    try {
                        sourcemap = JSON.parse(fs_1.readFileSync(sourcemap_filepath, 'utf-8'));
                    }
                    catch (error) {
                        console.error('Read&Parse sourcemap:' + sourcemap_filepath + 'failed. ' + error.toString());
                        process.exit(0);
                    }
                    return [4 /*yield*/, new source_map_1.SourceMapConsumer(sourcemap)];
                case 2:
                    consumer = _a.sent();
                    !sourcemap_map.has(name_1) && sourcemap_map.set(name_1, consumer);
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var program = new commander.Command();
program.version('0.0.1', '-v, --version');
program.option('-s, --stack <string>', 'stack string which can obtain from JSON.stringfy(Error.stack)', stackStringProcess);
program.option('-m, --map <string>', 'sourcemap dir path. Where to find sourcemap');
program.parse(process.argv);
if (program.stack && program.map) {
    var msgExp = /^(.+)\n/;
    var msg_1 = msgExp.exec(program.stack)[1];
    if (!msg_1) {
        console.error('Error message parsing failed, please check input stack which must contain error message. \ne.g. Uncaught ReferenceError: a is not defined\\n');
        process.exit(0);
    }
    var error_obj = {
        'stack': program.stack,
        'message': msg_1,
        'name': msg_1.split(':')[0]
    };
    var stack_frame_array_2 = [];
    try {
        stack_frame_array_2 = ErrorStackParser.parse(error_obj);
    }
    catch (error) {
        console.error('ErrorStackParser parsing failed' + error.toString());
        process.exit(0);
    }
    var sourcemap_map_1 = new Map();
    // 加载全部要用到的sourcemap文件
    loadAllConsumer(program.map, stack_frame_array_2, sourcemap_map_1).then(function () {
        // 遍历解析stack_frame_array
        stack_frame_array_2.forEach(function (stack_frame) {
            var name = stack_frame.fileName;
            if (sourcemap_map_1.has(name)) {
                // console.log("using " + name + ".map to mapping!");
                var consumer = sourcemap_map_1.get(name);
                var origin_1 = consumer.originalPositionFor({
                    line: stack_frame.lineNumber,
                    column: stack_frame.columnNumber
                });
                if (origin_1.line)
                    stack_frame.lineNumber = origin_1.line;
                if (origin_1.column)
                    stack_frame.columnNumber = origin_1.column;
                if (origin_1.source)
                    stack_frame.fileName = origin_1.source;
                if (origin_1.name)
                    stack_frame.functionName = origin_1.name;
            }
        });
        // 打印结果
        printToConsole(msg_1, stack_frame_array_2);
    });
    // 解析结束后destroy所有consumer
    for (var _i = 0, _a = Array.from(sourcemap_map_1.values()); _i < _a.length; _i++) {
        var consumer = _a[_i];
        consumer.destroy();
    }
}
else {
    console.error("No error stack string OR error msg string OR sourcemap dir found. Please Check input.");
}
var templateObject_1;
/**
 * Sample input:
    stack: "ReferenceError: exclued is not defined\n at getParameterByName (http://localhost:7777/logline.min.js:1:9827)\n at http://localhost:7777/aabbcc/index.js:15:11"
    message: "Uncaught ReferenceError: exclued is not defined",
    map: ".test"

 * What stack_frame_array looks like?

    [ { columnNumber: 37,
        lineNumber: 7,
        fileName: 'http://localhost:7777/aabbcc/index.js',
        functionName: 'getParameterByName',
        source:
        '    at getParameterByName (http://localhost:7777/aabbcc/index.js:7:37)' },
    { columnNumber: 11,
        lineNumber: 15,
        fileName: 'http://localhost:7777/aabbcc/index.js',
        source: '    at http://localhost:7777/aabbcc/index.js:15:11' } ]
 */ 
//# sourceMappingURL=sourcemapping.js.map