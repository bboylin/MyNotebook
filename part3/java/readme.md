### notes of thinking in java
---
* chapter1 : Introduction to Objects
    * 主数据类型(Primitive Type)</br>
    ![](https://github.com/bboylin/bboylin.github.io/tree/master/part3/java/pic1.jpg)

* chapter2 : Everything is an Object
    * 用引用操作对象
    * 内存</br>
    ![](https://github.com/bboylin/bboylin.github.io/tree/master/part3/java/pic2.jpg)

* chapter3 : Operators
    * ==和！=比较的是对象的引用，equals()比较的是对象的内容</br>
指数计数：1.39e-43f/47e47d</br>
移位：<<左移右补0，>>有符号右移左边补符号数，>>>无符号右移左边补0，零扩展
</br>java允许把任何数据类型转换为另一种基本类型，但是布尔量除外。</br>
java没有sizeof因为不同机器上相同的数据类型具有相同大小。（JVM）</br>

* chapter4 : Controlling Execution
    * 略

* chapter5 : Initialization & Clean up
    * 方法重载：参数类型列表（按返回值重载不可行）
    * 实例化对象并调用方法时初始化顺序：</br>
（1）普通类：静态成员、普通成员、构造器（重载）、方法
      （多次实例时static只执行一次）</br>
（2）继承: 基类静态,基类普通成员,基类构造器（重载时按顺序初始化）（编译器自动调用基类构造）,子类静态,子类普通成员,子类构造器（重载）,子类或基类方法
    * 内存清理：垃圾回收器只回收无法到达的无用对象（new分配的内存），但不知道回收非new方式的特殊内存。所以通过调用finalize()手动回收，但finalize不能保证立即回收，需等到下一次垃圾回收动作时才执行回收（finalize的不及时性最好不直接调用，它无法替代析构函数），因此必须手动清理。
显式地清理用dispose()方法
    * 回收器如何工作：对象存储空间的分配，堆指针移动到未分配区域即可，工作时一面回收空间，一面使堆中的对象紧凑排列，高速、有无限空间可分配。每个对象都有一个引用计数器，有引用时+1，离开引用时-1，垃圾回收器遍历所有对象列表，引用计数为0 时释放空间，循环引用的处理比较麻烦。
    另一种：根据目前的存活对象深度查找关联引用对象，不活动的则会释放。停止—复制方式，先把存活对象从当前堆复制到另一个堆，没有被复制的都是垃圾，复制后的对象也是紧密排列的，比较好。此种模式效率较低。此外，一但程序进入稳定状态后，极少会产生垃圾，此时复制就是浪费。
    一些虚拟机会转换到标记—横扫模式，速度慢，但是当你知道有很少垃圾时，它就很快了。遍历存活对象，给对象标记不会被回收，全部标记完成才会清理。更详细的请参考：[java中的垃圾回收机制](https://github.com/bboylin/bboylin.github.io/tree/master/part3/gc/readme.md)

* chapter6 : Access Control
    * priavte          本类可见</br>
public            所有类可见</br>
protected      本包和所有子类都可见</br>
friendly          本包可见（即默认的形式）</br>

* chapter7 : Reusing Classes
    * 组合，继承，代理（在两个类之间增加对象或行为适配，由适配器来完成）。
    * final数据一般用于永不改变的编译时常量，或运行时被初始化的值，而你不希望他被改变。多用于基本类型，而不是对象引用。一个既是static又是final的域只占据一段不能变的存储空间，命名应用大写表示，各单词下划线分割。
</br>final参数表示可以读不能写，即不能改变引用的对象
</br>final方法防止继承时改变功能

* chapter8 : Polymorphism
    * 多态就是指程序中定义的引用变量所指向的具体类型和通过该引用变量发出的方法调用在编程时并不确定，而是在程序运行期间才确定，即一个引用变量到底会指向哪个类的实例对象，该引用变量发出的方法调用到底是哪个类中实现的方法，必须在由程序运行期间才能决定。因为在程序运行时才确定具体的类，这样，不用修改源程序代码，就可以让引用变量绑定到各种不同的类实现上，从而导致该引用调用的具体方法随之改变，即不修改程序代码就可以改变程序运行时所绑定的具体代码，让程序可以选择多个运行状态，这就是多态性。
    * 面向对象三大基本特征：封装，继承，多态。继承是多态得以实现的基础，比如sellCar(Car car)里面的参数可以是Car的任何子类。
    * 除static、final外，其他的方法都是后期编译器自动绑定的。静态方法不具备多态性

* chapter9 ： Interfaces
    *  接口中的方法、域、内嵌接口等默认都是public的</br>
放入接口中的域都会自动变成static、final的</br>
可向上转型为多个接口类型</br>
java单继承多实现（接口），而c++多重继承。</br>
类中嵌套接口和非嵌套接口一样，可以拥有public和包访问两种可视性。
    * 联系：[工厂方法模式](https://github.com/bboylin/bboylin.github.io/tree/master/designPattern/FactoryMethodPattern.md)

* chapter10 : Inner Classes
---
to be continued

