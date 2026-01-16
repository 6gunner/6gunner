

### 1、turbo里的inputs和putputs分别有什么作用？

inputs定义的是任务的依赖项，代表task执行时，需要根据哪些文件判断是否要重新执行任务，可以包含源代码，配置文件，环境变量等；
outputs代表task执行完成后，会生成哪些文件时需要缓存。


```json
{ "pipeline": { "build": { "inputs": ["src/**/*.ts", "package.json"], "outputs": ["dist/**"] } } }
```





2、在packags里，怎么使用一些alias来进行引用，避免使用相对路径；

首先在package.json里，使用

```
"imports": {

"#*": "./src/*"

},
```

其次在tsconfig里使用
```
"paths": {

"#*": ["./src/*"]

}
```

`#*`是nodejs自己带的解析处理的，因此不会和vite里的起冲突；