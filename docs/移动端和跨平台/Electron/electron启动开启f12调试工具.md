

在main进程里调用
```typescript
const appWindow = new BrowserWindow(windowOptions);
// 省略...
appWindow.webContents.openDevTools()
```