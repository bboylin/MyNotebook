####<center>adapter中的观察者模式</center>
<li><h5>什么是观察者模式</h5></li>
结构
![Alt text](./Observer-pattern-class-diagram.png)
观察者模式是对象的行为模式，又叫发布-订阅(Publish/Subscribe)模式、模型-视图(Model/View)模式、源-监听器(Source/Listener)模式或从属者(Dependents)模式。
观察者模式定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态上发生变化时，会通知所有观察者对象，使它们能够自动更新自己。
<h5>观察者模式所涉及的角色有：</h5>
<li>抽象主题(Subject)角色：抽象主题角色把所有对观察者对象的引用保存在一个聚集（比如ArrayList对象）里，每个主题都可以有任何数量的观察者。抽象主题提供一个接口，可以增加和删除观察者对象，抽象主题角色又叫做抽象被观察者(Observable)角色。</li>
<li>具体主题(ConcreteSubject)角色：将有关状态存入具体观察者对象；在具体主题的内部状态改变时，给所有登记过的观察者发出通知。具体主题角色又叫做具体被观察者(Concrete Observable)角色。</li>
<li>抽象观察者(Observer)角色：为所有的具体观察者定义一个接口，在得到主题的通知时更新自己，这个接口叫做更新接口。</li>
<li>具体观察者(ConcreteObserver)角色：存储与主题的状态自恰的状态。具体观察者角色实现抽象观察者角色所要求的更新接口，以便使本身的状态与主题的状态 像协调。如果需要，具体观察者角色可以保持一个指向具体主题对象的引用。</li>
<h5>观察者模式的python代码实现</h5>

```python
class AbstractSubject(object):
		 def register(self, listener):
        raise NotImplementedError("Must subclass me")
 
    def deregister(self, listener):
        raise NotImplementedError("Must subclass me")
 
    def notify_listeners(self, event):
        raise NotImplementedError("Must subclass me")
 
	class Listener(object):
    def __init__(self, name, subject):
        self.name = name
        subject.register(self)
 
    def notify(self, event):
        print self.name, "received event", event
 
	class Subject(AbstractSubject):
	    def __init__(self):
	        self.listeners = []
	        self.data = None

	    def getUserAction(self):
	        self.data = raw_input('Enter something to do:')
	        return self.data

    # Implement abstract Class AbstractSubject

    def register(self, listener):
        self.listeners.append(listener)
 
    def deregister(self, listener):
        self.listeners.remove(listener)
 
    def notify_listeners(self, event):
        for listener in self.listeners:
            listener.notify(event)
	  if __name__=="__main__":
    # make a subject object to spy on
    subject = Subject()
 
    # register two listeners to monitor it.
    listenerA = Listener("<listener A>", subject)
    listenerB = Listener("<listener B>", subject)
 
    # simulated event
    subject.notify_listeners ("<event 1>")
    # outputs:
    #     <listener A> received event <event 1>
    #     <listener B> received event <event 1>
 
    action = subject.getUserAction()
    subject.notify_listeners(action)
    #Enter something to do:hello
    # outputs:
    #     <listener A> received event hello
    #     <listener B> received event hello
```
在listview中，我们知道，当数据变化时，listview呈现的内容是会更新的。这实际上是用到了adapter中的观察者模式（当然listview中利用了adapter模式，这个以后再讲）。adapter内部有一个可观察者类，listview则作为他的一个观察者，将adapter设置给listview时，listview会被注册到这个观察者对象中。接下来我们就从adapter的源码入手，分析一下。
```java
@override
public void setAdapter(ListAdapter adapter){
  resetList();
  //清空视图缓存mRecycler
  mRecycler.clear();
  if (mAdapter!=null) {
    mDataSetObserver=new AdapterDataSetObserver();
    mAdapter.registerDataSetObserver(mDataSetObserver);
  }else {
    //代码省略
  }
  requestLayout();
}
```
从以上程序中我们可以看出，设置adapter时创建了一个AdapterDataSetObserver对象，并注册到adapter中。刚才不是说listview是观察者吗？这会儿怎么成了AdapterDataSetObserver了。我们先放下这个疑问继续往下看。
首先我们看常用的adapter基类BaseAdapter，部分代码如下：
```java
public abstract class BaseAdapter implements ListAdapter,SpinnerAdapter{
    private final DataSetObservable mDataSetObservable=new DataSetObservable();
    
    public void registerDataSetObserver(DataSetObserver dataSetObserver){
        mDataSetObservable.registerObserver(dataSetObserver);
    }
    
    public void notifyDataSetChanged(){
        mDataSetObservable.notifyChanged();
    }
    
    //代码省略
}
```
从以上可以看出，注册观察者实际上调用了DataSetObeservable对应的函数。DataSetObeservable拥有一个观察者集合，当可观察者改变时，就会通知观察者做出相应的处理。
当adapter的数据变化时，我们会调用adapter的notifyDataSetChanged函数，该函数又会调用DataSetObeservable对象的notifyChanged（）函数通知所有观察者数据发生了变化，使观察者进行相应的操作。代码如下：
```java
public class DataSetObeservable extends Observable<DataSetObeserver>{
    public void notifyChanged(){
        synchronized (mObservers){
            for (int i=mObservers.size()-1;i>=0;i--){
                mObservers.get(i).onChanged();//调用观察者的onChanged（）函数
            }
        }
    }
}
```
对listview来说这个观察者就是AdapterDataSetObeserver对象，该类声明在AdapterView中，也是listview的一个父类。AdapterDataSetObeserver代码如下
```java
//AdapterView的内部类AdapterDataSetObeserver中
class AdapterDataSetObeserver extends DataSetObserver{
    @Override
    public void onChanged() {
        mDataChanged=true;
        mOldItemCount=mItemCount;
        //获取元素个数
        mItemCount=getAdapter().getCount();
        //代码省略
        
        checkFocus();
        //重新布局
        requestLayout();
    }
    //代码省略
}
```
在AdapterDataSetObeserver的onChanged()函数中会调用viewGroup的requestLayout()进行重新策略，布局，绘制整个listview的item view，执行完之后，整个listview的元素就发生了变化。

