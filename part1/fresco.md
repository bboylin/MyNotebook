# fresco源码分析
---

## fresco的使用
通常在application里初始化：
```java
Fresco.initialize(this);
```
开始加载图片：
```java
simpleDraweeView.setImageUri(uri);
```
剩下的fresco会帮你完成：
* 显示占位图
* 下载图片
* 缓存图片
* 图片不再显示时从内存中移除

<!-- ## 上述两行代码做了什么
查看fresco源码，可以看到：
```java
Fresco.initialize(this);
```
主要做了：
```java
    // we should always use the application context to avoid memory leaks
    context = context.getApplicationContext();
    if (imagePipelineConfig == null) {
      ImagePipelineFactory.initialize(context);
    } else {
      ImagePipelineFactory.initialize(imagePipelineConfig);
    }
    initializeDrawee(context, draweeConfig);
```
主要是初始化了`ImagePipeline`的工厂类和构造了一个`draweeControllerBuilderSupplier`用之初始化`SimpleDraweeView`。 -->

## 