### Android ADB命令大全
---

android官方文档和awesome-adb已经写的很清楚很全面了，在这里直接给出链接：
* [https://github.com/mzlogin/awesome-adb](https://github.com/mzlogin/awesome-adb)
* [https://developer.android.com/studio/command-line/adb.html?hl=zh-cn#issuingcommands](https://developer.android.com/studio/command-line/adb.html?hl=zh-cn#issuingcommands)

几个注意点：
* 使用`adb shell am start -n 包名/activity相对路径名`启动activity必须设置exported属性为true，不然会抛出异常。
![](./am.jpg)
* 出现grep不是可用命令时候可以给`adb shell`之后的部分加上""
* adb shell进入shell后可以看到很多命令和linux下的命令一样。