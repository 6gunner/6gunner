


## EAS CLI

**EAS CLI Deploy** 是 Expo Application Services (EAS) 的部署命令，用于将 React Native 应用部署到应用商店或进行更新。


**EAS Deploy** 主要用于：

- **OTA 更新** (Over-the-Air) - 无需重新提交应用商店就能推送代码更新
- **预览部署** - 创建可分享的应用预览版本
- **生产发布** - 将更新直接推送给用户



## 安装 EAS CLI
```
npm install -g @expo/eas-cli

# 登录 Expo 账户
eas login

# 配置项目
eas build:configure

# 初始化一个server项目+同步项目， 这个只有第一次用，后面不用了
npx eas-cli@latest init
```

## 创建项目

```shell
# 先在expo控制台创建一个项目，然后在工程里init
npm install --global eas-cli


# 建立项目的link 这是我的projectId
eas init --id 17035213-6de7-4163-9e24-c505c3f06dfd 
```


## 发布流程+命令

```bash

# 先打包文件
pnpm prebuild:production

# 编译ios
pnpm build:production:ios # eas build --platform ios --profile production 

# 安卓的 eas build --platform android --profile production 
# 或者同时构建两个平台 eas build --platform all --profile production

# 上架iOS App Store 
eas submit --platform ios 
# 上架Google Play Store
eas submit --platform android

```

## 其他命令
```

# 部署更新到生产环境
eas update --branch production

# 部署到预览分支
eas update --branch preview

# 自动部署（根据 eas.json 配置）
eas update --auto

# 查看部署状态
eas update:list

# 回滚到之前的版本
eas update:rollback

# 运行开发模式
eas build --profile development --platform ios
```


## Create and run a cloud build for Android

[教程连接](https://github.com/expo/expo/edit/main/docs/pages/tutorial/eas/android-development-build.mdx)


### 打包一个连着开发环境的apk。

```shell
#0 先prebuild
pnpm prebuild #实际上是运行：cross-env EXPO_NO_DOTENV=1 pnpm expo prebuild

#1 用EAS来build
pnpm build:development:android #等同于 eas build --platform android --profile development

# 控制台会给track link, 可以看到打包的日志，然后可以下载apk；

# 但是这个apk安装起来，实际上是一个expo go，会需要启动一个expo server，才能访问app内容。

# 适合本机调试，但是给非技术人员测试，不合适。
```


### 打包一个preview(staging)环境的apk

```shell
#0 同样也是先prebuild,
pnpm prebuild:staging #cross-env APP_ENV=staging pnpm run prebuild

#1 用EAS来build
pnpm build:staging:android #cross-env APP_ENV=staging EXPO_NO_DOTENV=1 eas build --profile staging --platform android

```


### 打包prod环境
```shell
# 先打包文件
pnpm prebuild:production

# 编译ios
pnpm build:production:ios

# 推送到app store
eas submit --platform ios 


```


3、发布我的web应用
```
npx expo export --platform web
eas deploy
# 得到一个url https://obytesapp--m29s3dn1al.expo.app/  不知道有啥用, 可能是用来链接测试的？

```




## Play Store上架：
https://github.com/expo/fyi/blob/main/creating-google-service-account.md

创建google cloud project

创建google service account并且下载json 文件

![[Pasted image 20250925143621.png]]

复制account的email Id： play-console-service-account@android-mvp-472206.iam.gserviceaccount.com

点击manage key - add Key - create a new key- json

打开：[https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com) enable服务