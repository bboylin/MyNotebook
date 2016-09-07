### 八种排序算法的总结及实现
---
常见的排序算法有：

* 冒泡排序（bubble sort） — O(n^2）

* 插入排序（insertion sort）— O(n^2)

* 归并排序（merge sort）— O(nlogn); 需要 O(n) 额外空间

* 选择排序（selection sort）— O(n^2)

* 希尔排序（shell sort）— O(nlogn)

* 堆排序（heapsort）— O(nlogn)

* 快速排序（quicksort）— O(nlogn)所有nlg(n)复杂度排序算法里面常数因子最小的，综合性能很好

* 桶排序（bucket sort）—— O(n)牺牲空间换时间

根据稳定性可归为两类：

* stable sort：插入排序、冒泡排序、归并排序，桶排序。

* unstable sort：选择排序，快速排序，堆排序，希尔排序。

根据占用内存可分为两类：

* In-place sort（不占用额外内存或占用常数的内存）：插入排序、选择排序、冒泡排序、堆排序、快速排序。
* Out-place sort：归并排序，桶排序。

下面一一介绍，并附上c++实现。
* 冒泡排序：第i次外循环使A[i]比后面的数都小
```c++
void bubbleSort(int* a,int n)
{
    for(int i=0;i< n;++i)
        for(int j=n-1;j>i;--j)
        {
            if(a[j]>a[j-1])
                swap(a[j],a[j-1]);
        }
}
```

* 冒泡排序的优化：设置一个flag判断内循环是否执行了swap函数，没有则说明已经排序好了，可以直接break
```c++
void optimizedBubbleSort(int* a,int n)
{
    for(int i=0;i< n;++i)
    {
        bool isOver=true;
        for(int j=n-1;j>i;--j)
        {
            if(a[j]>a[j-1])
            {
                swap(a[j],a[j-1]);
                isOver=false;
            }
        }
        if(isOver)
            break;
    }
}
```
* 插入排序：第i次外循环保证前i个数有序
```c++
void insertsort(int A[],int n)
    {
        for(int i=1;i<n;++i)
            for(int j=i;(j>0)&&A[j]< A[j-1];--j)
        {
            swap(A[j-1],A[j]);
        }
    }
```
* 归并排序：实质是递归，是分治思想的体现，先分组排序再合并排序
```c++
void Merge(int a[],int left,int mid,int right)
    {
        int ln=mid-left+1;
        int rn=right-mid;
        int l[ln],r[rn],i,j,k=left;
        for(i=0;i< ln;i++)
            l[i]=a[left+i];
        for(j=0;j< rn;++j)
            r[j]=a[mid+1+j];
        i=0;
        j=0;
        while(i< ln&&j< rn)
        {
            if(l[i]< r[j]) a[k++]=l[i++];
            else a[k++]=r[j++];
        }
        while(i< ln) a[k++]=l[i++];
        while(j< rn) a[k++]=r[j++];
    }
void mergesort(int a[],int left,int right)
    {
        if(left< right)//之前漏了这句导致运行时内存错误。
        {
        int mid=(left+right)/2;
        mergesort(a,left,mid);
        mergesort(a,mid+1,right);
        Merge(a,left,mid,right);
        }
    }
```
* 选择排序：原理和冒泡排序类似，也是第i次外循环使A[i]比后面的数都小，但是交换次数少。
```c++
void selectsort(int* a,int n)
{
    int item;
    for(int i=0;i< n-1;i++)
    {
        int lowindex=i;
        for(int j=n-1;j>i;--j)
        {
            if(a[j]< a[lowindex]) lowindex=j;
        }
        if(i!=lowindex)
        {
            item=a[lowindex];
            a[lowindex]=a[i];
            a[i]=item;
        }
    }
}
```
* 希尔排序，也叫缩小增量排序，利用了插入排序的最优情况。
```c++
void insertsort(int A[],int n)
    {
        for(int i=1;i< n;++i)
            for(int j=i;(j>0)&&A[j]< A[j-1];--j)
        {
            swap(A[j-1],A[j]);
        }
    }
void shellsort(int *a,int n)
    {
        int k,i,j,temp;
        if(a==NULL||n<2) return;
        for(i=n/2;i>1;i=i/2)
            for(j=i;j<n;++j)
            {
              temp=a[j];
              for(k=j;k>=i&&temp< a[k-i];k-=i)
                    a[k]=a[k-i];
              a[k]=temp;
            }
        insertsort(a,n);
    }
```
* 堆排序：（二叉）堆是一个数组，可以近似的看作一个完全二叉树，最大堆指某节点的值小于等于其父节点的值。最差O(nlgn)。是一种非常高效的排序法。
```c++
void maxheapify(int *a,int i,int imax)
    {
        int l=2*i+1;
        int r=2*i+2;
        int largest=i;
        if(l<=imax) largest=a[l]>a[i]?l:i;
        if(r<=imax) largest=a[r]>a[largest]?r:largest;
        if(largest!=i)
        {
            swap(a[i],a[largest]);
            maxheapify(a,largest,imax);
        }
}
void buildmaxheap(int *a,int imax)
    {
        for(int j=imax/2;j>-1;j--) maxheapify(a,j,imax);
    }
void heapsort(int *a,int imax)
    {
        buildmaxheap(a,imax);
        for(int j=imax;j>0;j--)
        {
            swap(a[0],a[j]);
            --imax;
            maxheapify(a,0,imax);
        }
    }
```
* 快速排序：通常是实际应用中最好的选择，O(nlgn)中隐含的常数因子非常小。也是分治思想的体现。
	* 算法导论上面的实现
```c++
int q_partition(int a[],int p,int r)
    {
        int x=a[r];
        int i=p-1;
        for(int j=p;j< r;j++)
        {
            if(a[j]< x)
            {
                swap(a[++i],a[j]);
            }
        }
        swap(a[++i],a[r]);
        return i;
    }
    void quicksort(int a[],int p,int r)
    {
        if(p< r)
        {
            int q=q_partition(a,p,r);
            quicksort(a,p,q-1);
            quicksort(a,q+1,r);
        }
    }
```
* 课本教材上的实现（略有不同）
```c++
int partition1(int a[],int p,int r)
    {
        int k=a[p];
        while(p< r)
        {
            while(p< r&&k>a[r]) r--;
            a[p]=a[r];
            while(p< r&&k< a[p]) p++;
            a[r]=a[p];
        }
        a[p]=k;
        return p;
    }
    void qsort(int a[],int p,int r)
    {
        if(p< r)
        {
            int k=partition1(a,p,r);
            qsort(a,p,k-1);
            qsort(a,k+1,r);
        }
    }
```
* 桶排序：排序数A1,A2,A3...AN最大值为M，可设M个桶，即大小为M的数组count，初始化为0；扫描数组A1-AN，读Ai时count[Ai]++；最后扫描count数组,依次将AI打印count[AI]次就可以排好序。