# picasso源码分析
---

## picasso的使用

```java
//加载一张图片
Picasso.with(this).load("url").placeholder(R.mipmap.ic_default).into(imageView);

//加载一张图片并设置一个回调接口
Picasso.with(this).load("url").placeholder(R.mipmap.ic_default).into(imageView, new Callback() {
    @Override
    public void onSuccess() {

    }

    @Override
    public void onError() {

    }
});

//预加载一张图片
Picasso.with(this).load("url").fetch();

//同步加载一张图片,注意只能在子线程中调用并且Bitmap不会被缓存到内存里.
new Thread() {
    @Override
    public void run() {
        try {
            final Bitmap bitmap = Picasso.with(getApplicationContext()).load("url").get();
            mHandler.post(new Runnable() {
                @Override
                public void run() {
                    imageView.setImageBitmap(bitmap);
                }
            });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}.start();

//加载一张图片并自适应imageView的大小,如果imageView设置了wrap_content,会显示不出来.直到该ImageView的
//LayoutParams被设置而且调用了该View的ViewTreeObserver.OnPreDrawListener回调接口后才会显示.
Picasso.with(this).load("url").priority(Picasso.Priority.HIGH).fit().into(imageView);

//加载一张图片并按照指定尺寸以centerCrop()的形式缩放.
Picasso.with(this).load("url").resize(200,200).centerCrop().into(imageView);

//加载一张图片并按照指定尺寸以centerInside()的形式缩放.并设置加载的优先级为高.注意centerInside()或centerCrop()
//只能同时使用一种,而且必须指定resize()或者resizeDimen();
Picasso.with(this).load("url").resize(400,400).centerInside().priority(Picasso.Priority.HIGH).into(imageView);

//加载一张图片旋转并且添加一个Transformation,可以对图片进行各种变化处理,例如圆形头像.
Picasso.with(this).load("url").rotate(10).transform(new Transformation() {
    @Override
    public Bitmap transform(Bitmap source) {
        //处理Bitmap
        return null;
    }

    @Override
    public String key() {
        return null;
    }
}).into(imageView);

//加载一张图片并设置tag,可以通过tag来暂定或者继续加载,可以用于当ListView滚动是暂定加载.停止滚动恢复加载.
Picasso.with(this).load("url").tag(mContext).into(imageView);
Picasso.with(this).pauseTag(mContext);
Picasso.with(this).resumeTag(mContxt);
```

## 一张图片加载的过程

`创建->入队->执行->解码->变换->批处理->完成->分发->显示(可选)`

## 源码分析

从最简单的加载一张图片开始看起
`Picasso.with(this).load(url).into(imageView)`；让我们来看看`Picasso.with(context)`做了什么，

```java
 static volatile Picasso singleton = null;

 public static Picasso with(Context context) {
    if (singleton == null) {
      synchronized (Picasso.class) {
        if (singleton == null) {
          singleton = new Builder(context).build();
        }
      }
    }
    return singleton;
  }
```

显然是由`new Builder(context).build()`创建的单例。`builder`是picasso的静态内部类，其中的build()方法定义：
```java
    /** Create the {@link Picasso} instance. */
    public Picasso build() {
      Context context = this.context;

      if (downloader == null) {
        downloader = Utils.createDefaultDownloader(context);
      }
      if (cache == null) {
        cache = new LruCache(context);
      }
      if (service == null) {
        service = new PicassoExecutorService();
      }
      if (transformer == null) {
        transformer = RequestTransformer.IDENTITY;
      }

      Stats stats = new Stats(cache);

      Dispatcher dispatcher = new Dispatcher(context, service, HANDLER, downloader, cache, stats);

      return new Picasso(context, dispatcher, cache, listener, transformer, requestHandlers, stats,
          defaultBitmapConfig, indicatorsEnabled, loggingEnabled);
    }
```

