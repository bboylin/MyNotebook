Toast源码分析
---


* Toast,的duration参数可选值中LENGTH_SHORT（值为0，2000ms）, LENGTH_LONG（值为1，3500ms）之一
```java
...

    /** @hide */
    @IntDef({LENGTH_SHORT, LENGTH_LONG})
    @Retention(RetentionPolicy.SOURCE)
    public @interface Duration {}

...

    /**
     * Set how long to show the view for.
     * @see #LENGTH_SHORT
     * @see #LENGTH_LONG
     */
    public void setDuration(@Duration int duration) {
        mDuration = duration;
        mTN.mDuration = duration;
    }

...
```
虽然这样，但是实际传入duration参数不为二者也行，依然是显示2000ms。
```java
long delay = r.duration == Toast.LENGTH_LONG ? LONG_DELAY : SHORT_DELAY;
```
* 可以在非 UI 线程里调用 Toast，但是得是一个有 Looper 的线程。
* 应用在后台时可以弹出 Toast。
* `makeText(Context context, CharSequence text, @Duration int duration)`主要是创建Toast对象，设置背景为默认view
```java
    /**
     * Make a standard toast that just contains a text view.
     *
     * @param context  The context to use.  Usually your {@link android.app.Application}
     *                 or {@link android.app.Activity} object.
     * @param text     The text to show.  Can be formatted text.
     * @param duration How long to display the message.  Either {@link #LENGTH_SHORT} or
     *                 {@link #LENGTH_LONG}
     *
     */
    public static Toast makeText(Context context, CharSequence text, @Duration int duration) {
        return makeText(context, null, text, duration);
    }

    /**
     * Make a standard toast to display using the specified looper.
     * If looper is null, Looper.myLooper() is used.
     * @hide
     */
    public static Toast makeText(@NonNull Context context, @Nullable Looper looper,
            @NonNull CharSequence text, @Duration int duration) {
        Toast result = new Toast(context, looper);

        LayoutInflater inflate = (LayoutInflater)
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View v = inflate.inflate(com.android.internal.R.layout.transient_notification, null);
        TextView tv = (TextView)v.findViewById(com.android.internal.R.id.message);
        tv.setText(text);

        result.mNextView = v;
        result.mDuration = duration;

        return result;
    }
```
来看看Toast构造函数做了啥
```java
    public Toast(Context context) {
        this(context, null);
    }

    /**
     * Constructs an empty Toast object.  If looper is null, Looper.myLooper() is used.
     * @hide
     */
    public Toast(@NonNull Context context, @Nullable Looper looper) {
        mContext = context;
        mTN = new TN(context.getPackageName(), looper);
        mTN.mY = context.getResources().getDimensionPixelSize(
                com.android.internal.R.dimen.toast_y_offset);
        mTN.mGravity = context.getResources().getInteger(
                com.android.internal.R.integer.config_toastDefaultGravity);
    }
```
主要就是构造了一个 TN 对象，计算了位置。TN创建时候主要是设置layoutParams，looper，和handler。
```java
		TN(String packageName, @Nullable Looper looper) {
            // XXX This should be changed to use a Dialog, with a Theme.Toast
            // defined that sets up the layout params appropriately.
            final WindowManager.LayoutParams params = mParams;
            params.height = WindowManager.LayoutParams.WRAP_CONTENT;
            params.width = WindowManager.LayoutParams.WRAP_CONTENT;
            params.format = PixelFormat.TRANSLUCENT;
            params.windowAnimations = com.android.internal.R.style.Animation_Toast;
            params.type = WindowManager.LayoutParams.TYPE_TOAST;
            params.setTitle("Toast");
            params.flags = WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                    | WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                    | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;

            mPackageName = packageName;

            if (looper == null) {
                // Use Looper.myLooper() if looper is not specified.
                looper = Looper.myLooper();
                if (looper == null) {
                    throw new RuntimeException(
                            "Can't toast on a thread that has not called Looper.prepare()");
                }
            }
            mHandler = new Handler(looper, null) {
                @Override
                public void handleMessage(Message msg) {
                    switch (msg.what) {
                        case SHOW: {
                            IBinder token = (IBinder) msg.obj;
                            handleShow(token);
                            break;
                        }
                        case HIDE: {
                            handleHide();
                            // Don't do this in handleHide() because it is also invoked by
                            // handleShow()
                            mNextView = null;
                            break;
                        }
                        case CANCEL: {
                            handleHide();
                            // Don't do this in handleHide() because it is also invoked by
                            // handleShow()
                            mNextView = null;
                            try {
                                getService().cancelToast(mPackageName, TN.this);
                            } catch (RemoteException e) {
                            }
                            break;
                        }
                    }
                }
            };
        }
```

