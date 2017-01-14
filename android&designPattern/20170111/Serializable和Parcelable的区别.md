# Serializable和Parcelable的区别
---

1、作用

Serializable是一种标记接口，作用是为了保存对象的属性到本地文件、数据库、网络流、rmi以方便数据传输，当然这种传输可以是程序内的也可以是两个程序间的。而Android的Parcelable的设计初衷是因为Serializable效率过慢（使用反射），为了在程序内不同组件间以及不同Android程序间(AIDL)高效的传输数据而设计，这些数据仅在内存中存在。

2、效率及选择

Parcelable的性能比Serializable好，因为后者在反射过程频繁GC，所以在内存间数据传输时推荐使用Parcelable，如activity间传输数据，而Serializable可将数据持久化方便保存，所以在需要保存或网络传输数据时选择Serializable，因为android不同版本Parcelable可能不同，所以不推荐使用Parcelable进行数据持久化。
通过intent传递复杂数据类型时必须先实现两个接口之一，对应方法分别是`getSerializableExtra()`,`getParcelableExtra()`。Parcelable方式的实现原理是将一个完整的对象进行分解，而分解后的每一部分都是Intent所支持的数据类型，这样也就实现传递对象的功能了。

3、编程实现

对于Serializable，类只需要实现Serializable接口。而Parcelable则需要实现writeToParcel、describeContents函数以及静态的CREATOR变量，实际上就是将如何打包和解包的工作自己来定义，而序列化的这些操作完全由底层实现。
Parcelable的一个实现例子如下

```java
public class MyParcelable implements Parcelable {
     private int mData;
     private String mStr;

     public int describeContents() {
         return 0;
     }

     // 写数据进行保存,flags 为1表示当前对象需要作为返回值返回。通常都是0
     public void writeToParcel(Parcel out, int flags) {
         out.writeInt(mData);
         out.writeString(mStr);
     }

     // 用来创建自定义的Parcelable的对象
     public static final Parcelable.Creator<MyParcelable> CREATOR
             = new Parcelable.Creator<MyParcelable>() {
         public MyParcelable createFromParcel(Parcel in) {
             return new MyParcelable(in);
         }

         public MyParcelable[] newArray(int size) {
             return new MyParcelable[size];
         }
     };
     
     // 读数据进行恢复
     private MyParcelable(Parcel in) {
         mData = in.readInt();
         mStr = in.readString();
     }
 }
```
当类字段较多时务必保持写入和读取的类型及顺序一致。

而对于Serializable来说，transient关键字修饰的变量不会被序列化，同时可以为所要序列化的类指定一个serialVersionUID。序列化和反序列化的时候是会检验类的serialVersionUID是否一致，不一致就会失败。不指定的时候serialVersionUID是由eclipse计算hash值生成。手动指定以后，当类中增加或者删除了一个成员以后反序列化依然能成功，但是当类的结构发生变化时，比如类名改了，变量类型变了，反序列化依然失败。也可以覆盖writeObject、readObject方法以实现序列化过程自定义。序列化原理：
```java
                //序列化
                File cachedFile = new File(MyConstants.CACHE_FILE_PATH);
                ObjectOutputStream objectOutputStream = null;
                try {
                    objectOutputStream = new ObjectOutputStream(new FileOutputStream(cachedFile));
                    objectOutputStream.writeObject(user);
                    } catch (IOException e) {
                    e.printStackTrace();
                    } finally {
                    MyUtils.close(objectOutputStream);
                }
                //反序列化
                User user = null;
                File cachedFile = new File(MyConstants.CACHE_FILE_PATH);
                if (cachedFile.exists()) {
                    ObjectInputStream objectInputStream = null;
                    try {
                        objectInputStream = new ObjectInputStream(
                                new FileInputStream(cachedFile));
                        user = (User) objectInputStream.readObject();
                        Log.d(TAG, "recover user:" + user);
                    } catch (IOException e) {
                        e.printStackTrace();
                    } catch (ClassNotFoundException e) {
                        e.printStackTrace();
                    } finally {
                        MyUtils.close(objectInputStream);
                    }
                }
```