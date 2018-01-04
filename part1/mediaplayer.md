### mediaplayer
----

* Wake Lock Permission - If your player application needs to keep the screen from dimming or the processor from sleeping, or uses the MediaPlayer.setScreenOnWhilePlaying() or MediaPlayer.setWakeMode() methods, you must request this permission.`<uses-permission android:name="android.permission.WAKE_LOCK" />`
* `prepare()`是个耗时操作（fetching，decoding），不应该在UI线程调用，use `prepareAsync()` instead。通过`MediaPlayer.OnPreparedListener`回调通知prepare完成。
* mediaplayer是state-based，切记在正确的状态下调用正确的行为。附上官网状态机：
![](./mediaplayer_state_diagram.gif)
* 记得release。在activity onStop调用：
```java
mediaPlayer.release();
mediaPlayer = null;
```
在activity resumed或者restarted的时候需要重新创建一个player实例。尤其在activity多次横竖屏切换的时候会重新创建多个activity实例，不release的话会占用很多资源。（mediaplayer本身就很占资源的）


参考官方文档：

[https://developer.android.com/reference/android/media/MediaPlayer.html](https://developer.android.com/reference/android/media/MediaPlayer.html)

[https://developer.android.com/guide/topics/media/mediaplayer.html#mediaplayer](https://developer.android.com/guide/topics/media/mediaplayer.html#mediaplayer)