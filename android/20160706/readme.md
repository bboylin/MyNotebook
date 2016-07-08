<h2><center>android中的消息机制和多线程</center></h2>
###<li>handler的消息传递机制
android 只允许UI线程修改UI组件，所以子线程需要消息传递给UI线程来更改UI组件</br>
####handler类的主要作用：
<li>子线程中发送消息
<li>主线程接收处理消息
</br>handler必须在主线程中创建。子线程中必须初始化一个Looper。Looper.prepare()方法保证每个线程中只有一个Looper对象</br>
####Looper/MessageQueue/Handler各自的作用如下：
<li>looper:每个线程只有一个，不断从MessageQueue中取出消息，将消息分发给handler处理
<li>MessageQueue:由looper管理，先进先出的消息队列，不断接受来自handler的消息
<li>handler:消息发送给MessageQueue，然后处理来自looper的消息。
###<li>AysncTask
先来看看AysncTask的定义：
<pre><code>public abstract class AsyncTask< Params,Progress,Result>{}</code></pre>
三个泛型分别表示参数类型，进度类型，返回结果类型。如果不需要的话可以设为void
一个异步任务的执行通常有以下几个步骤
<li>execute(Params...params)：在代码中调用，触发异步任务的执行
<li>onPreExecute()：在execute(Params...params)调用后立即执行，执行在UI线程中，在执行后台任务之前对UI组件进行标记
<li>doInBackground()：在execute(Params...params)之后调用，执行耗时操作，接收输入参数和返回结果，执行过程中可以调用PublishProgress(Progress...values)来更新进度信息
<li>onProgressUpdate(Progress...values)：直接在UI中更新进度，显示在UI组件上
<li>onPostExecute(Result result)：执行在UI线程，将doInBackground()执行的结果作为参数传递到此方法中，结果直接显示在UI组件
使用时要注意的几点：
<li>实例在UI线程创建
<li>execute(Params...params)在UI线程调用
<li>不能在doInBackground()中更改UI组件
<li>一个实例只能execute一次。

---
待续