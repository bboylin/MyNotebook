title: inflate和setContentView做了什么
---

今天在企鹅电竞上遇到了这么一个问题：xml最外层layout设置的margin没生效，而出问题的代码在这里：

![](http://blog.bboylin.xyz/image/evaluate.png)

不仅设置的margin没生效，最后实际效果上margin更是随着不同分辨率的手机而不同，要搞懂这个问题，就得从inflate函数说起了。
打开LayoutInflater的源码可以看到inflate函数的定义：

```java
/**
    * Inflate a new view hierarchy from the specified xml resource. Throws
    * {@link InflateException} if there is an error.
    * 
    * @param resource ID for an XML layout resource to load (e.g.,
    *        <code>R.layout.main_page</code>)
    * @param root Optional view to be the parent of the generated hierarchy.
    * @return The root View of the inflated hierarchy. If root was supplied,
    *         this is the root View; otherwise it is the root of the inflated
    *         XML file.
    */
public View inflate(@LayoutRes int resource, @Nullable ViewGroup root) {
    return inflate(resource, root, root != null);
}
```
其调用了三个参数的inflate函数：
```java
/**
    * Inflate a new view hierarchy from the specified xml resource. Throws
    * {@link InflateException} if there is an error.
    * 
    * @param resource ID for an XML layout resource to load (e.g.,
    *        <code>R.layout.main_page</code>)
    * @param root Optional view to be the parent of the generated hierarchy (if
    *        <em>attachToRoot</em> is true), or else simply an object that
    *        provides a set of LayoutParams values for root of the returned
    *        hierarchy (if <em>attachToRoot</em> is false.)
    * @param attachToRoot Whether the inflated hierarchy should be attached to
    *        the root parameter? If false, root is only used to create the
    *        correct subclass of LayoutParams for the root view in the XML.
    * @return The root View of the inflated hierarchy. If root was supplied and
    *         attachToRoot is true, this is root; otherwise it is the root of
    *         the inflated XML file.
    */
public View inflate(@LayoutRes int resource, @Nullable ViewGroup root, boolean attachToRoot) {
    final Resources res = getContext().getResources();
    if (DEBUG) {
        Log.d(TAG, "INFLATING from resource: \"" + res.getResourceName(resource) + "\" ("
                + Integer.toHexString(resource) + ")");
    }

    final XmlResourceParser parser = res.getLayout(resource);
    try {
        return inflate(parser, root, attachToRoot);
    } finally {
        parser.close();
    }
}
```
由此可知：两个参数的inflate函数中传入的root为null时，attachToRoot默认为false；root不为null时，attachToRoot默认为true。那么attachToRoot是干嘛的呢？
总结来说：
* root为null时，attachToRoot的值将不起作用。直接返回的xml根布局。（由于没有LayoutParams，根布局的宽高margin等不起作用）
* root不为null时，attachToRoot为true则最后inflate返回的结果就是root，而且xml的布局被addView加入到root中；而attachToRoot==false的时候，直接返回的是xml的根布局，且这个根布局被设置了一个利用root生成的LayoutParams。同样，从源码中可以得到验证：
```java
// Temp is the root view that was found in the xml
final View temp = createViewFromTag(root, name, inflaterContext, attrs);

ViewGroup.LayoutParams params = null;

if (root != null) {
    if (DEBUG) {
        System.out.println("Creating params from root: " +
                root);
    }
    // Create layout params that match root, if supplied
    params = root.generateLayoutParams(attrs);
    if (!attachToRoot) {
        // Set the layout params for temp if we are not
        // attaching. (If we are, we use addView, below)
        temp.setLayoutParams(params);
    }
}

if (DEBUG) {
    System.out.println("-----> start inflating children");
}

// Inflate all children under temp against its context.
rInflateChildren(parser, temp, attrs, true);

if (DEBUG) {
    System.out.println("-----> done inflating children");
}

// We are supposed to attach all the views we found (int temp)
// to root. Do that now.
if (root != null && attachToRoot) {
    root.addView(temp, params);
}

// Decide whether to return the root that was passed in or the
// top view found in xml.
if (root == null || !attachToRoot) {
    result = temp;
}
```

```java
public LayoutParams generateLayoutParams(AttributeSet attrs) {
    return new LayoutParams(getContext(), attrs);
}
public LayoutParams(Context c, AttributeSet attrs) {
    TypedArray a = c.obtainStyledAttributes(attrs, R.styleable.ViewGroup_Layout);
    setBaseAttributes(a,
            R.styleable.ViewGroup_Layout_layout_width,
            R.styleable.ViewGroup_Layout_layout_height);
    a.recycle();
}
```

那么回过头来看出问题的代码：

![](http://blog.bboylin.xyz/image/evaluate.png)

传入的root为null和attachToRoot为false，很明显直接返回xml的根布局，由于没有layoutparams，这样就导致xml根布局的margin失效。那么怎么改呢？既然没有layoutparams那给他赋一个MarginLayoutParams不就行了吗？然而事实证明这也不行，margin仍然没变。而且上面的分析仅仅证明了margin失效原因，不能说明为什么最后会出来一个随着手机分辨率而改变的margin。要分析这个问题就得用到Android studio的layout inspector了，Hierarchy Viewer也可以，不过Hierarchy Viewer得root手机，当然功能也更强大，可以用来优化布局。

这是Hierarchy Viewer下布局的tree view：

![](http://blog.bboylin.xyz/image/treeview.png)

可以看到在我的根布局之外套上了两个FrameLayout和一个decorView，在左侧看每个layout的属性可以知道他们的margin是一样的，也是最终手机上展示出来的margin，而ID为dialogRoot的framelayout我设置的margin无效（原因之前已经解释很清楚了）。要弄清楚这个过程就得看看setContentView做了什么：

```java
public void setContentView(@LayoutRes int layoutResID) {
    getWindow().setContentView(layoutResID);
    initWindowDecorActionBar();
}
```

可以看到是通过activity持有的window来setContentView的，由于PhoneWindow是window的唯一实现类，所以我们看看phonewindow的setContentView做了什么：

```java
@Override
public void setContentView(int layoutResID) {
    // Note: FEATURE_CONTENT_TRANSITIONS may be set in the process of installing the window
    // decor, when theme attributes and the like are crystalized. Do not check the feature
    // before this happens.
    if (mContentParent == null) {
        installDecor();
    } else if (!hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
        mContentParent.removeAllViews();
    }

    if (hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
        final Scene newScene = Scene.getSceneForLayout(mContentParent, layoutResID,
                getContext());
        transitionTo(newScene);
    } else {
        mLayoutInflater.inflate(layoutResID, mContentParent);
    }
    mContentParent.requestApplyInsets();
    final Callback cb = getCallback();
    if (cb != null && !isDestroyed()) {
        cb.onContentChanged();
    }
    mContentParentExplicitlySet = true;
}

@Override
public void setContentView(View view) {
    setContentView(view, new ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT));
}

@Override
public void setContentView(View view, ViewGroup.LayoutParams params) {
    // Note: FEATURE_CONTENT_TRANSITIONS may be set in the process of installing the window
    // decor, when theme attributes and the like are crystalized. Do not check the feature
    // before this happens.
    if (mContentParent == null) {
        installDecor();
    } else if (!hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
        mContentParent.removeAllViews();
    }

    if (hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
        view.setLayoutParams(params);
        final Scene newScene = new Scene(mContentParent, view);
        transitionTo(newScene);
    } else {
        mContentParent.addView(view, params);
    }
    mContentParent.requestApplyInsets();
    final Callback cb = getCallback();
    if (cb != null && !isDestroyed()) {
        cb.onContentChanged();
    }
    mContentParentExplicitlySet = true;
}
```

因为我们最终调用的是setContentView(View view, ViewGroup.LayoutParams params)这个函数，所以先分析这个，其他都是一样。首先一个phonewindow持有一个decorView和mContentParent（就是ID为android.R.id.content的framelayout）,如果mContentParent为null，则调用installDecor()生成decorView并利用decorView生成mContentParent，然后调用mContentParent.addView(view, params)将new ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT)设置给了view，这里又一次使我们的根布局的margin失效了。installDecor()部分源码如下：

```java
private void installDecor() {
    mForceDecorInstall = false;
    if (mDecor == null) {
        mDecor = generateDecor(-1);
        mDecor.setDescendantFocusability(ViewGroup.FOCUS_AFTER_DESCENDANTS);
        mDecor.setIsRootNamespace(true);
        if (!mInvalidatePanelMenuPosted && mInvalidatePanelMenuFeatures != 0) {
            mDecor.postOnAnimation(mInvalidatePanelMenuRunnable);
        }
    } else {
        mDecor.setWindow(this);
    }
    if (mContentParent == null) {
        mContentParent = generateLayout(mDecor);
        ······
```

这里就暂时不再深入去看了。
最终我们要解决这个问题还要靠getWindow获取到phonewindow然后将其x=0并且宽设为match_parent，这样phonewindow宽度上就占满屏幕了，最外层的margin就消除了。还得注意的一点是必须在setContentView之后执行，否则不会生效。