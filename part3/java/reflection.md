## java 反射机制
---

* 反射的定义：JAVA反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制。
* 使用 Java 反射机制可以在运行时期检查 Java 类的信息，检查 Java 类的信息往往是你在使用 Java 反射机制的时候所做的第一件事情，通过获取类的信息你可以获取以下相关的内容：
    * Class 对象
    * 类名
    * 修饰符
    * 包信息
    * 父类
    * 实现的接口
    * 构造器
    * 方法
    * 变量
    * 注解
* 获取类的Class对象：在你想检查一个类的信息之前，你首先需要获取类的 Class 对象。Java 中的所有类型包括基本类型(int, long, float等等)，即使是数组都有与之关联的 Class 类的对象。
    * 编译时知道类的名字：
    ```java
    Class myObjectClass = MyObject.class;
    ```
    * 编译期不知道类的名字，但是你可以在运行期获得到类名的字符串
    ```java
    String className = ... ;//在运行期获取的类名字符串
    Class class = Class.forName(className);//className必须为类的全名（包含包），否则出现ClassNotFoundException
    ```
* 修饰符
    * 访问一个类的修饰符
    ```java
    Class  aClass = ... //获取Class对象
    int modifiers = aClass.getModifiers();
    ```
    * 修饰符都被包装成一个int类型的数字，这样每个修饰符都是一个位标识(flag bit)，这个位标识可以设置和清除修饰符的类型。 可以使用 java.lang.reflect.Modifier 类中的方法来检查修饰符的类型：
    ```java
    Modifier.isAbstract(int modifiers);
    Modifier.isFinal(int modifiers);
    Modifier.isInterface(int modifiers);
    Modifier.isNative(int modifiers);
    Modifier.isPrivate(int modifiers);
    Modifier.isProtected(int modifiers);
    Modifier.isPublic(int modifiers);
    Modifier.isStatic(int modifiers);
    Modifier.isStrict(int modifiers);
    Modifier.isSynchronized(int modifiers);
    Modifier.isTransient(int modifiers);
    Modifier.isVolatile(int modifiers);
    ```
* 获取包信息
```java
Class  aClass = ... //获取Class对象
Package package = aClass.getPackage();
```
* 父类
```java
Class superclass = aClass.getSuperclass();
```
* 实现的接口
```java
Class[] interfaces = aClass.getInterfaces();
```
* 构造器
```java
Constructor[] constructors = aClass.getConstructors();
Constructor constructor =
  aClass.getConstructor(new Class[]{String.class});//获取指定的构造方法，参数为string
Class[] parameterTypes = constructor.getParameterTypes();//获取指定方法的方法参数
Constructor constructor = MyObject.class.getConstructor(String.class);
MyObject myObject = (MyObject)
 constructor.newInstance("constructor-arg1");//利用 Constructor 对象实例化一个类
```
* 方法
```java
Method[] method = aClass.getMethods();
Method method = aClass.getMethod("doSomething", new Class[]{String.class});//获取的方法名称为doSomething，参数为string
Method method = aClass.getMethod("doSomething", null);
Class[] parameterTypes = method.getParameterTypes();//获取方法参数
Class returnType = method.getReturnType();//获取返回类型
Object returnValue = method.invoke(null, "parameter-value1");//调用方法
```
* 访问私有方法
```java
public class PrivateObject {

  private String privateString = null;

  public PrivateObject(String privateString) {
    this.privateString = privateString;
  }

  private String getPrivateString(){
    return this.privateString;
  }
}
```

```java
PrivateObject privateObject = new PrivateObject("The Private Value");

Method privateStringMethod = PrivateObject.class.
        getDeclaredMethod("getPrivateString", null);

privateStringMethod.setAccessible(true);

String returnValue = (String)
        privateStringMethod.invoke(privateObject, null);

System.out.println("returnValue = " + returnValue);
```

* 变量
```java
Field[] field = aClass.getFields();
Field field = aClass.getField("someField");//获取MyObject类中声明的名为 someField 的成员变量
//在调用 getField()方法时，如果根据给定的方法参数没有找到对应的变量，那么就会抛出 NoSuchFieldException。
String fieldName = field.getName();//获取变量名称
Object fieldType = field.getType();//获取一个变量的类型
```
* 获取或设置变量值
```java
Class  aClass = MyObject.class
Field field = aClass.getField("someField");

MyObject objectInstance = new MyObject();

Object value = field.get(objectInstance);

field.set(objetInstance, value);
```
* 获取私有变量

    Class.getField(String name)和 Class.getFields()只会返回公有的变量，无法获取私有变量。

```java
public class PrivateObject {

  private String privateString = null;

  public PrivateObject(String privateString) {
    this.privateString = privateString;
  }
}
```

```java
PrivateObject privateObject = new PrivateObject("The Private Value");

Field privateStringField = PrivateObject.class.
            getDeclaredField("privateString");

privateStringField.setAccessible(true);

String fieldValue = (String) privateStringField.get(privateObject);
System.out.println("fieldValue = " + fieldValue);
```
这个例子会输出”fieldValue = The Private Value”,通过调用 setAccessible()方法会关闭指定类 Field 实例的反射访问检查，这行代码执行之后不论是私有的、受保护的以及包访问的作用域，你都可以在任何地方访问，即使你不在他的访问权限作用域之内。但是你如果你用一般代码来访问这些不在你权限作用域之内的代码依然是不可以的，在编译的时候就会报错。

---

to be continued
* 注解
```java
Annotation[] annotations = aClass.getAnnotations();
```
* 泛型
* 数组
* 动态代理
* 动态类加载和重载

