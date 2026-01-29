#### 怎么将包发布到github package里？

1. 手动publish     

package的scope命名要和org或者username一致

配置.npmr



在package.json里配置repository、publishConfig

```
  "repository": {
    "url": "https://github.com/xxxx/abc-lib.git",
    "type": "git"
  },
  "publishConfig": {
    "@nftconfig:registry": "https://npm.pkg.github.com"
  },
```



各个packages里手动pnpm run publish



- [ ] 怎么一键全publish了？

````
项目里维护了script/cli脚本，
npm run ci:release 打包，更新release

pnpm run ci:publish
````



How to 生成change log?

利用changeset来发布

```
npm install @changesets/cli && npx changeset init

pnpm add changeset

npx changeset init

npx changeset 选择要发布的包，并且写一下日志

npx changeset version 生成提交记录

npx changeset tag 打上tag标签
```



