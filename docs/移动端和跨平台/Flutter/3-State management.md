普通方式
extends StatefulWidget


state change notify

ValueNotifier: Define value which could change 
ValueListenerBuilder: watch the value when they are changed

```
ValueListenerBuilder {
  valueListenable: counterNotifier, 
  builder: (context, value, child) { return Text('counter: $value'); },
}
```


