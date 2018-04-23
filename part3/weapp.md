## 微信小程序踩的坑
---

### 1.scroll-view的坑

官网对scroll-view的文档有如下属性：

![](https://img-blog.csdn.net/20170120092459324?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvQmVpTGluWXU=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

而且提示了scroll-view上下滑动的时候需要设置高度，但是我设置了`style="height: 100%;"`却发现无法响应`bindscrolltolower`和`bindscrolltoupper`。这问题我猜原因在于外部view的高度对scroll-view不透明，而100%又是一个相对值，所以无法得知scroll-view的高度。

解决办法是：在js里获取到屏幕高度再绑定给wxml。

```js
wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        console.log(res.windowHeight)
        that.setData({
          wHeight: res.windowHeight
        })
      }
    })
```

```xml
<scroll-view scroll-y="true" style="height:{{wHeight}}px;" bindscrolltolower="loadMore">
....
</scroll-view>
```

Bug & Tip
* tip: 请勿在 scroll-view 中使用 textarea、map、canvas、video 组件
* tip: scroll-into-view 的优先级高于 scroll-top
* tip: 在滚动 scroll-view 时会阻止页面回弹，所以在 scroll-view 中滚动，是无法触发 onPullDownRefresh
* tip: 若要使用下拉刷新，请使用页面的滚动，而不是 scroll-view ，这样也能通过点击顶部状态栏回到页面顶部