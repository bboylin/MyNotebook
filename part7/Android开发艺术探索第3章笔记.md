## View的事件体系
---

* 位置参数：top/left/right/bottom分别是相对父容器的坐标。而x/y是相对于坐标系原点的坐标。translationX和translationY分别是view自身相对坐标系原点的偏移量。有`x=left+translationX`和`y=top+translationY`。
* MotionEvent:`getX()`和`getY()`分别是点击处相对于view左上角的x/y坐标。`getRawX()`和`getRawY()`分别是点击处相对于手机屏幕左上角的x/y坐标。
* TouchSloup是系统所能识别出的被认为是滑动的最小距离，这是一个常量，与设备有关，可通过以下方法获得：
`ViewConfiguration.get(getContext()).getScaledTouchSloup()`
* 滑动冲突处理两种思路：一是重写父视图的`onInterceptTouchEvent`，`ACTION_DOWN`和`ACTION_UP`都返回false，`ACTION_MOVE`按需拦截。二是重写子view的`dispatchTouchEvent`，`ACTION_DOWN`的时候调用`parent.requestDisallowInterceptTouchEvent(true)`，`ACTION_MOVE`的时候判断如果父容器需要此点击事件的话`parent.requestDisallowInterceptTouchEvent(false)`，并且父容器需要重写`onInterceptTouchEvent`，`ACTION_DOWN`返回false。