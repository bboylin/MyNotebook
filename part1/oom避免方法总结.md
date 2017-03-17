# oom避免方法总结

### 减少对象内存占用：

* 使用轻量数据结构
* 少用ENUM：比static变量占用内存多几倍
* 减少bitmap内存占用：预加载宽高(inJustDecodeBounds=true)，缩小size（缩小2的inSampleSize次幂），改解码方式（一般不太方便），ARGB_8888一个像素32位，换成其他的，但是图片颜色，清晰度什么的会受影响。

### 内存对象复用：

* bitmap:LRUCache
* listview:item view
* recyclerview:view holder
* 避免在onDraw()等频繁执行的方法内创建对象
* stringbuilder/stringbuffer

### 减少内存泄漏

* 优先用application context代替activity context。
* handler：onDestroy()之前remove掉消息队列中的消息和runnable对象，或者static加weakReference引用外部类。
引用链如下：looper->messagequeue->message->handler->outter class
* listener的注销
* cursor,connection关闭。
* 容器中对象泄露。