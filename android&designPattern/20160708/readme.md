###android基础杂记（查漏补缺）
Activity的生命周期</br>
1）启动：oncreate,onstart,onresume</br>
2）当前Activity被覆盖或锁屏，onpause</br>
3）从被覆盖回到前台或者解锁屏，onresume</br>
4）跳转到别的activity或者按home键回到主屏，onpause,onstop</br>
5）后退回到此activity，onrestart,onstart,onresume</br>
6）Activity处于被覆盖或者后台不可见状态（即2/4步），由于内存不足被杀死，而后用户退回该activity，同启动过程。oncreate,onstart,onresume</br>
7）用户退出当前activity，onpause,onstop,ondestroy</br>

![](./pic1.png)

activity之间传递数据
1.intent。用于数据比较少。Intent intent=new Intent();intent.putExtra("key",value);intent.setClass(CurrentActivity.this,AnotherActivity.class);startActivity(intent)
getIntent().getStringExtra("key")获取</br>
2.Intent intent=new Intent(CurrentActivity.this,AnotherActivity.class )通过bundle.putXxx("key")存数据（HashMap），getXxx()取数据，intent.putExtra(bundle)
</br>Broadcast Receiver</br>
service的生命周期：oncreate(),onstart(),ondestroy()需要在androidmanifest.xml中注册
</br>contentprovider没用过</br>
startActivityForReault()/onActivityReault()用于从调用的另一个activity中获取数据
intent可给除了contentprovider之外的三大组件传递数据</br>

android布局关系图：
![](https://github.com/bboylin/bboylin.github.io/blob/master/android/20160708/Image.png)
android布局高级技术：</br>
1.重用布局。<include android:id="@+id/myid" layout="@layout/activity_main">还可以加上宽高自定义
在被重用的布局中声明merge，可以消除不必要的viewgroup。（比如两个垂直的linearlayout）
</br>2.动态装载布局，即在activity中用java手撸xml</br>
3.splash添加程序启动画面。在xml中定义一张图片作为启动画面，然后定义一个activity绑定该视图，经一两秒跳转到MainActiivity。</br>
<pre><code>private final int Splash_Display_Length=2000;
new Handler().postDelayed(new Runnable(){
  public void run(){
    Intent i=new Intent(SplashActivity.this,MainActivity.class);
    SplashActivity.this.startActivity(i);
    SplashActivity.this.finish();
  }
},Splash_Display_Length);</code></pre>
但是不推荐使用，现代APP应该是简洁易于使用的。</br>
button包括：ToggleButton(开关按钮)，常用属性设置。android:textOn=''选择时的文字''，textOff类似
</br>RadioButton（单选按钮）</br>
CheckBox(复选框)</br>
ImageButton</br>
spinner下拉列表，通过android：entries属性设置下拉选项所在的xml</br>
webview里面两个重要函数，setWebChromeClient()设置加载中和加载完成时的动作。SetWebViewClient()中重写shouldOverrideUrlLoading()以保证点击链接是还在此WebView中跳转，而不是跳转到自带浏览器
webView可以直接和JS交互，具体自己写个demo试下。</br>
angularJS</br>
