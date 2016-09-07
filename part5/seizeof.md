由一道2017年阿里实习生笔试题想到的
---
* 问题描述
```c++
#pragma pack(2)
class BU
{
    int number;
    union UBffer
    {
        char buffer[13];
        int number;
    }ubuf;
    void foo(){}
    typedef char*(*f)(void*);
    enum{hdd,ssd,blueray}disk;
}bu;
```
sizeof(bu)的值是()</BR>
A.20</BR>
B.21</BR>
C.22</BR>
D.23</BR>
E.24</BR>
F.非上述选项</BR>

* 分析</br>
用sizeof计算类大小的一般原则
    * 成员函数（包括静态与非静态）和静态数据成员都不占用类对象的存储空间。
    * 虚函数由于要维护虚函数表，所以要占据一个指针大小，也就是4字节
    * 如果是子类，那么父类中的成员也会被计算
    * 内存字节要对齐
    * 空类的实例占用1字节

    union:当多个数据需要共享内存或者多个数据每次只取其一时，可以利用联合体(union)；
它有以下特点：
    * （1）它是一个结构；
    * （2）它的所有成员相对于基地址的偏移量都为0；
    * （3）此结构空间要大到足够容纳最"宽"的成员；
    * （4）其对齐方式要适合其中所有的成员

    而分配给union的实际大小不仅要满足是对齐大小的整数倍，同时要满足实际大小不能小于最大成员的大小。

    本题目中

    注意第一行，#pragma pack(2)

    首先考虑没有这句话时，我们在类、结构或者union补齐字节的时候，
    
    找它们的成员数据中找字节最大的那个数去衡量如何对齐，假设为z；
    
    但是有了这句话以后，对齐方式是取 pack(n)中n和z的最小值去对齐；
    
    可见本题中对齐字节数为2；
    
    之后往下看 int number; 占4个字节
    
    接下来考虑union大小
    ```c++
    union UBffer
    {
        char buffer[13]; // 13
        int number; // 4
    }ubuf; buffer 是13个字节，number 是4个字节，取最大的 为13，注意还要字节对齐，对齐字节数为2，所以Union大小为14，既满足buffer的对齐 也满足number的对齐。
    void foo(){} 不占
    typedef char*(*f)(void*); 不占
    enum{hdd,ssd,blueray}disk; 4个字节
    ```
     综上，总大小为14+4+0+0 +4=22</br>
另外：在64位机器中，指针占8个字节。32位机器，指针占4字节。