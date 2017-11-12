### kotlin语法笔记
---

基本语法点：
* 对象继承自Any，函数无返回值时返回Unit。Any 不是 java.lang.Object ; 尤其要注意, 除 equals() , hashCode() 和 toString() 之外, 它没有任何成
员
* 变量：val只读，var可读写
* 函数体为单个表达式时函数可简写,同样的给变量赋值和函数返回也可以直接用when、try...catch、if等表达式：
```kotlin
fun max(a: Int, b: Int) = if (a > b) a  else b
```
* 字符串模板：
```kotlin
val s = "abc"
val str = "$s.length is ${s.length}" // 计算结果为 "abc.length is 3"
```
* 转义字符串：和Java字符串类似
* 原生字符串：由三重引号表示( """ ), 其内容不转义, 可以包含换行符和任意字符:
```kotlin
val text = """
for (c  in "foo")
print(c)
"""
```
* 可以使用 `trimMargin()` 函数来删除字符串的前导空白(leading whitespace),原生字符串(raw string)和转义字符串(escaped string)内都支持模板. 由于原生字符串无法使用反斜线转义表达方式, 如果你想在字符串内表示 $ 字符本身, 可以使用以下语法:
```kotlin
val price = """
${'$'}9.99
"""
```
* 使用is和!is、in和!in分别进行类型、范围检查
* null检查：
```kotlin
//If not null 的简写表达方式
val files = File("Test").listFiles()
println(files?.size)

//If not null … else 的简写表达方式
val files = File("Test").listFiles()
println(files?.size ?: "empty")

//当值为 null 时, 执行某个语句
val data = ...
val email = data["email"] ?:  throw IllegalStateException("Email is missing!")

//当值不为 null 时, 执行某个语句
val data = ...
data?.let {
... // 这个代码段将在 data 不为 null 时执行
}
```
* 创建 DTO 类(或者叫 POJO/POCO 类)
```kotlin
data  class Customer( val name: String,  val email: String)
/* 以上代码将创建一个 Customer 类, 其中包含以下功能:

所有属性的 getter 函数(对于 var 型属性还有 setter 函数)
equals() 函数
hashCode() 函数
toString() 函数
copy() 函数
所有属性的 component1() , component2() , … 函数 */
```
* kotlin单例采用object关键字：
```kotlin
object DataProviderManager {
    fun registerDataProvider(provider: DataProvider) {
        // ...
    }

    val allDataProviders: Collection<DataProvider>
        get() = // ...
}

//To refer to the object, we use its name directly:
//DataProviderManager.registerDataProvider(...)
```
* 在同一个对象实例上调用多个方法(‘with’ 语句)
```kotlin
class Turtle {
fun penDown()
fun penUp()
fun turn(degrees: Double)
fun forward(pixels: Double)
}
val myTurtle = Turtle()
with(myTurtle) { // 描绘一个边长 100 像素的正方形
penDown()
for(i  in 1..4) {
forward(100.0)
turn(90.0)
}
penUp()
}
```
* 数值对象的装箱(box)并不保持对象的同一性(identity)，但保证内容的同一性:
```kotlin
val a: Int = 10000
print(a === a) // 打印结果为 'true'
val boxedA: Int? = a
val anotherBoxedA: Int? = a
print(boxedA === anotherBoxedA) // !!!打印结果为 'false'!!!
//换成“==”比内容则返回true
```
* 没有隐式类型转换。四则运算符都已被重载。
* import用法多了as关键字，没有static。
* break、continue、return 标签：
```kotlin
loop@  for (i  in 1..100) {
for (j  in 1..100) {
if (...)
break@loop
}
}
fun foo() {
ints.forEach {
f if (it == 0)  return@forEach
print(it)
}
}
```
* 所有类默认是final的，即不可被继承。必须加abstract或者open关键字才能被继承，同样open类中要被override的方法必须加open关键字，否则其子类不可有同名同参的方法（无论是否被override修饰）。当一个子类成员、方法标记了 override 注解来覆盖父类成员时, 覆盖后的子类成员、方法本身也将是 open 的, 也就是说, 子类成员、方法可以被自己的子类再次覆盖. 如果你希望禁止这种再次覆盖, 可以使用 final 关键字。
* 如果一个类从它的直接超类（包含接口）中继承了同一个成员的多个实现，为了表示使用的方法是从哪个超类继承得到的, 我们使用 super 关键字, 将超类名称放在尖括号类,
比如, `super<BaseA>.f()`。
* kotlin没有static函数和变量。可以用companion object来实现类似功能，使用`@JvmStatic`注解可以让同伴对象的成员在 JVM 上被编译为真正的静态方法(static
method)和静态域(static field)。
```kotlin
class MyClass {
companion  object Factory {
fun create(): MyClass = MyClass()
}
}
//可以直接使用类名称作为限定符来访问同伴对象的成员:
val instance = MyClass.create()
//同伴对象的名称可以省略, 如果省略, 
//则会使用默认名称Companion :
class MyClass {
companion  object {
}
}
val x = MyClass.Companion
```
* kotlin泛型同Java一样是伪泛型，型变分三种：协变，逆变，不变。Java的泛型是不变的，即`List<String>`不能和`List<Object>`进行任意方向的赋值，为了弥补这个缺陷，Java里定义了`extend`和`super`通配符，遵循PECS原则：
```java
public interface Collection<E> extends Iterable<E> {
  boolean add(E e);
  boolean addAll(Collection<? extends E> c);
}
```
* 声明处的类型变异：out和in注解，POCI原则（我自己这样记的，out修饰只能返回，in修饰可以作为传参）,out修饰之后可以进行协变，in能进行逆变。
```kotlin
abstract  class Source< out T> {
abstract  fun nextT(): T
}
fun demo(strs: Source<String>) {
val objects: Source<Any> = strs // 协变 OK 的, 因为 T 是一个 out 类型参数
// ...
}
```
* 使用处的类型变异：in类似? super，out类似?extend。
```kotlin
fun copy(from: Array< out Any>, to: Array<Any>) {
// ...
}
```
* 星号投射(Star-projection)：
    * 假如类型定义为 `Foo<out T>` , 其中 T 是一个协变的类型参数, 上界(upper bound)为` TUpper `,`Foo<*>` 等价于 `Foo<out TUpper>` . 它表示, 当 T 未知时, 你可以安全地从 `Foo<*>` 中  读取`TUpper `类型的值
    * 假如类型定义为` Foo<in T>` , 其中 T 是一个反向协变的类型参数,` Foo<*> `等价于 `Foo<in Nothing>` . 它表示, 当 T 未知时, 你不能安全地向 `Foo<*> ` 写入 任何东西
    * 假如类型定义为` Foo<T>` , 其中 T 是一个协变的类型参数, 上界(upper bound)为 `TUpper` , 对于读取值的场合, `Foo<*> `等价于 `Foo<out TUpper>` , 对于写入值的场合, 等价于 `Foo<in Nothing>`
* 泛型约束：`:`相当于Java中的`extends`，存在多个上界时使用where。
```kotlin
fun <T> cloneWhenGreater(list: List<T>, threshold: T): List<T>
where T : Comparable,
T : Cloneable {
return list.filter { it > threshold }.map { it.clone() }
}
```
* 内部类用inner修饰，注意在内部类中使用this会有歧义。`此处挖坑待填`
* 匿名内部类的实例使用 对象表达式(object expression) 来创建:
```kotlin
window.addMouseListener( object: MouseAdapter() {
override  fun mouseClicked(e: MouseEvent) {
// ...
}
override  fun mouseEntered(e: MouseEvent) {
// ...
}
})
```
对于函数式接口可以使用lambda创建：
```kotlin
val listener = ActionListener { println("clicked") }
```
* 类的委托：
```kotlin
interface Base {
fun print()
}
class BaseImpl( val x: Int) : Base {
override  fun print() { print(x) }
}
class Derived(b: Base) : Base  by b
fun main(args: Array<String>) {
val b = BaseImpl(10)
Derived(b).print() // 打印结果为: 10
}
```
`Derived`类声明的基类列表中的 `by` 子句表示, `b` 将被保存在`Derived`的对象实例内部, 而且编译器将会
生成继承自`Base`接口的所有方法, 并将调用转发给`b`
* 扩展函数：
```kotlin
fun Context.toast(message: CharSequence, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(this, message, duration).show()
}

//这个方法可以在Activity内部直接调用：
toast("Hello world!")
toast("Hello world!", Toast.LENGTH_LONG)
```

---
to be continued...