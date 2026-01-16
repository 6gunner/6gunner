这是2025年最全面的React Native模板，包含了最新的最佳实践 [GitHub](https://github.com/obytes/react-native-template-obytes)[Obytes](https://starter.obytes.com/)：

- **技术栈**: Expo、TypeScript、TailwindCSS、Zustand、React Query、React Hook Form
- **特性**: 完整的认证流程、国际化支持、CI/CD配置、单元测试和E2E测试
- **GitHub**: [https://github.com/obytes/react-native-template-obytes](https://github.com/obytes/react-native-template-obytes)
- **官网**: [https://starter.obytes.com/](https://starter.obytes.com/)

React Query Kit相关细节：

踩坑：
1、安装依赖

光安装npm不行，还需要通过expo install

```
pnpm add xxx

npx expo install xxx
```

2/模拟器代理问题：
![[Pasted image 20250905103726.png]]

expo-router里

`<Stack.Screen>`代表一屏

## 自定义 Header

### 方法1 通过useLayoutEffect

```javascript
// app/profile/edit.js
import { useLayoutEffect, useState } from 'react';
import { useNavigation } from 'expo-router';

export default function EditProfile() {
  const navigation = useNavigation();
  const [hasChanges, setHasChanges] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: hasChanges ? '编辑资料 *' : '编辑资料',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges}
          style={{ opacity: hasChanges ? 1 : 0.5 }}
        >
          <Text style={{ color: '#007AFF' }}>保存</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, hasChanges]);

  return (
    // 页面内容
  );
}

```

### 方法 5 完全自定义

javascript

```javascript
// app/profile/edit.js
import { Stack } from 'expo-router';

function CustomHeader() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 44,
        backgroundColor: '#fff',
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: '#007AFF' }}>取消</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 17, fontWeight: '600' }}>编辑资料</Text>
      <TouchableOpacity onPress={handleSave}>
        <Text style={{ color: '#007AFF' }}>完成</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function EditProfile() {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => <CustomHeader />,
        }}
      />
      {/* 页面内容 */}
    </>
  );
}
```

用户切换前后台，怎么保持网络？以及做网络的检测

列出所有设备：

```
npx react-native run-ios --list-devices // 列出设备

npx react-native run-ios --device "Coda iPhone" // 运行到新设备上
```

expo的命令：

```
npx expo run:ios --device //build ios，并且指定安装到那个模拟器上

npx expo prebuild
```

修改Info.plist后，需要重新编译和安装应用。以下是具体步骤：

**1. 清理缓存和重新编译**

```bash
# 清理React Native缓存
npx react-native start --reset-cache

# 清理iOS编译缓存
cd ios
rm -rf build
rm -rf DerivedData
xcodebuild clean
cd ..

# 或者使用pod清理
cd ios && pod deintegrate && pod install && cd ..
```

**2. 重新安装到模拟器**

```bash
# 卸载旧应用
xcrun simctl uninstall booted com.yourapp.bundleid

# 重新编译安装
npx react-native run-ios
# 指定设备安装
npx react-native run-ios --device

# 或指定模拟器
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### CNG： Continus Native Generation

这是什么？
将react native code 转化成native code

## 一些iOS的安全选项：

```
## 全局配置选项
NSAllowsArbitraryLoads: 允许应用连接到任何 HTTP/HTTPS 服务器. 默认为false
NSAllowsArbitraryLoadsInWebContent: 仅允许 WebView 中的任意加载
NSAllowsLocalNetworking: 允许连接到本地网络（如 localhost、192.168.x.x）


## 域名特定配置选项
NSExceptionAllowsInsecureHTTPLoads: 允许对特定域名进行 HTTP（非加密）连接。 默认是false
NSExceptionMinimumTLSVersion: 指定该域名允许的最低 TLS 版本
NSExceptionAllowsInsecureHTTPLoads: 允许该域名使用 HTTP 连接. 默认是false

```
