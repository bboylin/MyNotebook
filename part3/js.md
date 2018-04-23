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

JavaScript对每个创建的对象都会设置一个原型，指向它的原型对象。当我们用obj.xxx访问一个对象的属性时，JavaScript引擎先在当前对象上查找该属性，如果没有找到，就到其原型对象上找，如果还没有找到，就一直上溯到Object.prototype对象，最后，如果还没有找到，就只能返回undefined。

