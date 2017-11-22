### Android控件系统
---

#### 另一种创建窗口的方法
```java
// 将按钮作为一个窗口添加到WMS中
private void installFloatingWindow() {
    // ① 获取一个WindowManager实例
    finalWindowManager wm =
                    (WindowManager)getSystemService(Context.WINDOW_SERVICE);
 
    // ② 新建一个按钮控件
    finalButton btn = new Button(this.getBaseContext());
   btn.setText("Click me to dismiss!");
 
    // ③ 生成一个WindowManager.LayoutParams，用以描述窗口的类型与位置信息
   LayoutParams lp = createLayoutParams();
 
    // ④ 通过WindowManager.addView()方法将按钮作为一个窗口添加到系统中
   wm.addView(btn, lp);
 
   btn.setOnClickListener(new View.OnClickListener() {
       @Override
       public void onClick(View v) {
            // ⑤当用户点击按钮时，将按钮从系统中删除
           wm.removeView(btn);
           stopSelf();
        }
    });
}
 
private layoutparams createlayoutparams() {
    layoutparams lp = new windowmanager.layoutparams();
    lp.type = layoutparams.type_phone;
   lp.gravity = gravity.center;       lp.width = layoutparams.wrap_content;
       lp.height = layoutparams.wrap_content;
       lp.flags = layoutparams.flag_not_focusable
               | layoutparams.flag_not_touch_modal;
       return lp;
    }
```

#### windowManager结构体系