现在我们回到之前的额问题，就是listview不是观察者，而AdapterDataSetObeserver才是真正的观察者的问题。在AdapterDataSetObeserver的onChanged()函数中实际调用的是AdapterView中的方法来完成功能，所以AdapterDataSetObeserver只是在外层做了一层封装，真正核心的功能应该是AdapterView。listview就是通过Adapter模式，观察者模式，item view复用机理实现了高效列表显示。
这里对于item view的复用机理介绍一下：
在Adapter中要重写四个函数：
<li>getCount()获取数据个数</li>
<li>getItem(int)获取指定位置的数据</li>
<li>getItemId(int)获取position位置的id，一般就返回position即可
<li>getView(int,View,ViewGroup)获取position上的ItemView视图。
当处理数据量较大时，对于滚出屏幕外的item view会进入listview的一个Recycler中，Recycler将视图缓存。当屏幕滑动加载新的itemview时，如果该视图存在，则直接从缓存中取出，如果过不存在就直接创建新的视图。这也就是为什么用viewholder可以优化listview的原因。

```java
@Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder viewHolder=null;
        if(convertView==null){
            viewHolder=new ViewHolder();
            convertView=mInflater.inflate(R.layout.medal_item,null);
            viewHolder.medal_item_tv= (TextView) convertView.findViewById(R.id.medal_tv_item);
            convertView.setTag(viewHolder);
        }else{
            viewHolder= (ViewHolder) convertView.getTag();
        }
        viewHolder.medal_item_tv.setText(data.get(position));
        return convertView;
    }
    public final class ViewHolder{
        public TextView medal_item_tv;
    }
```
那么还剩下，listview的适配器模式，下一篇文章再讲。以及在android 5.0以后开始提倡用RecyclerView替代listview了，最近项目里正好用到了这个，有时间也会整理出来，以飨读者。
 ![个人技术公众号](http://open.weixin.qq.com/qr/code/?username=bboylindotcom)