## c++知识点复习
---
比较零散的知识点
* 指针的危险：为数据提供空间是一个独立的步骤，不可忽略。
```c++
long * fellow;
* fellow=223232;
```
fellow 的值可能指向重要数据，导致重要数据被覆写。
* 类型别名
```c++
#define BYTE char
//or
typedef char BYTE
```
* 内联函数：编译更快，更占内存（函数副本多）。在函数声明或者定义前加上inline
* 模板：匹配顺序：非模板>显式具体化>模板。实例化和具体化的区别：
```c++
template void swap<int>(int,int);//explicit instantiation，使用swap模板生成int类型的函数定义。
template <> void swap<int>(int&,int&)//explicit specialization
template <> void swap(int&,int&)//explicit specialization，不使用swap模板生成函数定义。
//试图在同一文件中使用图一类型的实例化和具体化会出错。
```
* 重载
* 友元
* I/O
* STL
* c++ 11
----
写了一会儿就不愿写了。。。好久没用c++。算了，无聊的时候再继续。