![](http://img.blog.csdn.net/20150814133444496?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

通过Context.getSystemService()的方式获取的WindowManager其实是WindowManagerImpl类的一个实例。

##### 通过WindowManagerGlobal添加窗口

参考WindowManagerGlobal.addView()的代码：
[WindowManagerGlobal.java-->WindowManagerGlobal.addView()]
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
添加窗口的代码并不复杂。其中的关键点有：
* 父窗口修改新窗口的布局参数。可能修改的只有LayoutParams.token和LayoutParams.mTitle两个属性。mTitle属性不必赘述，仅用于调试。而token属性则值得一提。回顾一下第4章的内容，每一个新窗口必须通过LayoutParams.token向WMS出示相应的令牌才可以。在addView()函数中通过父窗口修改这个token属性的目的是为了减少开发者的负担。开发者不需要关心token到底应该被设置为什么值，只需将LayoutParams丢给一个WindowManager，剩下的事情就不用再关心了。</br>父窗口修改token属性的原则是：如果新窗口的类型为子窗口(其类型大于等于LayoutParams.FIRST_SUB_WINDOW并小于等于LayoutParams.LAST_SUB_WINDOW)，则LayoutParams.token所持有的令牌为其父窗口的ID（也就是IWindow.asBinder()的返回值）。否则LayoutParams.token将被修改为父窗口所属的Activity的ID(也就是在第4章中所介绍的AppToken)，这对类型为TYPE_APPLICATION的新窗口来说非常重要。
从这点来说，当且仅当新窗的类型为子窗口时addView()的parentWindow参数才是真正意义上的父窗口。这类子窗口有上下文菜单、弹出式菜单以及游标等等，在WMS中，这些窗口对应的WindowState所保存的mAttachedWindow既是parentWindow所对应的WindowState。然而另外还有一些窗口，如对话框窗口，类型为TYPE_APPLICATION， 并不属于子窗口，但需要AppToken作为其令牌，为此parentWindow将自己的AppToken赋予了新窗口的的LayoutParams.token中。此时parentWindow便并不是严格意义上的父窗口了。
* 为新窗口创建一个ViewRootImpl对象。顾名思义，ViewRootImpl实现了一个控件树的根。它负责与WMS进行直接的通讯，负责管理Surface，负责触发控件的测量与布局，负责触发控件的绘制，同时也是输入事件的中转站。总之，ViewRootImpl是整个控件系统正常运转的动力所在，无疑是本章最关键的一个组件。
* 将控件、布局参数以及新建的ViewRootImpl以相同的索引值添加到三个对应的数组mViews、mParams以及mRoots中，以供之后的查询之需。控件、布局参数以及ViewRootImpl三者共同组成了客户端的一个窗口。或者说，在控件系统中的窗口就是控件、布局参数与ViewRootImpl对象的一个三元组。
* 调用ViewRootImpl.setView()函数，将控件交给ViewRootImpl进行托管。这个动作将使得ViewRootImpl向WMS添加窗口、获取Surface以及重绘等一系列的操作。这一步是控件能够作为一个窗口显示在屏幕上的根本原因！
总体来说，WindowManagerGlobal在通过父窗口调整了布局参数之后，将新建的ViewRootImpl、控件以及布局参数保存在自己的三个数组中，然后将控件交由新建的ViewRootImpl进行托管，从而完成了窗口的添加。

##### 更新窗口的布局
[WindowManagerGlobal.java-->WindowManagerGlobal.updateViewLayout()]
```java
public void updateViewLayout(View view, ViewGroup.LayoutParams params) {
        ......// 参数检查
       final WindowManager.LayoutParams wparams =(WindowManager.LayoutParams)params;
        // 将布局参数保存到控件中
       view.setLayoutParams(wparams);
 
       synchronized (mLock) {
           // 获取窗口在三个数组中的索引
           int index = findViewLocked(view, true);
           ViewRootImpl root = mRoots[index];
            // 更新布局参数到数组中
           mParams[index] = wparams;
           // 调用ViewRootImpl的setLayoutParams()使得新的布局参数生效
           root.setLayoutParams(wparams, false);
        }
    }
```
更新窗口布局的工作在WindowManagerGlobal中是非常简单的，主要是保存新的布局参数，然后调用ViewRootImpl.setLayoutParams()进行更新。

##### 删除窗口

接下来探讨窗口的删除操作。在了解了WindowManagerGlobal管理窗口的方式后应该可以很容易地推断出删除窗口所需要做的工作：
* 从3个数组中删除此窗口所对应的元素，包括控件、布局参数以及ViewRootImpl。
* 要求ViewRootImpl从WMS中删除对应的窗口(IWindow)，并释放一切需要回收的资源。

这个过程十分简单，这里就不引用相关的代码了。只是有一点需要说明一下：要求ViewRootImpl从WMS中删除窗口并释放资源的方法是调用ViewRootImpl.die()函数。因此可以得出这样一个结论：ViewRootImpl的生命从setView()开始，到die()结束。

#### ViewRootImpl的performTraversals()方法

注意的是对于悬浮窗口（比如alertdialog）`measureHierachy()`方法可以连续进行两次让步，也就是最多会测量三次

![](http://img.blog.csdn.net/20150814133700983?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

#### 控件树的绘制

##### 理解canvas
其绘图指令可分为两部分：
* 绘制指令：drawXXX()方法提供，点线圆矩形等
* 辅助指令：设置变换、裁剪区域等等

* 绘制目标：
    * 软件：建立在surface上的位图bitmap
    * 硬件：HardwareLayer（可以认为是一个GL Texture或者是理解成硬件加速下的bitmap）和DisplayList（硬件绘制指令序列）
* canvas的坐标变换：
```java
mCanvas.drawRect(x,y,x+w,y+h,mPaint);
```
等价于：
```java
mCanvas.translate(x,y);
mCanvas.drawRect(0,0,w,h,mPaint);
```
此外还有scale和skew操作。
`save()`和`restore()`嵌套调用，快速撤销canvas变换。我们在重写view的onDraw方法之前从来没有考虑过控件的位置，缩放，旋转等状态，原因就在于这些已经通过变换设置给canvas了。在view递归绘制的时候canvas的save和restore成对调用。

* invalidate()和脏区域

脏区域指的是需要重绘的区域：invalidate()会将需要重绘的控件（同时给`view.mPrivateFlags`添加`PFLAG_DIRTY`和`PFLAG_DIRTY_OPAQUE`之一）随着控件树提交给`ViewRootImpl`，保留在其中的mDirty成员中，最后通过`scheduleTraversals()`向主线程的handler发送消息。多次调用invalidate是`viewRootImpl`多次接收到脏区域的请求，将这些累积到mDirty中，进而在随后的一次遍历中一次性完成所有脏区域的重绘。

view有一个isOpaque()方法给子类覆写，通过返回值确认该控件是不是实心的（即透过此控件覆盖的区域不能看到其控件之下的内容）。invalidate过程中，如果控件是实心的，会将该控件标记`PFLAG_DIRTY_OPAQUE`，否则为`PFLAG_DIRTY`。据此判断是否要为控件绘制背景。

软件绘制(`drawSoftware()`)主要有4步工作：
* 通过`surface.lockCanvas()`获取一个用于绘制的`canvas`
* 对canvas变换实现滚动效果
* 通过`mView.draw()`将根控件绘制在canvas上
* 通过`Surface.unlockCanvasAndPost()`显示绘制后的内容

注意自定义viewgroup的时候不应该重写ondraw，因为透明控件的该方法不会被调用。解决办法是调用`setWillNotDraw(false)`或者是在构造函数中设置background。