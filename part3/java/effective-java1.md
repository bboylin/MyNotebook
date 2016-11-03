## effective java 
---

* chapter2:创建和销毁对象。
    * item1：用静态工厂方法代替构造器

        好处：
        * 1、构造函数有命名的限制，而静态方法有自己的名字，更加易于理解。
        * 2、静态工厂方法在每次调用的时候不要求创建一个新的对象。这种做法对于一个要频繁创建相同对象的程序来说，可以极大的提高性能。它使得一个类可以保证是一个singleton；他使非可变类可以保证“不会有两个相等的实例存在”。
        * 3、静态工厂方法在选择返回类型时有更大的灵活性。使用静态工厂方法，可以通过调用方法时使用不同的参数创建不同类的实例，还可以创建非公有类的对象，这就封装了类的实现细节。
        * 4、在创建参数化类型实例的时候，他们使代码变的更加简洁。

        缺点:
        * 1、如果一个类是通过静态工厂方法来取得实例的，并且该类的构造函数都不是公有的或者保护的，那该类就不可能有子类（被继承），子类的构造函数需要首先调用父类的构造函数，因为父类的构造函数是private的，所以即使我们假设继承成功的话，那么子类也根本没有权限去调用父类的私有构造函数，所以是无法被继承的。
        * 2、毕竟通过构造函数创建实例还是SUN公司所提倡的，静态工厂方法跟其他的静态方法区别不大，这样创建的实例谁又知道这个静态方法是创建实例呢？弥补的办法就是：静态工厂方法名字使用valueOf、of、getInstance、newInstance、getType、newType。

    * item2：遇到多个构造器参数，尤其有可选参数时考虑使用构建器
        * Telescoping constructor pattern:针对可选参数，从0个到最多个，依次编写一个构造函数，它们按照参数数量由少到多逐层调用，最终调用到完整参数的构造函数；代码冗余，有时还得传递无意义参数，而且容易导致使用过程中出隐蔽的bug；
        ```java
        // Telescoping constructor pattern - does not scale well! - Pages 11-12
        package org.effectivejava.examples.chapter02.item02.telescopingconstructor;

        public class NutritionFacts {
            private final int servingSize; // (mL) required
            private final int servings; // (per container) required
            private final int calories; // optional
            private final int fat; // (g) optional
            private final int sodium; // (mg) optional
            private final int carbohydrate; // (g) optional

            public NutritionFacts(int servingSize, int servings) {
                this(servingSize, servings, 0);
            }

            public NutritionFacts(int servingSize, int servings, int calories) {
                this(servingSize, servings, calories, 0);
            }

            public NutritionFacts(int servingSize, int servings, int calories, int fat) {
                this(servingSize, servings, calories, fat, 0);
            }

            public NutritionFacts(int servingSize, int servings, int calories, int fat,
                    int sodium) {
                this(servingSize, servings, calories, fat, sodium, 0);
            }

            public NutritionFacts(int servingSize, int servings, int calories, int fat,
                    int sodium, int carbohydrate) {
                this.servingSize = servingSize;
                this.servings = servings;
                this.calories = calories;
                this.fat = fat;
                this.sodium = sodium;
                this.carbohydrate = carbohydrate;
            }

            public static void main(String[] args) {
                NutritionFacts cocaCola = new NutritionFacts(240, 8, 100, 0, 35, 27);
            }
        }
        ```
        * JavaBeans Pattern:灵活但线程不安全，容易有状态不一致问题。
        ```java
        // JavaBeans Pattern - allows inconsistency, mandates mutability - Pages 12-13
        package org.effectivejava.examples.chapter02.item02.javabeans;

        public class NutritionFacts {
            // Parameters initialized to default values (if any)
            private int servingSize = -1; // Required; no default value
            private int servings = -1; // "     " "      "
            private int calories = 0;
            private int fat = 0;
            private int sodium = 0;
            private int carbohydrate = 0;

            public NutritionFacts() {
            }

            // Setters
            public void setServingSize(int val) {
                servingSize = val;
            }

            public void setServings(int val) {
                servings = val;
            }

            public void setCalories(int val) {
                calories = val;
            }

            public void setFat(int val) {
                fat = val;
            }

            public void setSodium(int val) {
                sodium = val;
            }

            public void setCarbohydrate(int val) {
                carbohydrate = val;
            }

            public static void main(String[] args) {
                NutritionFacts cocaCola = new NutritionFacts();
                cocaCola.setServingSize(240);
                cocaCola.setServings(8);
                cocaCola.setCalories(100);
                cocaCola.setSodium(35);
                cocaCola.setCarbohydrate(27);
            }
        }
        ```
        * builder pattern：
            * 灵活，安全。
            * 参数检查：最好放在要build的对象的构造函数中，而非builder的构建过程中
            * 一个builder可以build多个对象。
            * Builder结合泛型，实现Abstract Factory Pattern
            * 传统的抽象工厂模式，是用Class类实现的，然而其有缺点：newInstance调用总是去调用无参数构造函数，不能保证存在；newInstance方法会抛出所有无参数构造函数中的异常，而且不会被编译期的异常检查机制覆盖；可能会导致运行时异常，而非编译期错误；
        ```java
        // Builder Pattern - Pages 14-15
        package org.effectivejava.examples.chapter02.item02.builder;

        public class NutritionFacts {
            private final int servingSize;
            private final int servings;
            private final int calories;
            private final int fat;
            private final int sodium;
            private final int carbohydrate;

            public static class Builder {
                // Required parameters
                private final int servingSize;
                private final int servings;

                // Optional parameters - initialized to default values
                private int calories = 0;
                private int fat = 0;
                private int carbohydrate = 0;
                private int sodium = 0;

                public Builder(int servingSize, int servings) {
                    this.servingSize = servingSize;
                    this.servings = servings;
                }

                public Builder calories(int val) {
                    calories = val;
                    return this;
                }

                public Builder fat(int val) {
                    fat = val;
                    return this;
                }

                public Builder carbohydrate(int val) {
                    carbohydrate = val;
                    return this;
                }

                public Builder sodium(int val) {
                    sodium = val;
                    return this;
                }

                public NutritionFacts build() {
                    return new NutritionFacts(this);
                }
            }

            private NutritionFacts(Builder builder) {
                servingSize = builder.servingSize;
                servings = builder.servings;
                calories = builder.calories;
                fat = builder.fat;
                sodium = builder.sodium;
                carbohydrate = builder.carbohydrate;
            }

            public static void main(String[] args) {
                NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
                        .calories(100).sodium(35).carbohydrate(27).build();
            }
        }
        ```
        * 小结：Builder模式在简单地类（参数较少，例如4个以下）中，优势并不明显，但是需要予以考虑，尤其是当参数可能会变多时，有可选参数时更是如此。

    * item3：用私有构造器或者枚举类型强化singleton属性
        * 实现singleton的两种方法：
        ```java
        // Singleton with public final field - Page 17
        package org.effectivejava.examples.chapter02.item03.field;

        public class Elvis {
            public static final Elvis INSTANCE = new Elvis();

            private Elvis() {
            }

            public void leaveTheBuilding() {
                System.out.println("Whoa baby, I'm outta here!");
            }

            // This code would normally appear outside the class!
            public static void main(String[] args) {
                Elvis elvis = Elvis.INSTANCE;
                elvis.leaveTheBuilding();
            }
        }
        ```
        第一种方法中，共有静态成员是个final域。由于构造器是私有的，保证了只有一个实例。但是需要提醒的一点是：享有特权的客户端可以通过AccessibleObject.setAccessible方法，通过反射机制调用私有构造器。要抵御这种攻击，需要修改构造器，在被要求创建第二个实例的时候抛出异常
        ```java
        // Singleton with static factory - Page 17
        package org.effectivejava.examples.chapter02.item03.method;

        public class Elvis {
            private static final Elvis INSTANCE = new Elvis();

            private Elvis() {
            }

            public static Elvis getInstance() {
                return INSTANCE;
            }

            public void leaveTheBuilding() {
                System.out.println("Whoa baby, I'm outta here!");
            }

            // This code would normally appear outside the class!
            public static void main(String[] args) {
                Elvis elvis = Elvis.getInstance();
                elvis.leaveTheBuilding();
            }
        }
        ```
        第二种方法中，共有成员是个静态工厂方法。调用getInstance方法可以获得唯一的一个实例。但是上述提醒依然适用。

        共有域的好处在于很清楚表达了该类是个singleton，但在性能上已经不再有优势。现在jvm已经把静态工厂方法的调用内联化了。
        工厂方法的优势在于灵活，可以很容易修改，比如把改为每个线程可以有一个单例。

        为使其中一种方法提供的singleton可序列化，仅仅声明implements serializable是不够的。必须声明所有field都是瞬时的（transient），并提供readResolve方法。
        ```java
        private Object readResolve() {
            // Return the one true Elvis and let the garbage collector
            // take care of the Elvis impersonator.
            return INSTANCE;
        }
        ```
        * 利用枚举实现singleton
        ```java
        // Enum singleton - the preferred approach - page 18
        package org.effectivejava.examples.chapter02.item03.enumoration;

        public enum Elvis {
            INSTANCE;

            public void leaveTheBuilding() {
                System.out.println("Whoa baby, I'm outta here!");
            }

            // This code would normally appear outside the class!
            public static void main(String[] args) {
                Elvis elvis = Elvis.INSTANCE;
                elvis.leaveTheBuilding();
            }
        }
        ```
        这种方法在功能上与公有域类似，而且更简洁，无偿提供序列化机制，绝对阻止多次创建实例，即使是面对复杂的序列化或者单设攻击时。单元素的枚举已经成为实现singleton的最佳方法。
    
    * item4：通过私有构造器强化不可实例化的能力
        * 不宜使用抽象类禁止类的实例化，因为被继承后子类可以被实例化。应该使用私有构造器防止类的实例化，并添加注释。副作用是子类也不能实例化（无法调用父类的构造器）

    * item5：避免创建不必要的对象
        * 使用`String str="123"`代替`String str=new String("123")`
        * 使用静态工厂方法代替构造器：例如，`Boolean.valueOf(String)`优于`Boolean(String)`。
        * 重用已知的不会被修改的对象。例如
        ```java
        // Creates lots of unnecessary duplicate objects - page 20-21
        package org.effectivejava.examples.chapter02.item05.slowversion;

        import java.util.Calendar;
        import java.util.Date;
        import java.util.TimeZone;

        public class Person {
            private final Date birthDate;

            public Person(Date birthDate) {
                // Defensive copy - see Item 39
                this.birthDate = new Date(birthDate.getTime());
            }

            // Other fields, methods omitted

            // DON'T DO THIS!
            public boolean isBabyBoomer() {
                // Unnecessary allocation of expensive object
                Calendar gmtCal = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
                gmtCal.set(1946, Calendar.JANUARY, 1, 0, 0, 0);
                Date boomStart = gmtCal.getTime();
                gmtCal.set(1965, Calendar.JANUARY, 1, 0, 0, 0);
                Date boomEnd = gmtCal.getTime();
                return birthDate.compareTo(boomStart) >= 0
                        && birthDate.compareTo(boomEnd) < 0;
            }
        }
        ```
        可以优化为：
        ```java
        // Doesn't creates unnecessary duplicate objects - page 21
        package org.effectivejava.examples.chapter02.item05.fastversion;

        import java.util.Calendar;
        import java.util.Date;
        import java.util.TimeZone;

        class Person {
            private final Date birthDate;

            public Person(Date birthDate) {
                // Defensive copy - see Item 39
                this.birthDate = new Date(birthDate.getTime());
            }

            // Other fields, methods

            /**
            * The starting and ending dates of the baby boom.
            */
            private static final Date BOOM_START;
            private static final Date BOOM_END;

            static {
                Calendar gmtCal = Calendar.getInstance(TimeZone.getTimeZone("GMT"));
                gmtCal.set(1946, Calendar.JANUARY, 1, 0, 0, 0);
                BOOM_START = gmtCal.getTime();
                gmtCal.set(1965, Calendar.JANUARY, 1, 0, 0, 0);
                BOOM_END = gmtCal.getTime();
            }

            public boolean isBabyBoomer() {
                return birthDate.compareTo(BOOM_START) >= 0
                        && birthDate.compareTo(BOOM_END) < 0;
            }
        }
        ```
        * 优先使用基本类型而不是装箱基本类型，要当心无意识的装箱行为。
        ```java
        package org.effectivejava.examples.chapter02.item05;

        public class Sum {
            // Hideously slow program! Can you spot the object creation?
            public static void main(String[] args) {
                Long sum = 0L;
                for (long i = 0; i < Integer.MAX_VALUE; i++) {
                    sum += i;
                }
                System.out.println(sum);
            }
        }
        ```
        sum声明成Long而不是long导致该程序创建了大约2^31个Long实例，无疑拖慢了程序运行速度。
        * 不要认为本节所讲的就是创建对象代价非常高昂，应该尽量少创建对象。小对象的创建和回收是非常廉价的。通过创建小对象可以提高程序简洁性，可读性和功能性的话通常是好事。反之，通过维护自己的对象池也创建对象不是一种好的做法，除非这些对象非常重量级。
    * item6：消除过期的对象引用
        * 例如，用数组实现一个栈，pop的时候，如果仅仅是移动下标，没有把pop出栈的数组位置引用解除，将发生内存泄漏
        * 程序发生错误之后，应该尽快把错误抛出，而不是以错误的状态继续运行，否则可能导致更大的问题
        * 通过把变量（引用）置为null不是最好的实现方式，只有在极端情况下才需要这样；好的办法是通过作用域来使得变量的引用过期，所以尽量缩小变量的作用域是很好的实践
        * 当一个类管理了一块内存，用于保存其他对象（数据）时，例如用数组实现的栈，底层通过一个数组来管理数据，但是数组的大小不等于有效数据的大小，GC器却并不知道这件事，所以这时候，需要对其管理的数据对象进行null解引用
        * 当一个类管理了一块内存，用于保存其他对象（数据）时，程序员应该保持高度警惕，避免出现内存泄漏，一旦数据无效之后，需要立即解除引用
        * 实现缓存的时候也很容易导致内存泄漏，放进缓存的对象一定要有换出机制，或者通过弱引用来进行引用
        * listner和callback也有可能导致内存泄漏，最好使用弱引用来进行引用，使得其可以被GC
    * item7：避免使用终结方法
        * finalize方法不同于C++的析构函数，不是用来释放资源的好地方
        * finalize方法执行并不及时，其执行线程优先级很低，而当对象unreachable之后，需要执行finalize方法之后才能释放，所以会导致对象生存周期变长，甚至根本不会释放
        * finalize方法的执行并不保证执行成功/完成
        * 使用finalize时，性能会严重下降
        * finalize存在的意义
            * 充当“safety net”的角色，避免对象的使用者忘记调用显式termination方法，尽管finalize方法的执行时间没有保证，但是晚释放资源好过不释放资源；此处输出log警告有利于排查bug
            * 用于释放native peer，但是当native peer持有必须要释放的资源时，应该定义显式termination方法
        * 子类finalize方法并不会自动调用父类finalize方法（和构造函数不同），为了避免子类不手动调用父类的finalize方法导致父类的资源未被释放，当需要使用finalize时，使用finalizer guardian比较好：
            * 定义一个私有的匿名Object子类对象，重写其finalize方法，在其中进行父类要做的工作
            * 因为当父类对象被回收时，finalizer guardian也会被回收，它的finalize方法就一定会被触发