## RN踩的坑（持续更新）
---

### 1.image组件注意事项

image组件一定要手动设置好宽和高，否则不会显示。另外，即使这样，在Android 8.0上image在debug版的APP上无法显示，iOS正常，GitHub上看到同样的issue，不过没人回应。还有在flatlist里image作为header，我是先fetch到image的URL，再给flatlist rerender，出现的bug是flatlist onrefresh的时候image会闪烁三下。

### 2.navigator在同一个页面不能有两个

### 3.css不支持百分比，可以用flexbox替代，Dimension也可获取到屏幕宽高，当然单位都是dp。