# 初探event bus和RxBus
---

## event bus 

## 概述
>EventBus is an open-source library for Android using the publisher/subscriber pattern for loose coupling. EventBus enables central communication to decoupled classes with just a few lines of code – simplifying the code, removing dependencies, and speeding up app development.

![](https://raw.githubusercontent.com/greenrobot/EventBus/master/EventBus-Publish-Subscribe.png)

## event bus
* simplifies the communication between components
    * decouples event senders and receivers
    * performs well with Activities, Fragments, and background threads
    * avoids complex and error-prone dependencies and life cycle issues
* makes your code simpler
* is fast
* is tiny (~50k jar)
* is proven in practice by apps with 100,000,000+ installs
* has advanced features like delivery threads, subscriber priorities, etc.

## EventBus作为一个消息总线，有三个主要的元素：
* Event
* Subscriber：事件订阅者，接收特定的事件。在EventBus中，使用约定来指定事件订阅者以简化使用。即所有事件订阅都都是以onEvent开头的函数，具体来说，函数的名字是onEvent，onEventMainThread，onEventBackgroundThread，onEventAsync这四个，这个和 ThreadMode（下面讲）有关。
* Publisher：事件发布者，用于通知 Subscriber 有事件发生。可以在任意线程任意位置发送事件，直接调用eventBus.post(Object) 方法，可以自己实例化 EventBus 对象，但一般使用默认的单例就好了：EventBus.getDefault()， 根据post函数参数的类型，会自动调用订阅相应类型事件的函数。

## 关于ThreadMode

前面说了，Subscriber的函数只能是那4个，因为每个事件订阅函数都是和一个ThreadMode相关联的，ThreadMode指定了会调用的函数。有以下四个ThreadMode：
* PostThread：事件的处理在和事件的发送在相同的进程，所以事件处理时间不应太长，不然影响事件的发送线程，而这个线程可能是UI线程。对应的函数名是onEvent。
* MainThread: 事件的处理会在UI线程中执行。事件处理时间不能太长，这个不用说的，长了会ANR的，对应的函数名是onEventMainThread。
* BackgroundThread：事件的处理会在一个后台线程中执行，对应的函数名是onEventBackgroundThread，虽然名字 是BackgroundThread，事件处理是在后台线程，但事件处理时间还是不应该太长，因为如果发送事件的线程是后台线程，会直接执行事件，如果当前线程是UI线程，事件会被加到一个队列中，由一个线程依次处理这些事件，如果某个事件处理时间太长，会阻塞后面的事件的派发或处理。
* Async：事件处理会在单独的线程中执行，主要用于在后台线程中执行耗时操作，每个事件会开启一个线程（有线程池），但最好限制线程的数目。

根据事件订阅都函数名称的不同，会使用不同的ThreadMode，比如果在后台线程加载了数据想在UI线程显示，订阅者只需把函数命名onEventMainThread。

EventBus in 3 steps
-------------------
1. Define events:

    ```java  
    public static class MessageEvent { /* Additional fields if needed */ }
    ```

2. Prepare subscribers:
    Declare and annotate your subscribing method, optionally specify a [thread mode](http://greenrobot.org/eventbus/documentation/delivery-threads-threadmode/):  

    ```java
    @Subscribe(threadMode = ThreadMode.MAIN)  
    public void onMessageEvent(MessageEvent event) {/* Do something */};
    ```
    Register and unregister your subscriber. For example on Android, activities and fragments should usually register according to their life cycle:

   ```java
    @Override
    public void onStart() {
        super.onStart();
        EventBus.getDefault().register(this);
    }
 
    @Override
    public void onStop() {
        super.onStop();
        EventBus.getDefault().unregister(this);
    }
    ```

3. Post events:

   ```java
    EventBus.getDefault().post(new MessageEvent());
    ```

## event bus的跨进程问题

目前 EventBus 只支持跨线程，而不支持跨进程。如果一个 app 的 service 起到了另一个进程中，那么注册监听的模块则会收不到另一个进程的 EventBus 发出的事件。这里可以考虑利用 IPC 做映射表，并在两个进程中各维护一个 EventBus，不过这样就要自己去维护 register 和 unregister 的关系，比较繁琐，而且这种情况下通常用广播会更加方便。

![](http://bugly.qq.com/bbs/data/attachment/forum/201605/05/110018gqffp008wlmspssf.jpg)

另外，需要注意的是如果post一个事件，该事件的父类也会被post。

========

## RxBus

>RxJava不仅带来了响应式编程的便利，而且可以轻松实现RxBus作为事件总线。

```java

import rx.Observable;
import rx.subjects.PublishSubject;
import rx.subjects.SerializedSubject;
import rx.subjects.Subject;

public class RxBus {
    private static volatile RxBus defaultInstance;
    // 主题
    private final Subject bus;

    // PublishSubject只会把在订阅发生的时间点之后来自原始Observable的数据发射给观察者
    private RxBus() {
        bus = new SerializedSubject<>(PublishSubject.create());
    }

    // 单例RxBus
    public static RxBus getDefault() {
        if (defaultInstance == null) {
            synchronized (RxBus.class) {
                if (defaultInstance == null) {
                    defaultInstance = new RxBus();
                }
            }
        }
        return defaultInstance;
    }

    // 提供了一个新的事件
    public void post(Object o) {
        bus.onNext(o);
    }

    // 根据传递的 eventType 类型返回特定类型(eventType)的 被观察者
    public <T> Observable<T> toObserverable(Class<T> eventType) {
        //本质是先filter再cast
        return bus.ofType(eventType);
    }
}
```

[Subject](http://reactivex.io/documentation/subject.html)同时充当了Observer和Observable的角色，Subject是非线程安全的，要避免该问题，需要将 Subject转换为一个 SerializedSubject ，上述RxBus类中把线程非安全的PublishSubject包装成线程安全的Subject。

1、首先创建一个可同时充当Observer和Observable的Subject；

2、在需要接收事件的地方，订阅该Subject（此时Subject是作为Observable），在这之后，一旦Subject接收到事件，立即发射给该订阅者；

3、在我们需要发送事件的地方，将事件post至Subject，此时Subject作为Observer接收到事件（onNext），然后会发射给所有订阅该Subject的订阅者。

* post事件：
```java
RxBus.getDefault().post(new UserEvent (1, "yoyo"));
```

* 接收事件：
```java
rxSubscription = RxBus.getDefault().toObserverable(UserEvent.class)
        .subscribe(...)
```

一定要记得在生命周期结束的地方取消订阅事件，防止RxJava可能会引起的内存泄漏问题。
```java
@Override
protected void onDestroy() {
    super.onDestroy();
    if(!rxSubscription.isUnsubscribed()) {
        rxSubscription.unsubscribe();
    }
}
```
又或者

使用CompositeSubscription把 Subscription 收集到一起，方便 Activity（基类） 销毁时取消订阅，防止内存泄漏。

前者可以在任一生命周期阶段取消订阅，缺点是每个acivity/fragment都要重写方法。

后者可以写在BaseActivity（大家都不会陌生），每个activity都能用，缺点是不够灵活。

还有一种更简单的方法：[RxLifecycle](https://github.com/trello/RxLifecycle)。