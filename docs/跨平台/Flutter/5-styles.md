how to set buttons' width and height?

Way1: 使用minimumSize可以设置一个最小的宽、高

Way2: 用fixedSize设置固定的宽、高

```dart
ElevatedButton(
    style: ElevatedButton.styleFrom(
      minimumSize: Size(331, 64),
      // fixedSize: Size(331, 64),
      backgroundColor: Color(0xFFD1631A),
      foregroundColor: Colors.white,
      textStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w400,
        fontFamily: GoogleFonts.anton().fontFamily,
        height: 1.50,
      ),
      shape: RoundedRectangleBorder(
        side: BorderSide(width: 3, color: const Color(0xFF3B322F)),
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    onPressed: () {
      print('name: ${nameController.text}');
      print('password: ${passwordController.text}');
      print('isDarkMode: $isDarkMode');
      print('isRememberMe: $isRememberMe');
      print('dropdownValue: $dropdownValue');
    },
    child: Text('Save'),
  ),
```