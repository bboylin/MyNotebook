## 《Android开发艺术探索》第二章笔记：IPC机制
---

Android中使用多进程（此处指一个应用多个进程）的方法有：
* 给四大组件在AndroidManifest中指定android:process属性，最常用。
* 通过JNI在native层去fork一个进程，特殊情况。

通常默认的进程名是包名，以：开头的进程属于当前应用的私有进程而进程名不以：开头的属于全局进程，其他应用可以通过相同的ShareUID和签名与其跑在同一个进程中。每个应用都有一个唯一的ShareUID,具有相同ShareUID的应用可以共享数据。

多进程带来的问题主要是不同进程中的四大组件不能通过内存来共享数据。
* 静态变量和单例模式完全失效
* 线程同步机制完全失效
* Sharedpreference可靠性降低
* Application会多次创建

IPC基础概念：
* [Serializable和Parcelable的区别](https://github.com/bboylin/MyNoteBook/tree/master/android&designPattern/20170111/Serializable和Parcelable的区别.md)
* Binder：略。

Android中的IPC方式：Bundle（传输的数据必须能够序列化），共享文件，Binder，ContentProvider,网络通信。
* 使用bundle：除了直接传递数据的情况，一种特殊的场景是A进程执行耗时计算，得到结果后启动B的一个组件并将计算结果传递到B进程。而计算结果不支持放入Bundle中。
这时候可以让A通过Intent启动进程B的一个service组件，让service后台计算，计算完了以后就启动真正需要的目标组件。
* 使用文件共享：在数据同步要求不高的情况下，并发读/并发写可能导致问题，可使用序列化。
* 使用Messenger：基于AIDL的轻量级IPC方案。略。
* AIDL
to be continued