### Android ADB命令大全
---

android官方文档和awesome-adb已经写的很清楚很全面了，在这里直接给出链接：
* [https://github.com/mzlogin/awesome-adb](https://github.com/mzlogin/awesome-adb)
* [https://developer.android.com/studio/command-line/adb.html?hl=zh-cn#issuingcommands](https://developer.android.com/studio/command-line/adb.html?hl=zh-cn#issuingcommands)

一些补充
* 使用`adb shell am start -n 包名/activity相对路径名`启动activity必须设置exported属性为true，不然会抛出异常。
![](./adb_am.jpg)
* 出现grep不是可用命令时候可以给`adb shell`之后的部分加上""
* adb shell进入shell后可以看到很多命令和linux下的命令一样。
* logcat过滤关键字：
```bash
adb logcat | grep keyword
adb logcat | grep -i keyword # 忽略大小写
adb logcat | grep "^..keyword" # 匹配tag
adb logcat | grep "^E.keyword" # 仅匹配错误tag
# 匹配多个关键字
adb logcat | grep "^..MyApp\|^..MyActivity"
adb logcat | grep -E "^..MyApp|^..MyActivity"
```
