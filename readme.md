# Sourcemapping

## 介绍

一个本地JavaScript混淆堆栈解析工具，用于收集外网JavaScript错误日志的解析。考虑到发布环境不attach sourcemap文件，收集到的错误堆栈都是混淆过的，需要一个解析工具进行解析，映射到源文件。本工具基于官方映射工具[source-map](https://github.com/mozilla/source-map)，专门针对前端`window.onerror`捕捉到的JSON.stringfy(Error.stack)进行解析，生成映射到源码后的堆栈。

## 用法

### 安装

```powershell
npm install sourcemapping -g
```

```powershell
Usage: sourcemapping [options]

Options:
  -v, --version         output the version number
  -s, --stack <string>  stack string which can obtain from JSON.stringfy(Error.stack)
  -i, --msg <string>    error message. e.g. Uncaught ReferenceError: a is not defined
  -m, --map <string>    sourcemap dir path. Where to find sourcemap
  -h, --help            output usage information

sourcemapping -s "ReferenceError: exclued is not defined\n    at getParameterByName (http://localhost:7777/aabbcc/logline.min.js:1:9827)\n    at http://localhost:7777/aabbcc/index.js:15:11" -i "Uncaught ReferenceError: exclued is not defined" -m "./test"
```

### 输出

```powershell
----Sourcemap Result----
Uncaught ReferenceError: exclued is not defined
    at Logline (../src/logline.js:62:31)
    at (index.js:15:11)
------------------------
```
