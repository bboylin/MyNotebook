### fresco源码浅析（一）：overview
---

#### fresco的使用
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

#### 上述两行代码做了什么
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

		......

			/** Initializes Drawee with the specified config. */
	private static void initializeDrawee(
			Context context,
			@Nullable DraweeConfig draweeConfig) {
		sDraweeControllerBuilderSupplier =
				new PipelineDraweeControllerBuilderSupplier(context, draweeConfig);
		SimpleDraweeView.initialize(sDraweeControllerBuilderSupplier);
	}
```
主要是初始化了`ImagePipelineFactory`和构造了一个`draweeControllerBuilderSupplier`用之初始化`SimpleDraweeView`。

而
```java
simpleDraweeView.setImageUri(uri);
```
负责的是加载uri对应的图片。整体流程如下：

![](https://camo.githubusercontent.com/f3a3dc44d1281a12bbb98d5119a420e8c350911f/687474703a2f2f626c6f672e6465736d6f6e6479616f2e636f6d2f696d6167652f66726573636f2f73657175656e63655f6469616772616d5f736574557269536571312e504e47)

注：图片来自 [Fresco-Source-Analysis](https://github.com/desmond1121/Fresco-Source-Analysis/blob/2ccd3617574d97436ba8fb673e36c43efa28d900/Fresco%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90(3)%20-%20DraweeView%E6%98%BE%E7%A4%BA%E5%9B%BE%E5%B1%82%E6%A0%91.md)

可以将这张图描述为以下信息：

* DraweeView直接显示DraweeHierarchy；
* DraweeController根据Uri获取数据源DataSource，并绑定数据订阅者DataSubscriber；
* 当DataSource可以更新数据时通知DataSubscriber更新DraweeHierarchy。

#### fresco overview

![](https://upload-images.jianshu.io/upload_images/2911038-c8fb654a09bd843f?imageMogr2/auto-orient/)

图片来自 [何时夕的博客](https://www.jianshu.com/p/2dff47ae7666)


drawee module遵循了MVC模式，`DraweeView`继承自ImageView，范型类型继承`DraweeHierarchy`，作为展示`DraweeHierarchy`的View，并且利用`DraweeHolder`代理和controller和model沟通；`DraweeController`主要是连结获取图片数据的后端(possibly the image pipeline)和`SettableDraweeHierarchy`；`DraweeHierarchy`代表了视图的层级，对外界不可见，只暴露`getTopLevelDrawable`方法给外界显示图片。

imagepipeline module遵循观察者模式，pipeline每接到任务就创建一个producer，producer开始加载或者处理图片并产生结果--DataSource，DataSource状态有变化的时候就notify subscriber做相应的处理。例如使用fresco获取bitmap就可以这样做：
```java
DataSource<CloseableReference<CloseableImage>> dataSource = Fresco.getImagePipeline()
														.fetchDecodedImage(ImageRequestBuilder.newBuilderWithSource(uri).build(),activity);
dataSource.subscribe(new BaseBitmapDataSubscriber() {
		@Override
		protected void onNewResultImpl(@Nullable Bitmap bitmap) {
				if (bitmap != null && !bitmap.isRecycled()) {
						// do some thing
				}
		}

		@Override
		protected void onFailureImpl(DataSource<CloseableReference<CloseableImage>> dataSource) {
			// do some thing
		}

		@Override
		public void onCancellation(DataSource<CloseableReference<CloseableImage>> dataSource) {
				super.onCancellation(dataSource);
				// do some thing
		}
}, UiThreadImmediateExecutorService.getInstance());
```

// todo : producers, cache, drawable, gif, design pattern