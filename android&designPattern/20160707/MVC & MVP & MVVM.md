##我眼中的MVC/MVP/MVVM架构
---
####MVC
MVC 是一种软件开发的方法，它把代码的定义和数据访问的方法（模型）与请求逻辑（控制器）还有用户接口（视图）分开来。

* M：model （数据保存）
* V：view （用户界面）
* C：controller（业务逻辑）
</br>各部分之间通信如下：
![各部分之间通信](http://image.beekka.com/blog/2015/bg2015020105.png)
</br>即：
View 传送指令到 Controller</br>
Controller 完成业务逻辑后，要求 Model 改变状态</br>
Model 将新的数据发送到 View，用户得到反馈</br>
所有通信都是单向的。</br>

#####MVC的例子
* django框架就是典型的MVC架构，一般新建的django project都会自动生成 views.py models.py urls.py加上我们自己定义的templates（html页面）就构成了MVC架构（亦可以说是MTV架构）
views.py和urls.py负责根据用户请求渲染页面，是controller；而models.py直接建立数据模型，对数据库进行增删查改；templates则是展示在前端和用户交互的界面。
这样架构的好处在于：开发者更改一个应用程序中的 URL 而不用影响到这个程序底层的实现。设计师可以改变 HTML 页面的样式而不用接触 Python 代码。数据库管理员可以重新命名数据表并且只需更改一个地方，无需从一大堆文件中进行查找和替换。
* listview的设计中也蕴含了MVC架构，listview为V，adapter为C，adapter适配的数据为M。这里不赘述了，有兴趣的参考这两篇文章：[the Observer Pattern (从adapter源码看其中的观察者模式)](https://github.com/bboylin/bboylin.github.io/tree/master/android/20160630)，[adapter pattern (Android源码解析之适配器(Adapter)模式)](https://github.com/bboylin/bboylin.github.io/tree/master/android/20160705)

#####互动模式
接受用户指令时，MVC 可以分成两种方式。
一种是通过 View 接受指令，传递给 Controller。
另一种是直接通过controller接受指令。
#####缺点
在MVC，当你有变化的时候你需要同时维护三个对象和三个交互，这显然让事情复杂化了。
####MVP
MVP 模式将 Controller 改名为 Presenter，同时改变了通信方向。是基于MVC进行的优化
![通信方向](http://image.beekka.com/blog/2015/bg2015020109.png)
![](https://pic1.zhimg.com/ffa885b9adc7f4dca8bfe674565e848c_b.jpg)
* 各部分之间的通信，都是双向的。
* View 与 Model 不发生联系，都通过 Presenter 传递。
* View 非常薄，不部署任何业务逻辑，称为"被动视图"（Passive View），即没有任何主动性，而 Presenter非常厚，所有逻辑都部署在那里</br>
</br>MVP切断了View和Model的联系，让View只和Presenter（原Controller）交互，减少在需求变化中需要维护的对象的数量
</br>这种方式很符合我们的期待，因为我们倾向于：</br>
用更低的成本解决问题</br>
用更容易理解的方式解决问题</br>
MVP定义了Presenter和View之间的接口，让一些可以根据已有的接口协议去各自分别独立开发，以此去解决界面需求变化频繁的问题。

####MVVM
MVVM 模式将 Presenter 改名为 ViewModel，基本上与 MVP 模式完全一致。
但是View和ViewModel间没有了MVP的界面接口，而是直接交互，用数据“绑定”的形式让数据更新的事件不需要开发人员手动去编写特殊用例，而是自动地双向同步。数据绑定你可以认为是Observer模式或者是Publish/Subscribe模式，原理都是为了用一种统一的集中的方式实现频繁需要被实现的数据更新问题。
比起MVP，MVVM不仅简化了业务与界面的依赖关系，还优化了数据频繁更新的解决方案，甚至可以说提供了一种有效的解决模式。
![](http://image.beekka.com/blog/2015/bg2015020110.png)

---
以上浅见，如有不当之处，烦请指正。
