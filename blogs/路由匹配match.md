---
title: 路由匹配 path-to-regexp
description: 使用 path-to-regexp 进行 URL 路径匹配
slug: path-to-regexp
tags: [javascript, routing, regex]
authors: [keyang]
hide_table_of_contents: false
---

使用 path-to-regexp 库进行 URL 路径参数匹配的方法和示例

<!-- truncate -->

path-to-regexp




```
// 使用 path-to-regexp 库
import { pathToRegexp } from 'path-to-regexp';

const keys = [];
const regex = pathToRegexp('/user/:id', keys);
const match = regex.exec('/user/123');

if (match) {
  const params = {};
  keys.forEach((key, index) => {
    params[key.name] = match[index + 1];
  });
  console.log(params); // { id: '123' }
}
```

