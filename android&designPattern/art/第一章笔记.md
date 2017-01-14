## activity的生命周期和启动模式
---

* 正常情况下生命周期

![](https://github.com/bboylin/MyNotebook/raw/master/android%26designPattern/20160708/pic1.png)

从activity是否在前台来说，onResume和onPause是配对的，从activity是否可见来说，onStart和onStop是配对的（已经可见但是在后台）。
只有当旧的activity的onPause执行完新的activity的onResume才会执行。

1）启动：oncreate,onstart,onresume</br>
2）当前Activity被覆盖或锁屏，onpause</br>
3）从被覆盖回到前台或者解锁屏，onresume</br>
4）跳转到别的activity或者按home键回到主屏，onpause,onstop（当新的activity采用了透明主题的时候不会调用onStop）</br>
5）后退回到此activity，onrestart,onstart,onresume</br>
6）Activity处于被覆盖或者后台不可见状态（即2/4步），由于内存不足被杀死，而后用户退回该activity，同启动过程。oncreate,onstart,onresume</br>
7）用户退出当前activity，onpause,onstop,ondestroy</br>

* 异常情况下生命周期
    * 资源相关配置改变导致activity被销毁并重新创建：比如突然旋转屏幕。view也会同时销毁和恢复。
        * onSaveInstanceState保存activity状态，在onStop之前
        * onRestoreInstanceState恢复数据，在onStart之后。
        * 上述两个只有activity异常终止时才会调用
    * 资源内存不足导致低优先级activity被杀死
        * 优先级排序
            * 前台activity
            * 可见但不在前台（例如弹出一个对话框导致activity不能与用户交互）
            * 后台activity：已经暂停的
    * 避免activity销毁和重新创建

        AndroidManifest.xml中activity增加属性`android:configChanges="orientation|screenSize"`
        
        常用选项：
        * locale：设备本地位置发生了改变，主要指切换了系统语言
        * orientation：旋转屏幕
        * keyboardHidden：键盘可访问性发生了改变，例如用户调出了键盘
        * screenSize：minSdk和targetSdk有大于或者等于13的时候需添加以防止activity重启。
* 启动模式
    * standard（标准启动模式）：
同一（Task）任务栈中可以存在多个Activity(可相同)的实例。先启动的activity放栈底
    * singleTop(Task栈顶单例模式)：
与standard基本相同，但是当要启动的activity已位于task栈顶时，系统不会创建实例，而是直接复用已有的activity实例。并且会调用该实例的onNewIntent()函数将intent传递到该对象。当要启动的activity已在栈内但不位于task栈顶时，和standard一样，创建实例。
    * singleTask（task栈内单例模式）：
和singleTop基本相同，唯一不同在于当要启动的activity已在栈内但不位于task栈顶时会直接将其上的activity弹出栈，并调用activity的onNewIntent()。
    * singleInstance(全局单例模式)：
系统中只有一个该activity实例，第一次创建实例时会在一个全新的Task栈中创建

>任务栈中无任何activity时，该任务栈会被回收。</br>使用ApplicationContext去启动standard模式的activity时会报错，因为standard模式的activity会默认进入启动他的activity所属的任务栈中，但是Context并没有所谓的任务栈。解决办法是改成singleTask模式启动。

标识Activity任务栈名称的属性：TaskAffinity，默认为应用包名。使用命令`adb shell dumpsys activity`查看任务栈
* 给activity指定启动模式
    * AndroidManifest中指定：`android:launchMode="singleTask"`
    * intent中设置标志位：`intent.addFlags(INTENT.FLAG_ACTIVITY_NEW_TASK)`
    * 上述两种方法的区别：第二种优先级更高。第一种方法无法直接设置`FLAG_ACTIVITY_CLEAR_TOP`；第二种无法指定singleInstance模式。

* IntentFilter的匹配规则
    * action匹配规则：要求intent中的action存在且必须和过滤规则中的其中一个相同 区分大小写；
    * category匹配规则：系统会默认加上一个android.intent.category.DEAFAULT，所以intent中可以不存在category，但如果存在就必须匹配其中一个；
    * data匹配规则：data由两部分组成，mimeType和URI，要求和action相似。如果没有指定URI，URI默认值为content和file（schema）
    