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

