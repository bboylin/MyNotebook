### RecyclerView和listview的比较
---
* RecyclerView定义：A flexible view for providing a limited window into a large data set.</br>
`public class RecyclerView 
extends ViewGroup implements ScrollingView, NestedScrollingChild`
* listview定义：A view that shows items in a vertically scrolling list. The items come from the ListAdapter associated with this view.</br>
`public class ListView 
extends AbsListView`
* android 5.0 以后推荐使用RecyclerView代替listview。二者区别有以下几点：
    * Adapter中的ViewHolder模式 - 对于ListView来说，通过创建ViewHolder来提升性能并不是必须的。因为ListView并没有严格的ViewHolder设计模式。但是在使用RecyclerView的时候，Adapter必须实现至少一个ViewHolder，必须遵循ViewHolder设计模式。
    * 定制Item条目 - ListView只能实现垂直线性排列的列表视图，与之不同的是，RecyclerView可以通过设置RecyclerView.LayoutManager来定制不同风格的视图，比如水平滚动列表或者不规则的瀑布流列表。
    * Item动画 - 在ListView中没有提供任何方法或者接口，方便开发者实现Item的增删动画。相反地，可以通过设置RecyclerView的RecyclerView.ItemAnimator来为条目增加动画效果
    * 设置数据源 - 在LisView中针对不同数据封装了各种类型的Adapter，比如用来处理数组的ArrayAdapter和用来展示Database结果的CursorAdapter。相反地，在RecyclerView中必须自定义实现RecyclerView.Adapter并为其提供数据集合。
    * 设置条目分割线 - 在ListView中可以通过设置android:divider属性来为两个Item间设置分割线。如果想为RecyclerView添加此效果，则必须使用RecyclerView.ItemDecoration，这种实现方式不仅更灵活，而且样式也更加丰富。
    * 设置点击事件 - 在ListView中存在AdapterView.OnItemClickListener接口，用来绑定条目的点击事件。但是，很遗憾的是在RecyclerView中，并没有提供这样的接口，不过，提供了另外一个接口RcyclerView.OnItemTouchListener，用来响应条目的触摸事件。

* 归结来说，improvement体现在：
    * Reuses cells while scrolling up/down - this is possible with implementing View Holder in the listView adapter, but it was an optional thing, while in the RecycleView it's the default way of writing adapter.
    * Decouples(解耦) list from its container - so you can put list items easily at run time in the different containers (linearLayout, gridLayout) with setting LayoutManager.
    <pre><code>  mRecyclerView = (RecyclerView) findViewById(R.id.my_recycler_view);
    mRecyclerView.setLayoutManager(new LinearLayoutManager(this));
    //or
    mRecyclerView.setLayoutManager(new GridLayoutManager(this, 2));</code></pre>
    * Animates common list actions - Animations are decoupled and delegated to ItemAnimator.

There is more about RecyclerView, but I think these points are the main ones.
So, to conclude, RecyclerView is a more flexible control for handling "list data" that follows patterns of delegation of concerns and leaves for itself only one task - recycling items.

---
last edited by 13/07/2016