# thinking in java：chapter16-21
---

* chapter 16 : Arrays
    >优先使用容器而不是数组

    * length是数组的大小，而不是数组实际保存的元素个数。新生成一个数组对象时，其中所有的引用被自动初始化为null。
    * 不能实例化具有参数化类型的数组。但是可以参数化数组本身的类型。
    ```java
    Peel<Banana>[] peels = new Peel<Banana>[10];//Illegal
    public T[] f(T[] arg){ return arg; }
    ```
        因为类型擦除会移除参数类型信息，而数组必须知道他所持有的具体类型，以强制保证类型安全。
    * `Arrays.fill()`用同一个值填充数组，对对象而言，就是复制同一个引用填充。
    * 复制数组：`System.arraycopy()`比for循环快很多，参数为，原数组，从源数组什么位置开始复制的偏移量，目标数组，从目标数组什么位置开始复制的偏移量，要复制的元素个数。如果复制对象，则只复制对象的引用，即浅复制。该函数不会自动拆箱装箱，所以参数数组必须具有相同的确切类型。
    * `Arrays.equals(arr1,arr2)`比较两个数组，要求数组元素相同，对应位置元素也相等，比内容。
    * 其他使用操作：sort()数组排序，binarySearch()对已排序的数组中查找元素，toString()，hashCode()产生数组散列码，asList()。
    * 数组排序：
    ```java
    class CompTypeComparator implements Comparator<CompType>{
        public int compare(CompType o1,CompType o2){
            return (o1<o2?-1:(o1==02?0:1));
        }
    }
    Arrays.sort(a,new CompTypeComparator());
    ```
    * 在已排序的数组中查找：`binarySearch()`查找成功返回非负数，查找失败返回- (插入点) - 1。插入点是第一个大于查找对象的元素在数组中的位置，没有则是a.size()。
* [chapter 17 : Containers in Depth](http://jiangjun.name/thinking-in-java/chapter17)
* [chapter 18 : I/O](http://jiangjun.name/thinking-in-java/chapter18)
* [chapter 19 : Enumerated Types](http://jiangjun.name/thinking-in-java/chapter19)
* [chapter 20 : Annotations](http://jiangjun.name/thinking-in-java/chapter20)
* chapter 21 : Concurrency
* chapter 22 : Graphical User Interfaces