让我们来看看picasso的构造函数里做了些什么
```java
  Picasso(Context context, Dispatcher dispatcher, Cache cache, Listener listener,
      RequestTransformer requestTransformer, List<RequestHandler> extraRequestHandlers, Stats stats,
      Bitmap.Config defaultBitmapConfig, boolean indicatorsEnabled, boolean loggingEnabled) {
    this.context = context;
    this.dispatcher = dispatcher;
    this.cache = cache;
    this.listener = listener;
    this.requestTransformer = requestTransformer;
    this.defaultBitmapConfig = defaultBitmapConfig;

    int builtInHandlers = 7; // Adjust this as internal handlers are added or removed.
    int extraCount = (extraRequestHandlers != null ? extraRequestHandlers.size() : 0);
    List<RequestHandler> allRequestHandlers =
        new ArrayList<RequestHandler>(builtInHandlers + extraCount);

    // ResourceRequestHandler needs to be the first in the list to avoid
    // forcing other RequestHandlers to perform null checks on request.uri
    // to cover the (request.resourceId != 0) case.
    allRequestHandlers.add(new ResourceRequestHandler(context));
    if (extraRequestHandlers != null) {
      allRequestHandlers.addAll(extraRequestHandlers);
    }
    allRequestHandlers.add(new ContactsPhotoRequestHandler(context));
    allRequestHandlers.add(new MediaStoreRequestHandler(context));
    allRequestHandlers.add(new ContentStreamRequestHandler(context));
    allRequestHandlers.add(new AssetRequestHandler(context));
    allRequestHandlers.add(new FileRequestHandler(context));
    allRequestHandlers.add(new NetworkRequestHandler(dispatcher.downloader, stats));
    requestHandlers = Collections.unmodifiableList(allRequestHandlers);

    this.stats = stats;
    this.targetToAction = new WeakHashMap<Object, Action>();
    this.targetToDeferredRequestCreator = new WeakHashMap<ImageView, DeferredRequestCreator>();
    this.indicatorsEnabled = indicatorsEnabled;
    this.loggingEnabled = loggingEnabled;
    this.referenceQueue = new ReferenceQueue<Object>();
    this.cleanupThread = new CleanupThread(referenceQueue, HANDLER);
    this.cleanupThread.start();
  }
```

基本上就是给内部变量赋值，作用如下：
* 使用默认的缓存策略，内存缓存基于LruCache,磁盘缓存基于http缓存,HttpResponseCache
* 创建默认的下载器
* 创建默认的线程池(3个worker线程)
* 创建默认的Transformer,这个Transformer什么事情也不干，只负责转发请求
* 创建默认的监控器(Stats),用于统计缓存命中率、下载时长等等
* 创建默认的处理器集合,即RequestHandlers.它们分别会处理不同的加载请求

