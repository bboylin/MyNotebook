# 单例模式
---

* 定义:确保一个类只有一个实例，并且自动实例化为系统提供这个实例。
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