接下来来看看`show()`方法：
```java
    public void show() {
        if (mNextView == null) {
            throw new RuntimeException("setView must have been called");
        }

        INotificationManager service = getService();
        String pkg = mContext.getOpPackageName();
        TN tn = mTN;
        tn.mNextView = mNextView;

        try {
            service.enqueueToast(pkg, tn, mDuration);
        } catch (RemoteException e) {
            // Empty
        }
    }
```
调用了 INotificationManager 的 enqueueToast 方法，INotificationManager 是一个接口，其实现类在 NotificationManagerService 里，我们来看 enqueueToast 方法的实现：
```java
@Override
        public void enqueueToast(String pkg, ITransientNotification callback, int duration)
        {
            ......
            synchronized (mToastQueue) {
                int callingPid = Binder.getCallingPid();
                long callingId = Binder.clearCallingIdentity();
                try {
                    ToastRecord record;
                    int index;
                    // All packages aside from the android package can enqueue one toast at a time
                    if (!isSystemToast) {
                        index = indexOfToastPackageLocked(pkg);
                    } else {
                        index = indexOfToastLocked(pkg, callback);
                    }

                    // If the package already has a toast, we update its toast
                    // in the queue, we don't move it to the end of the queue.
                    if (index >= 0) {
                        record = mToastQueue.get(index);
                        record.update(duration);
                        record.update(callback);
                    } else {
                        Binder token = new Binder();
                        mWindowManagerInternal.addWindowToken(token, TYPE_TOAST, DEFAULT_DISPLAY);
                        record = new ToastRecord(callingPid, pkg, callback, duration, token);
                        mToastQueue.add(record);
                        index = mToastQueue.size() - 1;
                    }
                    keepProcessAliveIfNeededLocked(callingPid);
                    // If it's at index 0, it's the current toast.  It doesn't matter if it's
                    // new or just been updated.  Call back and tell it to show itself.
                    // If the callback fails, this will remove it from the list, so don't
                    // assume that it's valid after this.
                    if (index == 0) {
                        showNextToastLocked();
                    }
                } finally {
                    Binder.restoreCallingIdentity(callingId);
                }
            }
        }
```
主要就是使用调用方传来的包名、callback 和 duration 构造一个 ToastRecord，然后添加到 mToastQueue 中。如果在 mToastQueue 中已经存在该包名和 callback 的 Toast，则只更新其 duration。接着来看`showNextToastLocked();`:
```java
    @GuardedBy("mToastQueue")
    void showNextToastLocked() {
        ToastRecord record = mToastQueue.get(0);
        while (record != null) {
            if (DBG) Slog.d(TAG, "Show pkg=" + record.pkg + " callback=" + record.callback);
            try {
                record.callback.show(record.token);
                scheduleTimeoutLocked(record);
                return;
            } catch (RemoteException e) {
                ......
            }
        }
    }

    @GuardedBy("mToastQueue")
    void cancelToastLocked(int index) {
        ToastRecord record = mToastQueue.get(index);
        try {
            record.callback.hide();
        } catch (RemoteException e) {
            Slog.w(TAG, "Object died trying to hide notification " + record.callback
                    + " in package " + record.pkg);
            // don't worry about this, we're about to remove it from
            // the list anyway
        }

        ToastRecord lastToast = mToastQueue.remove(index);
        mWindowManagerInternal.removeWindowToken(lastToast.token, true, DEFAULT_DISPLAY);

        keepProcessAliveIfNeededLocked(record.pid);
        if (mToastQueue.size() > 0) {
            // Show the next one. If the callback fails, this will remove
            // it from the list, so don't assume that the list hasn't changed
            // after this point.
            showNextToastLocked();
        }
    }

    @GuardedBy("mToastQueue")
    private void scheduleTimeoutLocked(ToastRecord r)
    {
        mHandler.removeCallbacksAndMessages(r);
        Message m = Message.obtain(mHandler, MESSAGE_TIMEOUT, r);
        long delay = r.duration == Toast.LENGTH_LONG ? LONG_DELAY : SHORT_DELAY;
        mHandler.sendMessageDelayed(m, delay);
    }

    private void handleTimeout(ToastRecord record)
    {
        if (DBG) Slog.d(TAG, "Timeout pkg=" + record.pkg + " callback=" + record.callback);
        synchronized (mToastQueue) {
            int index = indexOfToastLocked(record.pkg, record.callback);
            if (index >= 0) {
                cancelToastLocked(index);
            }
        }
    }

    protected class WorkerHandler extends Handler
    {
        public WorkerHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg)
        {
            switch (msg.what)
            {
                case MESSAGE_TIMEOUT:
                    handleTimeout((ToastRecord)msg.obj);
                    ......
```
这里混入了其他的方法，一块来分析。`showNextToastLocked`展示toast之后调用`scheduleTimeoutLocked`让handler在duration时间之后发一个timeout的message，`WorkerHandler`接收到这个message调用`handleTimeout`，`handleTimeout`间接调用`cancelToastLocked`取消toast，如果队列里还有toast则取出第一个调用`showNextToastLocked`展示。可以看到实际上的show和cancel都是通过`record.callback.show(record.token);`和`record.callback.hide();`进行的。那么callback是啥呢？它是`ITransientNotification`类型的变量，`ITransientNotification`是aidl接口，而TN恰好实现了这个接口的方法，事实上它就是调用的TN方法。
```java
package android.app;

/** @hide */
oneway interface ITransientNotification {
    void show(IBinder windowToken);
    void hide();
}
private static class TN extends ITransientNotification.Stub {
	......
	    /**
         * schedule handleShow into the right thread
         */
        @Override
        public void show(IBinder windowToken) {
            if (localLOGV) Log.v(TAG, "SHOW: " + this);
            mHandler.obtainMessage(SHOW, windowToken).sendToTarget();
        }

        /**
         * schedule handleHide into the right thread
         */
        @Override
        public void hide() {
            if (localLOGV) Log.v(TAG, "HIDE: " + this);
            mHandler.obtainMessage(HIDE).sendToTarget();
        }

        public void cancel() {
            if (localLOGV) Log.v(TAG, "CANCEL: " + this);
            mHandler.obtainMessage(CANCEL).sendToTarget();
        }

```
可以看到是通过handler创建一个message后发送出去：
```java
    public void sendToTarget() {
        target.sendMessage(this);
    }
```
注释说的很清楚发送之后，toast在handleShow(token)中展示：
```java
        public void handleShow(IBinder windowToken) {
            if (localLOGV) Log.v(TAG, "HANDLE SHOW: " + this + " mView=" + mView
                    + " mNextView=" + mNextView);
            // If a cancel/hide is pending - no need to show - at this point
            // the window token is already invalid and no need to do any work.
            if (mHandler.hasMessages(CANCEL) || mHandler.hasMessages(HIDE)) {
                return;
            }
            if (mView != mNextView) {
                // remove the old view if necessary
                handleHide();
                mView = mNextView;
                Context context = mView.getContext().getApplicationContext();
                String packageName = mView.getContext().getOpPackageName();
                if (context == null) {
                    context = mView.getContext();
                }
                mWM = (WindowManager)context.getSystemService(Context.WINDOW_SERVICE);
                // We can resolve the Gravity here by using the Locale for getting
                // the layout direction
                final Configuration config = mView.getContext().getResources().getConfiguration();
                final int gravity = Gravity.getAbsoluteGravity(mGravity, config.getLayoutDirection());
                mParams.gravity = gravity;
                if ((gravity & Gravity.HORIZONTAL_GRAVITY_MASK) == Gravity.FILL_HORIZONTAL) {
                    mParams.horizontalWeight = 1.0f;
                }
                if ((gravity & Gravity.VERTICAL_GRAVITY_MASK) == Gravity.FILL_VERTICAL) {
                    mParams.verticalWeight = 1.0f;
                }
                mParams.x = mX;
                mParams.y = mY;
                mParams.verticalMargin = mVerticalMargin;
                mParams.horizontalMargin = mHorizontalMargin;
                mParams.packageName = packageName;
                mParams.hideTimeoutMilliseconds = mDuration ==
                    Toast.LENGTH_LONG ? LONG_DURATION_TIMEOUT : SHORT_DURATION_TIMEOUT;
                mParams.token = windowToken;
                if (mView.getParent() != null) {
                    if (localLOGV) Log.v(TAG, "REMOVE! " + mView + " in " + this);
                    mWM.removeView(mView);
                }
                if (localLOGV) Log.v(TAG, "ADD! " + mView + " in " + this);
                // Since the notification manager service cancels the token right
                // after it notifies us to cancel the toast there is an inherent
                // race and we may attempt to add a window after the token has been
                // invalidated. Let us hedge against that.
                try {
                    mWM.addView(mView, mParams);
                    trySendAccessibilityEvent();
                } catch (WindowManager.BadTokenException e) {
                    /* ignore */
                }
            }
        }
```
`handleShow`会先判断handler消息队列里有没有cancel或者hide，有的话直接return。接着通过`context.getSystemService(Context.WINDOW_SERVICE);`获取到`WindowManager`实例赋给mWM,这个实例其实是`WindowManagerImpl`类型的一个对象。然后设置好mParams的各种参数，调用`mWM.addView(mView, mParams);`展示toast。这里有两点需要注意：
* 实际上调用的是`WindowManagerImpl`的`addView`方法，`WindowManagerImpl`又通过代理类`WindowManagerGlobal`的`addView`方法将toast的view添加到窗口，最终展示。
```java
public void addView(View view, ViewGroup.LayoutParams params,
            Display display, Window parentWindow){
        ......// 参数检查
 
       final WindowManager.LayoutParams wparams =(WindowManager.LayoutParams)params;
 
        /* ① 如果当前窗口需要被添加为另一个窗口的附属窗口（子窗口），则需要让父窗口视自己的情况
            对当前窗口的布局参数(LayoutParams)进行一些修改 */
        if(parentWindow != null) {
           parentWindow.adjustLayoutParamsForSubWindow(wparams);
        }
 
       ViewRootImpl root;
        ViewpanelParentView = null;
 
       synchronized (mLock) {
            ......
 
           // WindowManager不允许同一个View被添加两次
           int index = findViewLocked(view, false);
           if (index >= 0) { throw new IllegalStateException("......");}
 
           // ② 创建一个ViewRootImpl对象并保存在root变量中
           root = new ViewRootImpl(view.getContext(), display);
 
           view.setLayoutParams(wparams);
 
           /* ③ 将作为窗口的控件、布局参数以及新建的ViewRootImpl以相同的索引值保存在三个
              数组中。到这步为止，我们可以认为完成了窗口信息的添加工作 */
           mViews[index] = view;
            mRoots[index] = root;
           mParams[index] = wparams;
        }
 
        try{
           /* ④ 将作为窗口的控件设置给ViewRootImpl。这个动作将导致ViewRootImpl向WMS
               添加新的窗口、申请Surface以及托管控件在Surface上的重绘动作。这才是真正意义上
                完成了窗口的添加操作*/
           root.setView(view, wparams, panelParentView);
        }catch (RuntimeException e) { ...... }
    }
```
当然，这里再继续挖就到了view树的绘制流程去了，这不是本文的重点。
* 第二个需要注意的是这是Android api 26的源码，和25有所不同：
![](./handleShow25vs26.png)
图片来自drakeet的[ToastCompat](https://github.com/drakeet/ToastCompat)
也就是说在Android7.1.1上可能会遇到`BadTokenException`（当然我没遇到）。什么情况会遇到呢？源码上说了，因为the notification manager service会在通知toast取消之后cancel token，所以我们可能会试图在token失效的时候add一个window，这时候就出现了异常。避免方法也就是hook一下`WindowManager`的`addview`方法，手动catch这个exception。


到这里我们的分析就差不多结束了。那么有个问题：token是干嘛的？这里token是这个窗口的Binder对象，WMS通过它对窗口进行IPC通信。


参考：
* [https://zhuanlan.zhihu.com/p/30974432](https://zhuanlan.zhihu.com/p/30974432)
* [浅析Android的窗口](https://dev.qq.com/topic/5923ef85bdc9739041a4a798)