接着初始化`RequestHandler`的一个ArrayList，那么`RequestHandler`究竟是干啥的呢，官方源码上的注释说的很清楚了，我暂时还没用过，就不做过多了解。
```java
/**
 * {@code RequestHandler} allows you to extend Picasso to load images in ways that are not
 * supported by default in the library.
 * <p>
 * <h2>Usage</h2>
 * {@code RequestHandler} must be subclassed to be used. You will have to override two methods
 * ({@link #canHandleRequest(Request)} and {@link #load(Request, int)}) with your custom logic to
 * load images.
 * <p>
 * You should then register your {@link RequestHandler} using
 * {@link Picasso.Builder#addRequestHandler(RequestHandler)}
 * <p>
 * <b>Note:</b> This is a beta feature. The API is subject to change in a backwards incompatible
 * way at any time.
 *
 * @see Picasso.Builder#addRequestHandler(RequestHandler)
 */
```
接着往下看load方法。
```java
public RequestCreator load(Uri uri) {
    return new RequestCreator(this, uri, 0);
}
```
返回了一个新建的RequestCreator对象
```java
  RequestCreator(Picasso picasso, Uri uri, int resourceId) {
    if (picasso.shutdown) {
      throw new IllegalStateException(
          "Picasso instance already shut down. Cannot submit new requests.");
    }
    this.picasso = picasso;
    this.data = new Request.Builder(uri, resourceId, picasso.defaultBitmapConfig);
  }
```
首先是持有一个Picasso的对象,然后构建一个Request的Builder对象,将我们需要加载的图片的信息都保存在data里,在我们通过.centerCrop()或者.transform()等等方法的时候实际上也就是改变data内的对应的变量标识,再到处理的阶段根据这些参数来进行对应的操作,所以在我们调用into()方法之前,所有的操作都是在设定我们需要处理的参数,真正的操作都是有into()方法引起的。
```java
  /**
   * Asynchronously fulfills the request into the specified {@link ImageView}.
   * <p>
   * <em>Note:</em> This method keeps a weak reference to the {@link ImageView} instance and will
   * automatically support object recycling.
   */
  public void into(ImageView target) {
    into(target, null);
  }

  /**
   * Asynchronously fulfills the request into the specified {@link ImageView} and invokes the
   * target {@link Callback} if it's not {@code null}.
   * <p>
   * <em>Note:</em> The {@link Callback} param is a strong reference and will prevent your
   * {@link android.app.Activity} or {@link android.app.Fragment} from being garbage collected. If
   * you use this method, it is <b>strongly</b> recommended you invoke an adjacent
   * {@link Picasso#cancelRequest(android.widget.ImageView)} call to prevent temporary leaking.
   */
  public void into(ImageView target, Callback callback) {
    long started = System.nanoTime();
    //check that method call happens from the main thread
    checkMain();

    if (target == null) {
      throw new IllegalArgumentException("Target must not be null.");
    }
    //如果没有设置需要加载的uri,或者resourceId
    if (!data.hasImage()) {
      picasso.cancelRequest(target);
      //如果设置占位图片,直接加载并返回
      if (setPlaceholder) {
        setPlaceholder(target, getPlaceholderDrawable());
      }
      return;
    }
    //如果是延时加载,也就是选择了fit()模式
    if (deferred) {
        //fit()模式是适应target的宽高加载,所以并不能手动设置resize,如果设置就抛出异常
      if (data.hasSize()) {
        throw new IllegalStateException("Fit cannot be used with resize.");
      }
      int width = target.getWidth();
      int height = target.getHeight();
      if (width == 0 || height == 0 || target.isLayoutRequested()) {
        if (setPlaceholder) {
          setPlaceholder(target, getPlaceholderDrawable());
        }
        //监听ImageView的ViewTreeObserver.OnPreDrawListener接口,一旦ImageView
      //的宽高被赋值,就按照ImageView的宽高继续加载.
        picasso.defer(target, new DeferredRequestCreator(this, target, callback));
        return;
      }
      data.resize(width, height);
    }

    Request request = createRequest(started);
    String requestKey = createKey(request);

    if (shouldReadFromMemoryCache(memoryPolicy)) {
         //通过LruCache来读取内存里的缓存图片
      Bitmap bitmap = picasso.quickMemoryCacheCheck(requestKey);
      if (bitmap != null) {
        picasso.cancelRequest(target);
        setBitmap(target, picasso.context, bitmap, MEMORY, noFade, picasso.indicatorsEnabled);
        if (picasso.loggingEnabled) {
          log(OWNER_MAIN, VERB_COMPLETED, request.plainId(), "from " + MEMORY);
        }
         //如果设置了回调接口就回调接口的方法.
        if (callback != null) {
          callback.onSuccess();
        }
        return;
      }
    }
     //如果缓存里没读到,先根据是否设置了占位图并设置占位
    if (setPlaceholder) {
      setPlaceholder(target, getPlaceholderDrawable());
    }
    //构建一个Action对象,由于我们是往ImageView里加载图片,所以这里创建的是一个ImageViewAction对象
    Action action =
        new ImageViewAction(picasso, target, request, memoryPolicy, networkPolicy, errorResId,
            errorDrawable, requestKey, tag, callback, noFade);
     //将Action对象入列提交
    picasso.enqueueAndSubmit(action);
  }
```
整个流程看下来应该是比较清晰的,最后是创建了一个ImageViewAction对象并通过picasso提交,这里简要说明一下ImageViewAction,实际上Picasso会根据我们调用的不同方式来实例化不同的Action对象,当我们需要往ImageView里加载图片的时候会创建ImageViewAction对象,如果是往实现了Target接口的对象里加载图片是则会创建TargetAction对象,这些Action类的实现类不仅保存了这次加载需要的所有信息,还提供了加载完成后的回调方法.也是由子类实现并用来完成不同的调用的。然后让我们继续去看`picasso.enqueueAndSubmit(action)`方法:
```java
  void enqueueAndSubmit(Action action) {
    Object target = action.getTarget();
    //取消这个target已经有的action.
    if (target != null && targetToAction.get(target) != action) {
      // This will also check we are on the main thread.
      cancelExistingRequest(target);
      targetToAction.put(target, action);
    }
    submit(action);
  }
  //调用dispatcher来派发action
void submit(Action action) {
  dispatcher.dispatchSubmit(action);
}
void dispatchSubmit(Action action) {
  handler.sendMessage(handler.obtainMessage(REQUEST_SUBMIT, action));
}
```
看到通过一个handler对象发送了一个REQUEST_SUBMIT的消息,那么这个handler是存在与哪个线程的呢?
```java
Dispatcher(Context context, ExecutorService service, Handler mainThreadHandler,
    Downloader downloader, Cache cache, Stats stats) {
  this.dispatcherThread = new DispatcherThread();
  this.dispatcherThread.start();    
  this.handler = new DispatcherHandler(dispatcherThread.getLooper(), this);
  this.mainThreadHandler = mainThreadHandler;
}

  static class DispatcherThread extends HandlerThread {
  DispatcherThread() {
    super(Utils.THREAD_PREFIX + DISPATCHER_THREAD_NAME, THREAD_PRIORITY_BACKGROUND);
  }
}
```
上面是Dispatcher的构造方法(省略了部分代码),可以看到先是创建了一个HandlerThread对象,然后创建了一个DispatcherHandler对象,这个handler就是刚刚用来发送REQUEST_SUBMIT消息的handler,这里我们就明白了原来是通过Dispatcher类里的一个子线程里的handler不断的派发我们的消息,这里是用来派发我们的REQUEST_SUBMIT消息,而且最终是调用了 `dispatcher.performSubmit(action);`方法:
```java
void performSubmit(Action action) {
  performSubmit(action, true);
}

void performSubmit(Action action, boolean dismissFailed) {
  //是否该tag的请求被暂停
  if (pausedTags.contains(action.getTag())) {
    pausedActions.put(action.getTarget(), action);
    if (action.getPicasso().loggingEnabled) {
      log(OWNER_DISPATCHER, VERB_PAUSED, action.request.logId(),
          "because tag '" + action.getTag() + "' is paused");
    }
    return;
  }
  //通过action的key来在hunterMap查找是否有相同的hunter,这个key里保存的是我们
  //的uri或者resourceId和一些参数,如果都是一样就将这些action合并到一个
  //BitmapHunter里去.
  BitmapHunter hunter = hunterMap.get(action.getKey());
  if (hunter != null) {
    hunter.attach(action);
    return;
  }

  if (service.isShutdown()) {
    if (action.getPicasso().loggingEnabled) {
      log(OWNER_DISPATCHER, VERB_IGNORED, action.request.logId(), "because shut down");
    }
    return;
  }

  //创建BitmapHunter对象
  hunter = forRequest(action.getPicasso(), this, cache, stats, action);
  //通过service执行hunter并返回一个future对象
  hunter.future = service.submit(hunter);
  //将hunter添加到hunterMap中
  hunterMap.put(action.getKey(), hunter);
  if (dismissFailed) {
    failedActions.remove(action.getTarget());
  }

  if (action.getPicasso().loggingEnabled) {
    log(OWNER_DISPATCHER, VERB_ENQUEUED, action.request.logId());
  }
}
```
这里我们再分析一下forRequest()是如何实现的:

---
未完待续