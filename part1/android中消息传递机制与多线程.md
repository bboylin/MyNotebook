<h2><center>android中的消息机制和多线程</center></h2>
###<li>handler的消息传递机制
android 只允许UI线程修改UI组件，所以子线程需要消息传递给UI线程来更改UI组件</br>
####handler类的主要作用：
<li>子线程中发送消息
<li>主线程接收处理消息
</br>handler应该在主线程中创建。如在子线程中，必须初始化一个Looper。Looper.prepare()方法保证每个线程中只有一个Looper对象</br>
####Looper/MessageQueue/Handler各自的作用如下：
<li>looper:每个线程只有一个，不断从MessageQueue中取出消息，将消息分发给handler处理
<li>MessageQueue:由looper管理，先进先出的消息队列，不断接受来自handler的消息
<li>handler:消息发送给MessageQueue，然后处理来自looper的消息。
###<li>AysncTask
先来看看AysncTask的定义：
<pre><code>public abstract class AsyncTask< Params,Progress,Result>{}</code></pre>
三个泛型分别表示参数类型，进度类型，返回结果类型。如果不需要的话可以设为void
一个异步任务的执行通常有以下几个步骤
<li>execute(Params...params)：在代码中调用，触发异步任务的执行
<li>onPreExecute()：在execute(Params...params)调用前执行，执行在UI线程中，在执行后台任务之前对UI组件进行标记
<li>doInBackground()：在execute(Params...params)之后调用，执行耗时操作，接收输入参数和返回结果，执行过程中可以调用PublishProgress(Progress...values)来更新进度信息
<li>onProgressUpdate(Progress...values)：直接在UI中更新进度，显示在UI组件上
<li>onPostExecute(Result result)：执行在UI线程，将doInBackground()执行的结果作为参数传递到此方法中，结果直接显示在UI组件
使用时要注意的几点：
<li>实例在UI线程创建
<li>execute(Params...params)在UI线程调用
<li>不能在doInBackground()中更改UI组件
<li>一个实例只能execute一次。

---

#### handler可能被忽略的几个点

构造函数：
```java
    /**
     * Use the provided {@link Looper} instead of the default one and take a callback
     * interface in which to handle messages.  Also set whether the handler
     * should be asynchronous.
     *
     * Handlers are synchronous by default unless this constructor is used to make
     * one that is strictly asynchronous.
     *
     * Asynchronous messages represent interrupts or events that do not require global ordering
     * with respect to synchronous messages.  Asynchronous messages are not subject to
     * the synchronization barriers introduced by conditions such as display vsync.
     *
     * @param looper The looper, must not be null.
     * @param callback The callback interface in which to handle messages, or null.
     * @param async If true, the handler calls {@link Message#setAsynchronous(boolean)} for
     * each {@link Message} that is sent to it or {@link Runnable} that is posted to it.
     *
     * @hide
     */
    public Handler(Looper looper, Callback callback, boolean async) {
        mLooper = looper;
        mQueue = looper.mQueue;
        mCallback = callback;
        mAsynchronous = async;
    }
    
    public Handler(Callback callback, boolean async) {
        if (FIND_POTENTIAL_LEAKS) {
            final Class<? extends Handler> klass = getClass();
            if ((klass.isAnonymousClass() || klass.isMemberClass() || klass.isLocalClass()) &&
                    (klass.getModifiers() & Modifier.STATIC) == 0) {
                Log.w(TAG, "The following Handler class should be static or leaks might occur: " +
                    klass.getCanonicalName());
            }
        }

        mLooper = Looper.myLooper();
        if (mLooper == null) {
            throw new RuntimeException(
                "Can't create handler inside thread " + Thread.currentThread()
                        + " that has not called Looper.prepare()");
        }
        mQueue = mLooper.mQueue;
        mCallback = callback;
        mAsynchronous = async;
    }
```
所有构造函数都是从这俩构造函数衍生而来，注意到可以传入callback来优先处理msg，sync为true表示其中每隔msg都是异步的，区别于sync msg。
同时很容易知道：内部类handler必须是static的，不然容易内存泄漏。除了主线程外Looper.prepare()必须在创建handler前调，不然looper为null。

looper循环的时候会取messagequeue头部msg，调msg宿主handler的dispatchMessage方法：
```java
    /**
     * Handle system messages here.
     */
    public void dispatchMessage(Message msg) {
        if (msg.callback != null) {
            handleCallback(msg);
        } else {
            if (mCallback != null) {
                if (mCallback.handleMessage(msg)) {
                    return;
                }
            }
            handleMessage(msg);
        }
    }
```
可以看到处理顺序是：先msg自身的callback，再handler自身的callback，再是handler子类重写的handleMessage。每层拦截了就不会向下传递。

为什么主线程不需要创建handler前调用Looper.prepare()：
```java
    public static void main(String[] args) {
        Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "ActivityThreadMain");

        // CloseGuard defaults to true and can be quite spammy.  We
        // disable it here, but selectively enable it later (via
        // StrictMode) on debug builds, but using DropBox, not logs.
        CloseGuard.setEnabled(false);

        Environment.initForCurrentUser();

        // Set the reporter for event logging in libcore
        EventLogger.setReporter(new EventLoggingReporter());

        // Make sure TrustedCertificateStore looks in the right place for CA certificates
        final File configDir = Environment.getUserConfigDirectory(UserHandle.myUserId());
        TrustedCertificateStore.setDefaultUserDirectory(configDir);

        Process.setArgV0("<pre-initialized>");

        Looper.prepareMainLooper();

        // Find the value for {@link #PROC_START_SEQ_IDENT} if provided on the command line.
        // It will be in the format "seq=114"
        long startSeq = 0;
        if (args != null) {
            for (int i = args.length - 1; i >= 0; --i) {
                if (args[i] != null && args[i].startsWith(PROC_START_SEQ_IDENT)) {
                    startSeq = Long.parseLong(
                            args[i].substring(PROC_START_SEQ_IDENT.length()));
                }
            }
        }
        ActivityThread thread = new ActivityThread();
        thread.attach(false, startSeq);

        if (sMainThreadHandler == null) {
            sMainThreadHandler = thread.getHandler();
        }

        if (false) {
            Looper.myLooper().setMessageLogging(new
                    LogPrinter(Log.DEBUG, "ActivityThread"));
        }

        // End of event ActivityThreadMain.
        Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
        Looper.loop();

        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
```
ActivityThread实例化的时候已经创建了looper循环。