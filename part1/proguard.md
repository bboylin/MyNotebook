android 代码混淆
---

1.`release`下开启混淆：app module build.gradle
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```
多module的话在projec的gradle脚本里定义全局的混淆开关，各个module的`minifyEnabled`读取project的`minifyEnabled`

2.`proguard-rules.pro`常用配置
```gradle
#指定压缩级别
-optimizationpasses 5

#不跳过非公共的库的类成员
-dontskipnonpubliclibraryclassmembers

#混淆时采用的算法
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*

#把混淆类中的方法名也混淆了
-useuniqueclassmembernames

#优化时允许访问并修改有修饰符的类和类的成员 
-allowaccessmodification

#将文件来源重命名为“SourceFile”字符串
-renamesourcefileattribute SourceFile
#保留行号
-keepattributes SourceFile,LineNumberTable

#序列化
-keep class * implements android.os.Parcelable {
    public *;
}
-keep class * implements java.io.Serializable {
    public *;
}

#避免混淆Annotation，内部类，范型，匿名类
-keepattributes Exceptions, InnerClasses, Signature, Deprecated,SourceFile, LineNumberTable, *Annotation*, EnclosingMethod

#保持本地native方法不被混淆
-keepclassmembernames class *{
        native <methods>;
}

#Fragment不在AndroidManifest.xml中注册，需要额外保护下
-keep public class * extends android.support.v4.app.Fragment
-keep public class * extends android.app.Fragment

#webview
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}
#保持Javascript接口
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
   public void openFileChooser(...);
}

#-----自定义控件-----#
-keepclasseswithmembers class * {
    public <init>(android.content.Context);
}

-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}

-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}
#-----自定义控件-----#

#保留枚举类不被混淆
-keepclassmembers enum * {
 public static **[] values();
 public static ** valueOf(java.lang.String);
}

# 保持测试相关的代码
-dontnote junit.framework.**
-dontnote junit.runner.**
-dontwarn android.test.**
-dontwarn android.support.test.**
-dontwarn org.junit.**
```

3.检查混淆结果

混淆过的包必须进行检查，避免因混淆引入的bug。

一方面，需要从代码层面检查。使用上文的配置进行混淆打包后在 `<module-name>/build/outputs/mapping/release/` 目录下会输出以下文件：
- dump.txt 
描述APK文件中所有类的内部结构
- mapping.txt
提供混淆前后类、方法、类成员等的对照表
- seeds.txt
列出没有被混淆的类和成员
- usage.txt
列出被移除的代码

我们可以根据 `seeds.txt` 文件检查未被混淆的类和成员中是否已包含所有期望保留的，再根据 `usage.txt` 文件查看是否有被误移除的代码。

另一方面，需要从测试方面检查。将混淆过的包进行全方面测试，检查是否有 bug 产生。我曾经遇到过一个接口中的throw exception混淆后没有了，但是实际上我keep了这个接口，后来通过把这个普通异常改成继承RuntimeException就好了。

4.相关资料：
* [写给 Android 开发者的混淆使用手册](https://www.diycode.cc/topics/380)
* [Android官方文档](https://developer.android.com/studio/build/shrink-code.html?hl=zh-cn#shrink-code)
* [Proguard用户手册](https://stuff.mit.edu/afs/sipb/project/android/sdk/android-sdk-linux/tools/proguard/docs/index.html#/afs/sipb/project/android/sdk/android-sdk-linux/tools/proguard/docs/manual/usage.html)
