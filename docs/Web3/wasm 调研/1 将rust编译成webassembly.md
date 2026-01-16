## 将rust编译成WebAssembly



将一个applicaiton的一部分编译成WebAssembly，然后在前端js里用rust。



编译器：使用`wasm-pack`作为编译器，将rust代码编程成js package。打包出来的产物只包含WebAssembly和JS代码，用户是对rust无感知的。



### 依赖安装

`wasm-pack`的安装

```
cargo install wasm-pack
```





`wasm-pack`用`wasm-bindgen`来实现rust和js之间的通信，它在js和rust之间做了类型的映射。

既允许js通过字符串的形式调用rust的api；也允许rust来调用js的方法。



https://rustwasm.github.io/wasm-bindgen/examples/import-js.html



### Hello-world 代码实现



首先声明引用

```
use wasm_bindgen::prelude::*;
```



接着看这段代码：

```
#[wasm_bindgen]
extern "C"{
    pub fn alert(s: &str);
}
```

这个`#[wasm_bindgen]` attribute可以通过`extern {}` 来导入js的方法。

`alert`对应的就是`window.alert`方法。



再下面这段代码

```
#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

```

通过声明`#[wasm_bindgen]`，我们希望能够将greet方法对外提供。意味着js能够调用greet方法。



### 编译rust项目

将rust编译打包成wasm

首先修改rust项目的cargo.toml

```toml
[package]
name = "hello-wasm"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
crate-type = ["cdylib"] # 对于wasm的产物，都是用这个类型

[dependencies]
wasm-bindgen = "0.2"

```

以web的类型执行打包命令

```
wasm-pack build --target web
```



打包后文件如图所示：

![image-20220428165414339](https://ipic-coda.oss-cn-beijing.aliyuncs.com/20220428/image-20220428165414339.png)





### 在web端测试

打包完成后我们写一个web项目来测试一下

```shell
mkdir hello-wasm-web
cd hello-wasm-web
npm init -y
npm install webpack webpack-cli --save-dev
npm install @wasm-tool/wasm-pack-plugin --save-dv
npm intall text-encoding --save
```

webpack.config.js配置文件如下：

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "."),
    }),
    // Have this example work in Edge which doesn't ship `TextEncoder` or
    // `TextDecoder` at this time.
    new webpack.ProvidePlugin({
      TextDecoder: ["text-encoding", "TextDecoder"],
      TextEncoder: ["text-encoding", "TextEncoder"],
    }),
  ],
  mode: "development",
  experiments: {
    asyncWebAssembly: true,
  },
};

```



将打包后的pkg文件夹拷贝到项目里来

![image-20220428165732559](https://ipic-coda.oss-cn-beijing.aliyuncs.com/20220428/image-20220428165732559.png)

然后在index.js里引入wasm的module

```js
import init, { greet } from "./pkg/hello_wasm";

init().then(() => {
  greet("WebAssembly");
});

```

运行`npm run serve`

可以成功的看到页面上alert一个"Hello, WebAssembly!";



### 以npm bundle的形式打包

打包rust的命令稍微有点不同：

```
wasm-pack build --target bundler
```

在web项目里引用的方式会不一样

```js
// 
// 以bundle的形式打包
import { greet } from "./pkg/hello_wasm";
greet("WebAssembly");

// 下面的写法依赖于webpack5
// const rust = import("./pkg/hello_wasm.js");
// rust
//   .then((m) => {
//     m.greet("WebAssembly with NPM");
//   })
//   .catch(console.error);



```

