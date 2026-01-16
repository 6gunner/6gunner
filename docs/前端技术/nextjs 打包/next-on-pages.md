目前，next打包到cloudflare上，是用`npx @cloudflare/next-on-pages`来打包，
看build log, 最终运行了`next build`命令。

需求是期望能够通过配置不同的打包命令，来让next读取不同的环境变量

**问题点1：**
`npx @cloudflare/next-on-pages`有无方法可以设置`NODE_EVN`?

**问题点2：假设我们以某种方案，修改了`NODE_ENV`环境变量**
目前nextjs只支持development，test, production三种NODE_EVN，虽然可以实现让nextjs打包的时候读取不同的`.env.${NODE_ENV}` 文件，但是不确定这三个对于打包有无影响。
在vite打包的时候，我们是通过设置--mode来让vite读取不同的.env文件的，从而打包出不同的前端代码。
不知道nextjs有无类似机制？

**暂时结论：** nextjs打包到cloudflare的pages上，只能通过cf的env配置区分两套环境，preview以及production。
具体实现：打包所需要的env文件，需要通过`wrangler.toml`或者`wrangler.jsonc`文件来进行配置，从而写到cf本身的runtime env里。

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  /**
   * Environment Variables
   * https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables
   */
  "vars": { "NEXT_PUBLIC_TEST_NAME": "default.example.com" },
  // 下面的env只支持两种配置 for Pages are "preview" and "production".
  "env": {
    "preview": {
      "vars": {
        "NEXT_PUBLIC_TEST_NAME": "preview.example.com"
      }
    },
    "production": {
      "vars": {
        "NEXT_PUBLIC_TEST_NAME": "production.example.com"
      }
    }
  }
}
```

**最终方案：利用nextjs.config.js来实现。**

https://nextjs.org/docs/app/api-reference/config/next-config-js/env

文档里有介绍，在nextjs里export一个env对象，可以让代码里读取到这些env配置。

因此我们只需要打包的时候，设置一个BUILD_ENV，然后通过BUILD_ENV来找到真正的envConfig对象即可。

下面是具体代码:

```ts
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// 环境变量配置
const envConfig = {
  testing: {
    NEXT_PUBLIC_TEST_NAME: 'testing.example.com',
    NEXT_PUBLIC_API_URL: 'https://api-testing.example.com',
  },
  preview: {
    NEXT_PUBLIC_TEST_NAME: 'preview.example.com',
    NEXT_PUBLIC_API_URL: 'https://api-preview.example.com',
  },
  production: {
    NEXT_PUBLIC_TEST_NAME: 'production.example.com',
    NEXT_PUBLIC_API_URL: 'https://api.example.com',
  },
};

// 获取当前环境
const currentEnvConfig = envConfig[process.env.BUILD_ENV] || {};
console.log('currentEnvConfig', JSON.stringify(currentEnvConfig));
// Here we use the @cloudflare/next-on-pages next-dev module to allow us to
// use bindings during local development (when running the application with
// `next dev`). This function is only necessary during development and
// has no impact outside of that. For more information see:
// https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
setupDevPlatform().catch(console.error);

const nextConfig = {
  env: currentEnvConfig,
};

export default nextConfig;
```

对应的package.json里的打包命令如下：

```json
"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "next lint",
		"build:testing": "BUILD_ENV=testing npx @cloudflare/next-on-pages",
		"build:preview": "BUILD_ENV=preview npx @cloudflare/next-on-pages",
		"build:production": "BUILD_ENV=production npx @cloudflare/next-on-pages",
		"preview": "wrangler pages dev",
		"deploy": "wrangler pages deploy",
		"cf-typegen": "wrangler types --env-interface CloudflareEnv env.d.ts"
	},
```

注意：这里不能用&& 连接两个命令

```
1. 使用 && 运算符时，每个命令都在新的子进程中执行

2. 环境变量只在当前进程及其子进程中有效

3. 当使用 && 时，第二个命令在新的子进程中执行，此时第一个命令设置的环境变量已经失效
```
