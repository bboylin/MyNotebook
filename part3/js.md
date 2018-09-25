## js & es6 笔记
---

js执行引擎会自动加分号，但是为了避免出错，尽量都加分号。

不区分整数和浮点数，统一用Number表示，以下都是合法的Number类型：
```js
123; // 整数123
0.456; // 浮点数0.456
1.2345e3; // 科学计数法表示1.2345x1000，等同于1234.5
-99; // 负数
NaN; // NaN表示Not a Number，当无法计算结果时用NaN表示，例如0/0
Infinity; // Infinity表示无限大，当数值超过了JavaScript的Number所能表示的最大值时，就表示为Infinity，例如1/0
```

坚持用===作比较，因为==会做自动类型转换，结果可能意想不到。特殊情况：
```js
NaN === NaN; // false
isNaN(NaN); // true
```

null表示空值，undefined表示值未定义。大多数时候我们应该用null，仅在判断函数参数是否传递时用undefined。

未使用var定义的变量会成为全局变量，这是js历史遗留的坑。启用strict模式后不用var定义变量会报错。`'use strict';`

js的array：
* 给array.length直接赋值会改变arr的大小。
* indexof()查找元素下标
* slice:
```js
var arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
arr.slice(0, 3); // 从索引0开始，到索引3结束，但不包括索引3: ['A', 'B', 'C']
arr.slice(3); // 从索引3开始到结束: ['D', 'E', 'F', 'G']
```
* push和pop用于尾部添加元素和首部删除元素。unshift()和shift()用于头部添加和删除元素。
* sort排序，reverse反转。
* splice()方法是修改Array的“万能方法”，它可以从指定的索引开始删除若干元素，然后再从该位置添加若干元素：
```js
var arr = ['Microsoft', 'Apple', 'Yahoo', 'AOL', 'Excite', 'Oracle'];
// 从索引2开始删除3个元素,然后再添加两个元素:
arr.splice(2, 3, 'Google', 'Facebook'); // 返回删除的元素 ['Yahoo', 'AOL', 'Excite']
arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
// 只删除,不添加:
arr.splice(2, 2); // ['Google', 'Facebook']
arr; // ['Microsoft', 'Apple', 'Oracle']
// 只添加,不删除:
arr.splice(2, 0, 'Google', 'Facebook'); // 返回[],因为没有删除任何元素
arr; // ['Microsoft', 'Apple', 'Google', 'Facebook', 'Oracle']
```
* arra.concat(任意个元素，arrb)，连接数组，但是并没有改变arra，而是返回连接后的数组。
* join()，将arr的各元素用参数连接起来，返回连接后的字符串。

高阶函数：map/reduce/filter/sort

JavaScript对每个创建的对象都会设置一个原型，指向它的原型对象。当我们用obj.xxx访问一个对象的属性时，JavaScript引擎先在当前对象上查找该属性，如果没有找到，就到其原型对象上找，如果还没有找到，就一直上溯到Object.prototype对象，最后，如果还没有找到，就只能返回undefined。例如，创建一个Array对象：`var arr = [1, 2, 3];`其原型链是：
`arr ----> Array.prototype ----> Object.prototype ----> null`
Array.prototype定义了indexOf()、shift()等方法，因此你可以在所有的Array对象上直接调用这些方法。函数也是对象，其原型链类似。

js的原型继承：
```js
function inherits(Child, Parent) {
    var F = function () {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
}
```

ES6新增了class关键字，继承更容易了，类似java。
```js
class Student {
    constructor(name) {
        this.name = name;
    }

    hello()                      {
        alert('Hello, ' + this.name + '!');
    }
}

class PrimaryStudent extends Student {
    constructor(name, grade) {
        super(name); // 记得用super调用父类的构造方法!
        this.grade = grade;
    }

    myGrade() {
        alert('I am at grade ' + this.grade);
    }
}
```
student class的定义包含了构造函数constructor和定义在原型对象上的函数hello()（注意没有function关键字），这样就避免了`Student.prototype.hello = function () {...}`这样分散的代码。

js的function中this的指向：取决于执行环境而不是定义环境。比如class里我定义的function用到了this，但是这个function在class外赋给另一个function了，然后另一个function执行，这时候this指向的已经不是这个对象本身了。在react.js或者react native 里我们会在render函数返回的组件里，比如flatlist，给他绑定一个onEndReached函数，我们会写`onEndReached={this._onEndReached.bind(this)}`而不是`onEndReached={this._onEndReached}`，在没用到this的情况下二者无差别，但是后者在用到this的情况下其this指向不是外部的component，而是这个flatlist。或者我们就用箭头函数亦可，因为在ES6里会自动绑定this。

