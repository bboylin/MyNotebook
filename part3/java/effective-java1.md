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
    
