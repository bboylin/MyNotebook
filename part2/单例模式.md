# 单例模式
---

* 定义:确保一个类只有一个实例，并且自动实例化为系统提供这个实例。
* 要点：
    * 私有构造器
    * 通过静态方法或者枚举类返回单例对象
    * 确保多线程环境下单例只有一个
    * 确保单例对象在反序列化时不会重新构建对象
* 代码
    * 饿汉方式。指全局的单例实例在类装载时构建。
    ```java
    public class Singleton {
        private static final Singleton singleton = new Singleton();
        
        //限制产生多个对象
        private Singleton(){
            
        }
        
        //通过该方法获得实例对象
        public static Singleton getSingleton(){
            return singleton;
        }
        
        //类中其他方法，尽量是static
        public static void doSomething(){
            
        }
    }
    ```
    * 懒汉方式。指全局的单例实例在第一次被使用时构建。
    ```java
      public class Singleton {
        private static volatile Singleton INSTANCE = null;
    
        // Private constructor suppresses 
        // default public constructor
        private Singleton() {}
    
        //thread safe and performance  promote 
        public static synchronized Singleton getInstance() {
            if(INSTANCE == null){
                INSTANCE = new Singleton();
            }
            return INSTANCE;
        }
    }
    ```
        懒汉方式的优点：单例只有在需要使用的时候才会实例化，一定程度节约资源。缺点：第一次加载时需要及时进行实例化，反应稍慢，最大的问题是每次调用时都进行同步，造成不必要的同步开销。
    * DCL (Double Check Lock)实现单例
    ```java
      public class Singleton {
        private static volatile Singleton INSTANCE = null;
    
        // Private constructor suppresses 
        // default public constructor
        private Singleton() {}
    
        //thread safe and performance  promote 
        public static  Singleton getInstance() {
            if(INSTANCE == null){
                synchronized(Singleton.class){
                    //when more than two threads run into the first null check same time, to avoid instanced more than one time, it needs to be checked again.
                    if(INSTANCE == null){ 
                        INSTANCE = new Singleton();
                    }
                } 
            }
            return INSTANCE;
        }
    }
    ```
    第一层判断是为了避免不必要的同步，第二层判断为了在null的情况下创建实例。
    但是由于`INSTANCE = new Singleton();`不是原子的，大致有以下三步:       
    * 1）给singleton的实例分配内存
    * 2）调用singleton的构造函数，初始化成员变量
    * 3）将INSTANCE对象纸箱分配的内存空间
    
    由于jdk1.5之前JMM（java内存模型）中cache，寄存器到主内存回写顺序的规定，2）和3）顺序先后是无法保证的。如果在3执行完毕，2执行之前切换到另一个线程就会导致单例未实例化。即DCL失效问题。

    在jdk1.5之后sun调整了JVM，将INSTANCE的定义改成 `private volatile static Singleton INSTANCE=null`就可以保证单例每次都是从内存中读取。

    DCL的优点：资源利用率高，第一次获取单例的时候才会实例化，效率高。缺点：第一次加载的时候反应稍慢，也由于java内存模型的原因偶尔会失败。高并发环境下也有一定缺陷，虽然发生概率较小。
    DCL是使用最多的单例模式。
    * 静态内部类实现单例：推荐，线程安全以及延迟单例的实例化。
    ```java
    public class Singleton {
        private Singleton(){}
        
        //通过该方法获得实例对象
        public static Singleton getSingleton(){
            return SingletonHolder.singleton;
        }
        private static class SingletonHolder{
            private static final Singleton singleton=new Singleton();
        }
    }
    ```
    * 枚举单例：优点在于写法简单，线程安全，同时反序列化的时候不会创建新的对象。
    ```java
    public enum SingletonEnum{
        INSTANCE;
        public void doSomething(){

        }
    }
    ```
    上述方法中除了枚举外要防止反序列化时重新生成对象就必须加入以下方法：
    ```java
    private Object readResolve() throws ObjectStreamExecption{
        return INSTANCE;
    }
    ```
    * 容器实现单例：多种单例类型注入到一个同意的管理类中，并通过key获取。
    ```java
    public class SingletonManager{
        private static Map<String,Object> objMap=new HashMap<String,Object>();
        private SingletonManager(){}
        public static void registerService(String key,Object INSTANCE){
            if(!objMap.containsKey(key)){
                objMap.put(key,INSTANCE);
            }
        }
        public static Object getService(String key){
            return objMap.get(key);
        }
    }
    ```

---

to be continued:

* android源码中的单例模式