函数定义和函数表达式：
```js
//函数定义
function functionName(arg){
    //函数体
}
//函数表达式
var variableName = function functionName(arg){
    //函数体
};
```
二者区别在于：
解析器会率先读取函数声明，使其在执行任何代码之前就可以访问（也就是 函数声明提升）；
而函数表达式则需要解析器执行到它所在的代码行才会被解释执行。
```js
sayHi();//能正常运行 弹Hi
sayHi123();//报错 Uncaught TypeError: sayHi123 is not a function(…)

function sayHi(){
    alert('Hi');
}

var sayHi123 = function sayHi(){
    alert('Hi123');
};
```

另外需要注意的是：
当函数的参数是一个值，若被调用函数改变了这个参数的值，这样的改变不会影响到函数外部。
但当函数的参数是一个对象（即一个非原始值，例如Array或用户自定义的其它对象），
若函数改变了这个对象的属性，这样的改变对函数外部是可见的。
这点和java是一样的。

generator 用function* 定义，可以返回多次，返回的值通过next()依次取出。

作用域嵌套：js执行引擎在当前作用域未找到某变量时会依次往外层作用域寻找该变量。

变量声明时候会先寻找当前作用域是否有这个变量，有则会忽略声明。对于var a =2应该认为是一个声明语句加赋值语句。

立即执行函数：
*  `(function foo(){ .. })()` 第一个 ( ) 将函数变成表达式， 第二个 ( ) 执行了这个函数。
* 或者这样：`(function(){ .. }())`

声明的提升：考虑以下两段代码：
```js
a=2;
var a;
console.log(a);
```
和
```js
console.log(a);
var a=2;
```
猜猜结果是啥：前者是2，后者undefined。因为js里声明语句会提前在所有语句之前(编译期)，实际执行顺序是这样的：
```js
var a;
a=2;
console.log(a);
```
和
```js
var a;
console.log(a);
a=2;
```
先有声明，后有赋值。

函数的提升比声明优先，函数表达式不会被提升：考虑以下代码
```js
foo(); 
var foo;
function foo() {
    console.log(1);
}
foo = function () {
    console.log(2);
};
```
执行结果为1。
js引擎理解如下：
```js
function foo() {
    console.log(1);
}
foo();
foo = function () {
    console.log(2);
};
```
var foo作为重复的声明被忽略掉，但是后面如果还有相同的函数声明，会覆盖前面的。

ES6支持函数形参默认值：
```js
// right
var a = 'outer';

function foo(x = a) {
    var a = 'inner';
    console.log(x);
}

foo();  // 输出 outer
// wrong
function foo(x = b) {
    var b = 'inner';  
    console.log(x);
}

foo();  // ReferenceError: b is not defined
```

this绑定规则：

* 箭头函数对于 this 的指向的词法锁定：无论一个箭头函数以怎样的方式被调用（对象方法，bind, call, apply），其 this 始终指向箭头函数声明所在作用域的 this：
```js
var globalObject = this;
var foo = (() => this);
console.log(foo() === globalObject); // true

// Call as a method of an object
var obj = {foo: foo};
console.log(obj.foo() === globalObject); // true

// Attempt to set this using call
console.log(foo.call(obj) === globalObject); // true

// Attempt to set this using bind
foo = foo.bind(obj);
console.log(foo() === globalObject); // true
```

* 默认绑定
```js
function foo(){
    console.log(this.a);
}
var a= 2;
foo(): //2
// 如果启用严格模式
function foo(){
    "use strict";  //注意不要代码中混合使用严格和非严格模式
    console.log(this.a);
}
var a= 2;
foo(): //TyoeError: this is undefined
```
在这里需要注意一点:虽然this的绑定规则完全取决于调用位置。但是只要foo()运作在非严格模式下，默认绑定到全局对象，严格模式下绑定到undefined。
```js
function foo(){
// foo()运作在非严格模式下，默认绑定到全局对象
    console.log(this.a);
}
var a= 2;
(function(){
    "use strict"; 
// 严格模式下与foo()的调用位置无关。
    foo(); //2
})();
```

* 隐式绑定：
```js
function foo(){
    console.log(this.a);
}
var obj2 = {
    a: 42,
    foo: foo
};
var obj1 = {
    a: 2,
    obj2: obj2
};

obj1.obj2.foo(); //42
```

