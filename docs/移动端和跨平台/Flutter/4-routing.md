```
Navigator.push(context,  MaterialPageRoute(builder: (context) {
  return SettingsPage();
}))
```

需要保证SettingsPage是一个Scaffold widget

push和pushReplacement的区别：push会将route压入栈里，可以后退返回。
但是pushReplacement只会全部替换，无法回退。

Navigator.pop(context); // 可以清除dialog
