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
* logcat输出日志到文件
```bash
adb logcat > fileName
adb logcat -v pid > filename # 仅输出某进程的日志到文件
```
* as run 的过程：

参考：[在 AndroidStudio 工程点击 Run 按钮， 实际上做了什么操作呢？ - fengma chu的回答 - 知乎
https://www.zhihu.com/question/65289196/answer/230459927](https://www.zhihu.com/question/65289196/answer/230459927)

assembledebug之后执行了如下命令：
```bash
09/06 16:48:23: Launching app
$ adb push /Users/denglin03/Desktop/baidu/searchbox-android/client/app/build/outputs/apk/debug/app-debug.apk /data/local/tmp/com.baidu.searchbox
$ adb shell pm install -t -r "/data/local/tmp/com.baidu.searchbox"
Success


$ adb shell am start -n "com.baidu.searchbox/com.baidu.searchbox.SplashActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER
```

* 查看data目录下文本内容

```bash
denglin03$ adb shell
sagit:/ $ su
sagit:/ # cat /data/data/xx.json
```