注意隐式绑定的函数会丢失绑定对象：
```js
function foo(){
    console.log(this.a);
}
var obj = {
    a: 2,
    foo: foo
};
var bar = obj.foo; //函数的别名
var a = "oops, global" //a是全局对象的属性
bar(); //oops, global
```
再来个例子
```js
function foo(){
    console.log(this.a);
}
function doFoo(fn){
    //fn其实引用的是foo
    fn();  //调用位置
}
var obj = {
    a: 2,
    foo: foo
};
var a = "oops, global" //a是全局对象的属性
doFoo(obj.foo); // oops, global
```

* 显式绑定
```js
function foo(){
    console.log(this.a);
}
var obj = {
     a:2
};
foo.call(obj); //2
```

硬绑定：
1。在ES5中提供了内置的方法Function.prototype.bind
2。API调用的“上下文”，如：
```js
function foo(el){
    console.log(el, this.id);
}
var obj = {
    id: "awesome"
};
[1, 2 ,3].forEach(foo, obj);
//forEach除了接受一个必须的回调函数参数，还可以接受一个可选的上下文参数（改变回调函数里面的this指向）
//1 awesome 2 awesome 3 awesome
```
3。new绑定
```js
function Foo(a)[
   this.a = a;
}
var bar = new Foo(2);
console.log(bar.a); //2
```

* 优先级方面：

显式绑定优先于隐式绑定
```js
function foo(){
   console.log(this.a);
}
var obj1 = {
   a:2,
   foo: foo
};
var obj2 = {
   a:3,
   foo: foo
};

obj1.foo(); //2
obj2.foo(); //3

obj1.foo.call(obj2); //3
obj2.foo.call(obj1);  //2
```

new绑定优先于隐式绑定：
```js
function foo(something) {
    this.a = something;
}
var obj1 = {
    foo: foo
}
var obj2 = { };

obj1.foo(2);
console.log(obj1.a); //2

obj1.foo.call(obj2, 3);
console.log(obj2.a); //3

var bar = new obj1.foo(4);
console.log(obj1.a); //2
console.log(bar.a); //4
```

new绑定高于硬绑定：
```js
function foo(something){
    this.a = something
}
var obj1 = {};
var bar = foo.bind(obj1); 
bar(2);
console.log(obj1.a); //2
var baz = new bar(3);
console.log(obj1.a); //2
console.log(baz.a); //3
```


如果你把null或者undefined作为this的绑定对象传入call apply或者bind, 这些值调用的时会被忽略，实际应用的是默认绑定规则：
```js
function foo(){
    console.log(this.a);
}
var a =2;
foo.call(null); //2
```
什么情况下会传入null呢？
```js
function foo(a, b) {
     console.log("a:"+a+", b:"+ b);
}
//把数组“展开”称参数
foo.apply(null, [2,3]); //a:2,b:3

//使用bind()进行柯里化
var bar = foo.bind(null, 2);
bar(3); //a:2, b:3
```
如果函数并不关心this的话，你仍然需要传入一个占位符，这是null可能是一个不错的选择。

间接引用：
```js
function foo(){
    console.log(this.a);
}
var a =2;
var o = {a: 3, foo: foo};
var p = {a: 4};
o.foo(); //3
(p.foo = o.foo)() ; //2
// 赋值表达式p.foo = o.foo的返回值是目标函数的引用，因此调用位置是foo()而不是p.foo()或者o.foo(),
// 根据之前的规则，这里会应用默认绑定。
```

考虑`myObject.foo = 'bar';`这条语句，如果：
* `myObject`和原型链上都不存在foo属性，那么会在`myObject`上创建一个foo属性，设置为bar。
* 仅`myObject`上有foo属性，那么直接修改该属性的值
* 仅原型链上有foo属性，则再细分三种情况：
    * foo没有标记为只读，那么直接在`myObject`上创建一个foo属性，且是屏蔽属性。
    * foo只读，那么严格模式下会抛出错误，非严格模式下会忽略此条语句，总之不会屏蔽。
    * foo是个setter，那么一定会调用这个setter。且不会在`myObject`创建foo，也不会重新定义setter。
* `myObject`和原型链上都有foo属性，则发生屏蔽。修改的是`myObject`的foo。

有些情况下会隐式发生屏蔽：
```js
var anotherObject = {
       a:2
};
// myObject原型对象是anotherObject
var myObject = Object.create(anotherObject );
anotherObject.a; //2
 myObject.a; //2

anotherObject.hasOwnProperty("a"); //true
myObject.hasOwnProperty("a"); //false

myObject.a++; //隐式的屏蔽！
anotherObject.a; //2
myObject.a; //3
myObject.hasOwnProperty("a"); //true
```

using promise:
[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

async和await,非常优雅的异步写法:
[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)

await返回的promise对象可能会触发reject，所以必要时加try...catch。

---

参考：

* 《你不知道的JavaScript》