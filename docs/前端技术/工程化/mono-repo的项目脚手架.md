我希望你帮我生成一个脚手架项目

输出的目标是一个使用turbo来搭建的mono repo项目

输出项目 依赖项主要如下：

`package.json`

```
{
  "name": "zkj-chain-web",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "build:testing": "turbo build:testing",
    "build:preview": "turbo build:preview",
    "build:production": "turbo build:production",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "knip": "turbo knip",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "cf:dev": "wrangler dev src/index.mjs --local"
  },
  "dependencies": {
    "@tanstack/react-query": "5.32.0"
  },
  "devDependencies": {
    "@types/node": "18.11.3",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "eslint-plugin-simple-import-sort": "^12.1.0",
    "husky": "^8.0.3",
    "knip": "^5.27.3",
    "lint-staged": "^15.2.7",
    "prettier": "^3.2.5",
    "turbo": "^2.1.2",
    "typescript": "^5.4.5",
    "wrangler": "^3.78.10",
    "@ianvs/prettier-plugin-sort-imports": "^4.3.1"
  },
  "packageManager": "pnpm@8.15.6",
  "engines": {
    "node": ">=18"
  },
  "pnpm": {
    "overrides": {
      "@solana/web3.js": "~1.98.0"
    }
  }
}

```



