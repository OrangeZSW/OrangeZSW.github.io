# JUC

思维导图：https://server.blog.zorange.online/files/de1cdc38f6c34ecb8304253a283acaa3.png

## JUC是什么？

在 Java 5.0 提供了 `java.util.concurrent`(简称JUC)包，在此包中增加了在并发编程中很常用的工具类。此包包括了几个小的、已标准化的可扩展框架，并提供一些功能实用的类，没有这些类，一些功能会很难实现或实现起来冗长乏味。

## 进程和线程

进程：进程是一个具有一定**独立功能的程序**关于某个数据集合的一次运行活动。它是操作系统动态执行的基本单元，在传统的操作系统中，进程既是基本的分配单元，也是基本的执行单元。

线程：通常在**一个进程中可以包含若干个线程**，当然一个进程中至少有一个线程，不然没有存在的意义。线程可以利用进程所拥有的资源，在引入线程的操作系统中，通常都是把进程作为分配资源的基本单位，而把线程作为独立运行和独立调度的基本单位，由于线程比进程更小，基本上不拥有系统资源，故对它的调度所付出的开销就会小得多，能更高效的提高系统多个程序间并发执行的程度。

## 并行和并发

## wait和sleep的区别

| 区别    | wait   | sleep    |
| ------- | ------ | -------- |
| 类      | Object | Thread   |
| 锁      | 释放锁 | 不释放锁 |
| cpu资源 | 释放   | 释放     |

## 创建多线程的四种方法

1. 继承Thread类，实现run方法
2. 实现Runable接口
3. 实现Callable接口，借助FutrueTask实现一个带返回值的线程
4. 线程池

## Synchronized

1. 普通方法：锁对象是当前对象
2. 静态方法：锁对象是当前类的字节码对象
3. 代码块：锁对象是自定义的

> 普通方法和静态方法的锁对象是不会互相竞争

```java
/**
 * @author orange
 * @since 2024/9/4
 */
class Resource1{
    private int num=10;
    synchronized void get(){
         try {
             Thread.sleep(10);
         } catch (InterruptedException e) {
             throw new RuntimeException(e);
         }
         if(num<=0){
            System.out.println(Thread.currentThread().getName()+"买票失败，没票了");
            return;
        }
        System.out.println(Thread.currentThread().getName()+"买到了，"+"还剩"+num--+"张");
    }

}
public class SyncTest {
    public static void main(String[] args) {
        Resource1 resource1 = new Resource1();
        for (int i=1;i<=30;i++){
            new Thread(resource1::get,i+"").start();
        }
    }
}
```

### 多线程编程模板

1. 创建资源类
2. 资源类创建同步方法、同步代码块
3. 多线程调用

## Lock锁

相比同步锁，JUC包中的Lock锁的功能更加强大，它提供了各种各样的锁（公平锁，非公平锁，共享锁，独占锁……），所以使用起来很灵活。

- 是一个接口，主要有三个实现：ReentrantLock、ReentrantReadWriteLock.ReadLock、ReentrantReadWriteLock.WriteLock

### ReentrantLock可重入锁

- 可重入锁：

  在一个线程调用了一个资源类的一个同步方法后，在这个方法里面又调用了这个资源类的另外一个同步方法，且两个方法的锁是同一个。

  A--->S1---->S2

  若这个锁不可重入，此时会发生死锁.可重入的话就不会死锁，这个锁任然可以正常获取

- Synchronized也是可重入锁

- 可重入锁可以解决死锁问题

### 公平锁

- 公平锁：在锁上等待的时间最长的线程将活得锁。

  ```java
  private ReentrantLock lock = new ReentrantLock(true); 
  ```

### 限时等待

通过我们的tryLock方法来实现，可以选择传入时间参数，表示等待指定的时间，无参则表示立即返回锁申请的结果：true表示获取锁成功，false表示获取锁失败。我们可以将这种方法用来解决死锁问题。

> 响应中断

```java
lock.tryLock()
lock.tryLock(Long timeout,Timeunit unit)   //经过多次时间放弃
```

### ReentrantLock和synchronized区别

| 区别           | ReentrantLock | synchronized   |
| -------------- | ------------- | -------------- |
| 可重入         | yes           | yes            |
| 独占锁         | yes           | yes            |
| 隐式释放\|显示 | 显示          | 隐式           |
| 响应中断       | 可以响应中断  | 不可以响应中断 |

响应中断：拿不到锁就中断线程。

### ReentrantReadWriteLock读写锁

在并发场景中用于解决线程安全的问题，我们几乎会高频率的使用到独占式锁，通常使用java提供的关键字synchronized或者concurrents包中实现了Lock接口的ReentrantLock。它们都是独占式获取锁，也就是在同一时刻只有一个线程能够获取锁。而在一些业务场景中，大部分只是读数据，写数据很少，如果仅仅是读数据的话并不会影响数据正确性（出现脏读），而如果在这种业务场景下，依然使用独占锁的话，很显然这将是出现性能瓶颈的地方。针对这种读多写少的情况，java还提供了另外一个实现Lock接口的**ReentrantReadWriteLock**(读写锁)。**读写锁允许同一时刻被多个读线程访问，但是在写线程访问时，所有的读线程和其他的写线程都会被阻塞**。

**特点**：

- 写写不可并发
- 读写不可并发
- 读读可以并发

读写锁：读写锁中的读锁和写锁实际是一把锁的两个不同角色。

读锁：读共享

写锁:  独占锁

```java
package online.zorange;


import java.util.HashMap;
import java.util.Map;

import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * @author orange
 * @since 2024/9/4
 */
class Resource2{
    private final Map<String,String> map=new HashMap<>();
    ReentrantReadWriteLock reentrantReadWriteLock= new ReentrantReadWriteLock();
    ReentrantReadWriteLock.ReadLock readLock = reentrantReadWriteLock.readLock();
    ReentrantReadWriteLock.WriteLock writeLock=reentrantReadWriteLock.writeLock();

    void put(String key,String value){
        try {
            Thread.sleep(20);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        writeLock.lock();
        System.out.println(Thread.currentThread().getName()+"开始写入，key:"+key+",value:"+value);
        map.put(key,value);
        System.out.println(Thread.currentThread().getName()+"写入成功,key:"+key+",value:"+value);
        writeLock.unlock();
    }
    void get(String key){
        try {
            Thread.sleep(20);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        readLock.lock();
        System.out.println(Thread.currentThread().getName()+"开始读取,key:"+key);
        String value = map.get(key);
        System.out.println(Thread.currentThread().getName()+"读取成功，key:"+key+",value:"+value);
        readLock.unlock();
    }

}
public class ReadWriteLock {
    public static void main(String[] args) {
        Resource2 resource2 = new Resource2();
        for (int i = 1; i <=10 ; i++) {
            String a=i+"";
            new Thread(()->{
                resource2.put(a,a);
            },"线程"+i).start();
            new Thread(()->{
                resource2.get(a);
            },"线程"+i).start();
        }
    }
}

```

### 锁降级

什么是锁降级，锁降级就是从写锁降级成为读锁。在当前线程拥有写锁的情况下，再次获取到读锁，随后释放写锁的过程就是锁降级。这里可以举个例子：

```java
public void test(){
    rwlock.writeLock().lock();
    System.out.println("获取到写锁。。。。");
    rwlock.readLock().lock();
    System.out.println("获取到读锁----------");
    rwlock.writeLock().unlock();
    System.out.println("释放写锁==============");
    rwlock.readLock().unlock();
    System.out.println("释放读锁++++++++++++++++");
}
```

只能由写锁降级到读锁，不能由读锁升级到写锁

### 读写锁总结

1. 支持公平/非公平策略

2. 支持可重入

   - 同一读线程在获取了读锁后还可以获取读锁
   - 同一写线程在获取了写锁之后既可以再次获取写锁又可以获取读锁

3. 支持锁降级，不支持锁升级

4. 读写锁如果使用不当，很容易产生“写饥饿”问题：

   在读线程非常多，写线程很少的情况下，很容易导致写线程“饥饿”，虽然使用“公平”策略可以一定程度上缓解这个问题，但是“公平”策略是以牺牲系统吞吐量为代价的。

5. Condition条件支持

   写锁可以通过`newCondition()`方法获取Condition对象。但是读锁是没法获取Condition对象，读锁调用`newCondition() `方法会直接抛出`UnsupportedOperationException`。

## 线程通信

### 线程通信模板

1. 定义资源类、方法
2. 资源类方法：
   - 判断（符合条件就运行，不符合就等待）
   - 执行
   - 唤醒
3. 通过多线程操作共享资源

### synchronized和Lock锁的通信区别 （await、Condition）

- synchronized     wait -----wait（time）-----notify-----notifyAll
- lock        lock.newCondition.await------lock.condition.signal-----lock.condition.signalAll

### 线程通信涉及多个线程时

#### 虚假唤醒

**问题**：一个线程在判断之后wait，之后被唤醒时，会直接从wait唤醒，此时如果用的if，就不会再进行判断。就算不符合条件也会运行。

**解决**：将if换为while

**原因**：线程被唤醒时不是从头开始，而是从wait开始

### 定制化线程间通信

> 通过多钥匙实现**指定线程**唤醒

**案例**：多线程间有序运行

​			a打印10次，b再打印10次，c再打印10次

**原理**：通过lock锁的多condition来实现指定唤醒线程，只有被同一个condition .await的才能被这个candition的signal唤醒。

**代码**：

```java
package online.zorange.thread.communication;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @author orange
 * @since 2024/9/6
 */

class Resource{
    int flag=1;
    Lock lock=new ReentrantLock();
    Condition conditionA=lock.newCondition();
    Condition conditionB=lock.newCondition();
    Condition conditionC=lock.newCondition();
    void AA(){
        lock.lock();
        while (flag!=1){
            try {
                conditionA.await();
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        for (int i = 0; i < 10; i++) {
            System.out.print(Thread.currentThread().getName()+"AA ");
        }
        System.out.println();
        flag++;
        conditionB.signal();
        lock.unlock();
    }
    void BB(){
        lock.lock();
        while (flag!=2){
            try {
                conditionB.await();
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        for (int i = 0; i < 10; i++) {
            System.out.print(Thread.currentThread().getName()+"BB ");
        }
        System.out.println();
        flag++;
        conditionC.signal();
        lock.unlock();
    }
    void CC(){
        lock.lock();
        while (flag!=3){
            try {
                conditionC.await();
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        for (int i = 0; i < 10; i++) {
            System.out.print(Thread.currentThread().getName()+"CC ");
        }
        System.out.println();
        flag=1;
        conditionA.signal();
        lock.unlock();
    }


}
public class AaBbCc {
    public static void main(String[] args) {
        Resource resource = new Resource();

        new Thread(()->{
            for (int j = 0; j < 10; j++) {
                resource.BB();
            }
        },"2").start();
        new Thread(()->{
            for (int j = 0; j < 10; j++) {
                resource.AA();
            }
        },"1").start();
        new Thread(()->{
            for (int j = 0; j < 10; j++) {
                resource.CC();
            }
        },"3").start();
    }
}

```

## 并发容器类

面试题：

​	请举例说明集合类是不安全的。

​                                   原因：                             解决方案

ArrayList:                  没有锁                            给代码块解锁、

​                                                                         vector、底层扩容基于数组、速度慢、稍微浪费内存、

​                                                                          Collections.synchronizedList(list);  有锁、底层扩容基于List、速度相较于   vector快一些、

​                                                                          CopyOnWriteArrayList: 适用于高并发读写操作，解决了读写冲突问题。

HashSet                    没有锁                            给代码块解锁：  

​                                                                          Collections.synchronizedSet(set)     

​                                                                         CopyOnWriteArraySet:  适用于高并发读写操作，解决了读写冲突问题。

HashMap:                 没有锁                           给代码块解锁：  

​                                                                        Collections.synchronizedMap(map)     

​                                                                        HashTable:在高并发场景下性能较差，因全表锁定导致大量锁竞争。

​                                                                       ConcurrentHashMap: 在高并发场景下性能优越，允许更高的并发访问,底层基于CAS乐观锁实现的。



​	**CopyOnWrite容器**（简称COW容器）即**写时复制**的容器。通俗的理解是当我们往一个容器添加元素的时候，不直接往当前容器添加，而是先将当前容器进行Copy，复制出一个新的容器，然后新的容器里添加元素，添加完元素之后，再将原容器的引用指向新的容器。这样做的好处是我们可以对CopyOnWrite容器进行并发的读，而不需要加锁，因为当前容器不会添加任何元素。所以**CopyOnWrite容器也是一种读写分离的思想，读和写不同的容器**。

**CopyOnWrite并发容器用于读多写少的并发场景**。比如：白名单，黑名单。假如我们有一个搜索网站，用户在这个网站的搜索框中，输入关键字搜索内容，但是某些关键字不允许被搜索。这些不能被搜索的关键字会被放在一个黑名单当中，黑名单一定周期才会更新一次。



缺点：

1. **内存占用问题。**写的时候会创建新对象添加到新容器里，而旧容器的对象还在使用，所以有两份对象内存。通过压缩容器中的元素的方法来减少大对象的内存消耗，比如，如果元素全是10进制的数字，可以考虑把它压缩成36进制或64进制。或者不使用CopyOnWrite容器，而使用其他的并发容器，如ConcurrentHashMap。
2. **数据一致性问题。**CopyOnWrite容器只能保证数据的最终一致性，不能保证数据的实时一致性。所以如果你希望写入的的数据，马上能读到，请不要使用CopyOnWrite容器。

## JUC下的强大辅助工具类

1. CountDownLatch(倒计数器)
2. CycliBarrier(循环栅栏)
3. Samaphore（信号量）

### CountDownLatch

**使用**：设置一个计数器。每当一个线程调用该计数器的countDown时，计数器减一

在主线程或另外一个线程中，使用计数器的await方法，进入阻塞状态，只有当计数器减为0之后，该线程才会继续运行。

```java
new CountDownLatch(int count) //实例化一个倒计数器，count指定初始计数
countDown() // 每调用一次，计数减一
await() //等待，当计数减到0时，阻塞线程（可以是一个，也可以是多个）并行执行
```

**代码**：

```java
package online.zorange.thread.communication;

import java.util.Random;
import java.util.concurrent.CountDownLatch;

/**
 * @author orange
 * @since 2024/9/6
 */
public class CountDownTest {

    static String[] country = {"俄罗斯", "美国", "德国", "意大利", "中国"};

    public static void main(String[] args) {
        CountDownLatch count = new CountDownLatch(5);
        for (String s : country) {
            new Thread(() -> {
                try {
                    Thread.sleep(new Random().nextInt(3000));
                    System.out.println(Thread.currentThread().getName() + "同意!");
                    count.countDown();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }, s).start();
        }
        try {
            count.await();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println("核弹发射!!!!!");
    }
}

```

### CyclicBarrier

**介绍**：在多线程场景下，若某些任务需要多个线程同时进行。且存在多个任务时，使用CyclicBarrier。

且在每完成一个任务时的最后一个完成线程可以添加额外功能。

**常用方法**：

1. CyclicBarrier(int parties, Runnable barrierAction) 创建一个CyclicBarrier实例，parties指定参与相互等待的线程数，**barrierAction一个可选的Runnable命令，该命令只在每个屏障点运行一次，可以在执行后续业务之前共享状态。该操作由最后一个进入屏障点的线程执行。**
2. CyclicBarrier(int parties) 创建一个CyclicBarrier实例，parties指定参与相互等待的线程数。
3. await() 该方法被调用时表示当前线程已经到达屏障点，当前线程阻塞进入休眠状态，**直到所有线程都到达屏障点**，当前线程才会被唤醒。

**相对于CountDown的区别**：

CountDown只能存在一个主任务，而CyclicBarrier在完成一个任务之后，计数器可以重置。

**代码使用**：

```java
package online.zorange.thread.communication;

import java.util.Random;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

/**
 * @author orange
 * @since 2024/9/6
 */
class Resource2{

}
public class CyclicBarrierTest {
    public static void main(String[] args) {
        CyclicBarrier cyclicBarrier = new CyclicBarrier(4,()->{
            System.out.println("最菜玩家出现了，他就是："+Thread.currentThread().getName());
        });

        for (int i = 1; i <= 4; i++) {
            new Thread(()->{
                for (int j = 1; j <= 4; j++) {
                    try {
                        System.out.println(Thread.currentThread().getName()+"正在闯第"+j+"关");
                        Thread.sleep(new Random().nextInt(3000));
                        System.out.println(Thread.currentThread().getName()+"闯过了"+j+"关");
                        cyclicBarrier.await();
                    } catch (InterruptedException e) {
                        throw new RuntimeException(e);
                    } catch (BrokenBarrierException e) {
                        throw new RuntimeException(e);
                    }
                }
            },"玩家"+ i).start();
        }
    }
}

```

### Semaphore

Semaphore翻译成字面意思为 信号量，Semaphore可以控制同时访问的线程个数。非常适合需求量大，而资源又很紧张的情况。比如给定一个资源数目有限的资源池，假设资源数目为N，每一个线程均可获取一个资源，但是当资源分配完毕时，后来线程需要阻塞等待，直到前面已持有资源的线程释放资源之后才能继续。

**介绍**：主要用于限流，限制多少个线程同时运行某个任务。

信号量主要用于两个目的：

1. 多个共享资源的互斥使用。
2. 用于并发线程数的控制。保护一个关键部分不要一次输入超过N个线程。

sentinel限流

**代码**：

```java
package online.zorange.thread.communication;

import java.util.Random;
import java.util.concurrent.Semaphore;

/**
 * @author orange
 * @since 2024/9/6
 */
public class SemaphoreTest {
    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(3);

        for (int i = 1; i <= 10; i++) {
            new Thread(()->{
                try {
                    semaphore.acquire();
                    System.out.println(Thread.currentThread().getName()+"登录成功");
                    System.out.println(Thread.currentThread().getName()+"正在pk...");
                    Thread.sleep(new Random().nextInt(4000));
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                System.out.println(Thread.currentThread().getName()+"玩累了,退出了");
                semaphore.release();
            },"玩家"+i).start();

        }
    }

}
```

## Callable

### 面试题：callable接口与runnable接口的区别？

相同点：都是接口，都可以编写多线程程序，都采用Thread.start()启动线程

不同点：

1. 具体方法不同：一个是run，一个是call
2. Runnable没有返回值；Callable可以返回执行结果，是个泛型
3. Callable接口的call()方法允许抛出异常；Runnable的run()方法异常只能在内部消化，不能往上继续抛
4. 它提供了检查计算是否完成的方法，以等待计算的完成，并检索计算的结果。 

## 阻塞队列

介绍：在多线程领域：所谓阻塞，在某些情况下会挂起线程（即阻塞），一旦条件满足，被挂起的线程又会自动被唤起

BlockingQueue即阻塞队列，是java.util.concurrent下的一个接口，因此不难理解，BlockingQueue是为了解决多线程中数据高效安全传输而提出的。从阻塞这个词可以看出，在某些情况下对阻塞队列的访问可能会造成阻塞。被阻塞的情况主要有如下两种：

1. 当队列满了的时候进行入队列操作
2. 当队列空了的时候进行出队列操作

### BlockingQueue

java.util.concurrent 包里的 BlockingQueue是一个接口，继承Queue接口，Queue接口继承 Collection。

BlockingQueue接口主要有以下7个实现类：

1. **ArrayBlockingQueue**：由数组结构组成的有界阻塞队列。
2. **LinkedBlockingQueue**：由链表结构组成的有界（但大小默认值为integer.MAX_VALUE）阻塞队列。
3. PriorityBlockingQueue：支持优先级排序的无界阻塞队列。
4. DelayQueue：使用优先级队列实现的延迟无界阻塞队列。
5. **SynchronousQueue**：不存储元素的阻塞队列，也即单个元素的队列。
6. LinkedTransferQueue：由链表组成的无界阻塞队列。
7. LinkedBlockingDeque：由链表组成的双向阻塞队列。

**Blockingqueue的方法**：

它的方法可以分成以下4类：

|          | 抛出异常  | 特殊值   | 阻塞   | 超时                 |
| -------- | --------- | -------- | ------ | -------------------- |
| **插入** | add(e)    | offer(e) | put(e) | offer(e, time, unit) |
| **移除** | remove()  | poll()   | take() | poll(time, unit)     |
| **检查** | element() | peek()   | 不可用 | 不可用               |


**抛出异常**

add正常执行返回true，element（不删除）和remove返回阻塞队列中的第一个元素
		当阻塞队列满时，再往队列里add插入元素会抛IllegalStateException:Queue full
		当阻塞队列空时，再往队列里remove移除元素会抛NoSuchElementException
		当阻塞队列空时，再调用element检查元素会抛出NoSuchElementException

**特定值**
		插入方法，成功ture失败false
		移除方法，成功返回出队列的元素，队列里没有就返回null
		检查方法，成功返回队列中的元素，没有返回null

**一直阻塞**

如果试图的操作无法立即执行，该方法调用将会发生阻塞，直到能够执行。
		当阻塞队列满时，再往队列里put元素，队列会一直阻塞生产者线程直到put数据or响应中断退出
		当阻塞队列空时，再从队列里take元素，队列会一直阻塞消费者线程直到队列可用

**超时退出**

如果试图的操作无法立即执行，该方法调用将会发生阻塞，直到能够执行，但等待时间不会超过给定值。
		返回一个特定值以告知该操作是否成功(典型的是 true / false)。
		

## 线程池

**优势**：线程复用；控制最大并发数；管理线程。

1. 降低资源消耗。通过重复利用已创建的线程降低线程创建和销毁造成的销耗。​​
2. 提高响应速度。当任务到达时，任务可以不需要等待线程创建就能立即执行。
3. 提高线程的可管理性。线程是稀缺资源，如果无限制的创建，不仅会销耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控。

### 线程池使用的两种方式：

 1.使用现成的工具类得到线程池

```java
 * Executors:
*   1.一池一线程： Executors.newSingleThreadExecutor()
 *   2.一池n线程：  Executors.newFixedThreadPool(5):OOM异常
*   3.一池多线程:  Executors.newCachedThreadPool();OOM异常
```

​    2.用户自定义线程池
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/4c1f58c69a3d2d9e55d09a18ce7a16a1.png)

线程池工具类的三个方法的本质都是ThreadPoolExecutor的实例化对象

### 线程池的7个参数
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/03ee9499fb5f1b533fe6d193c1b406d6.png)


1. corePoolSize：线程池中的常驻核心线程数
2. maximumPoolSize：线程池中能够容纳同时 执行的最大线程数，此值必须大于等于1
3. keepAliveTime：多余的空闲线程的存活时间 当前池中线程数量超过corePoolSize时，当空闲时间达到keepAliveTime时，多余线程会被销毁直到 只剩下corePoolSize个线程为止
4. Timeunit：keepAliveTime的单位 
5. workQueue：任务队列，被提交但尚未被执行的任务
6. threadFactory：表示生成线程池中工作线程的线程工厂， 用于创建线程，一般默认的即可
7. handler：拒绝策略，表示当队列满了，并且工作线程大于 等于线程池的最大线程数（maximumPoolSize）时，如何来拒绝 请求执行的runnable的策略

### 线程池的工作原理

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/03614a601789d1577e3515876f24e080.png)

1. 在创建了线程池后，线程池中的线程数为零。
2. 当调用execute()方法添加一个请求任务时，线程池会做出如下判断：
   1. 如果正在运行的线程数量小于corePoolSize，那么马上创建线程运行这个任务；
   2. 如果正在运行的线程数量大于或等于corePoolSize，那么将这个任务放入队列；
   3. 如果这个时候队列满了且正在运行的线程数量还小于maximumPoolSize，那么还是要创建非核心线程立刻运行这个任务；
   4. 如果队列满了且正在运行的线程数量大于或等于maximumPoolSize，那么线程池会启动饱和拒绝策略来执行。
3. 当一个线程完成任务时，它会从队列中取下一个任务来执行。
4. 当一个线程无事可做超过一定的时间（keepAliveTime）时，线程会判断：
   如果当前运行的线程数大于corePoolSize，那么这个线程就被停掉。
   所以线程池的所有任务完成后，它最终会收缩到corePoolSize的大小。

>线程池的最大负载：maximumpoolsize+blockingqueuesize

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/0661de0e6e05f34962ba290b0253d90f.png)


### 拒绝策略

一般我们创建线程池时，为防止资源被耗尽，任务队列都会选择创建有界任务队列，但种模式下如果出**现任务队列已满且线程池创建的线程数达到你设置的最大线程数时**，这时就需要你指定ThreadPoolExecutor的RejectedExecutionHandler参数即合理的拒绝策略，来处理线程池"超载"的情况。



ThreadPoolExecutor自带的拒绝策略如下：

1. AbortPolicy(默认)：**直接抛出RejectedExecutionException异常**阻止系统正常运行
2. CallerRunsPolicy：“调用者运行”一种调节机制，该策略既不会抛弃任务，也不会抛出异常，而是将**某些任务回退到调用者**，从而降低新任务的流量。
3. DiscardOldestPolicy：**抛弃队列中等待最久的任务**，然后把当前任务加人队列中 尝试再次提交当前任务。
4. DiscardPolicy：**该策略默默地丢弃无法处理的任务**，不予任何处理也不抛出异常。 如果允许任务丢失，这是最好的一种策略。

**以上内置的策略均实现了RejectedExecutionHandler接口，也可以自己扩展RejectedExecutionHandler接口，定义自己的拒绝策略.**

### 自定义线程池

```java
public class ThreadPoolDemo {

    public static void main(String[] args) {
        // 创建单一线程的连接池
        // ExecutorService threadPool = Executors.newSingleThreadExecutor();
        // 创建固定数线程的连接池
        // ExecutorService threadPool = Executors.newFixedThreadPool(3);
        // 可扩容连接池
        // ExecutorService threadPool = Executors.newCachedThreadPool();

        // 自定义连接池
        ExecutorService threadPool = new ThreadPoolExecutor(2, 5,
                2, TimeUnit.SECONDS, new ArrayBlockingQueue<>(3),
                Executors.defaultThreadFactory(),
                //new ThreadPoolExecutor.AbortPolicy()
                //new ThreadPoolExecutor.CallerRunsPolicy()
                //new ThreadPoolExecutor.DiscardOldestPolicy()
                //new ThreadPoolExecutor.DiscardPolicy()
                new RejectedExecutionHandler() {
                    @Override
                    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
                        System.out.println("自定义拒绝策略");
                    }
                }
        );

        try {
            for (int i = 0; i < 9; i++) {
                threadPool.execute(() -> {
                    System.out.println(Thread.currentThread().getName() + "执行了业务逻辑");
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            threadPool.shutdown();
        }
    }
}
```

**优化**：

1. 在实际开发中，将自定义线程池放入spring容器中，单例
2. 实际生产环境下，核心线程数=最大线程数，防止程序运行期间，反复创建、销毁线程、造成资源消耗。一般把最大线程数和核心线程数设置为一样
3. 线程数的设置
   - IO密集型【web应用】：cpu核数*2，程序中大量进行IO操作，对cpu要求并不高因此执行流个数没有太大要求
   - 计算密集型：cpu核数+1: 像计算圆周率、对高清视频解码等全靠cpu计算。 +1是为了预防有个线程被阻塞，cpu可以调用其他线程
4. 动态获取cpu核心数

```java
 int coreSize = Runtime.getRuntime().availableProcessors();
```

  5. 在创建线程池时，默认开启一个或全部核心线程

```java
executorService.prestartCoreThread();//开启一个核心线程
executorService.prestartAllCoreThreads();//开启所有的核心线程
```

## 多线程高并发底层原理

计算机运行架构图
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/185269c1ad455db1f0a69020f7244535.png)


### java内存模型

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/a2efb89bb1ed915e25cbdc9b6926eaf6.png)

JMM规定了内存主要划分为**主内存**和**工作内存**两种。

> **主内存**：保存了所有的变量。
> **共享变量**：如果一个变量被多个线程使用，那么这个变量会在每个线程的工作内存中保有一个副本，这种变量就是共享变量。
> **工作内存**：每个线程都有自己的工作内存，线程独享，保存了线程用到的变量副本（主内存共享变量的一份拷贝）。工作内存负责与线程交互，也负责与主内存交互。

此处的主内存和工作内存跟JVM内存划分（堆、栈、方法区）是在不同的维度上进行的，如果非要对应起来，主内存对应的是Java堆中的对象实例部分，工作内存对应的是栈中的部分区域，从更底层的来说，**主内存对应的是硬件的物理内存，工作内存对应的是寄存器和高速缓存**。

JMM对共享内存的操作做出了如下两条规定：

> - 线程对共享内存的所有操作都必须在自己的工作内存中进行，不能直接从主内存中读写；
> - 不同线程无法直接访问其他线程工作内存中的变量，因此共享变量的值传递需要通过主内存完成。

#### 并发编程的三大特性：

- **原子性：**即不可分割性。比如 a=0；（a非long和double类型） 这个操作是不可分割的，那么我们说这个操作是原子操作。再比如：a++； 这个操作实际是a = a + 1；是可分割的，所以他不是一个原子操作。非原子操作都会存在线程安全问题，需要**使用同步技术（sychronized）或者锁（Lock）来让它变成一个原子操作**。一个操作是原子操作，那么我们称它具有原子性。java的concurrent包下提供了一些原子类，我们可以通过阅读API来了解这些原子类的用法。比如：**AtomicInteger、AtomicLong、AtomicReference**等。

- **可见性：**每个线程都有自己的工作内存，所以当某个线程修改完某个变量之后，在其他的线程中，未必能观察到该变量已经被修改。**在 Java 中 volatile、synchronized 和 final 实现可见性。**volatile只能让被他修饰内容具有可见性，但不能保证它具有原子性。

- **有序性：**java的有序性跟线程相关。一个线程内部所有操作都是有序的，如果是多个线程所有操作都是无序的。因为JMM的工作内存和主内存之间存在延迟，而且java会对一些指令进行重新排序。volatile和synchronized可以保证程序的有序性，很多程序员只理解这两个关键字的执行互斥，而没有很好的理解到volatile和synchronized也能保证指令不进行重排序。

### volatile关键字

> volatile可以解决可见性和有序性、不能解决原子性

Java语言提供了一种稍弱的同步机制，即volatile变量，用来确保将变量的更新操作通知到其他线程(volatile修饰的变量从主内存获取)。

当把变量声明为volatile类型后，编译器与运行时都会注意到这个变量是共享的，因此**不会将该变量上的操作与其他内存操作一起重排序**。

　　**在访问volatile变量时不会执行加锁操作，因此也就不会使执行线程阻塞，因此volatile变量是一种比sychronized关键字更轻量级的同步机制。**



当一个变量定义为 volatile 之后，将具备两种特性：

- 保证此变量对所有的线程的可见性。

- 禁止指令重排序优化。有volatile修饰的变量，赋值后多执行了一个“load addl $0x0, (%esp)”操作，这个操作相当于一个**内存屏障**（指令重排序时不能把后面的指令重排序到内存屏障之前的位置），只有一个CPU访问内存时，并不需要内存屏障。
- 不保证变量的原子性



volatile 性能：volatile 的读性能消耗与普通变量几乎相同，但是写操作稍慢，因为它需要在本地代码中插入许多内存屏障指令来保证处理器不发生乱序执行。

## CAS  (campare and set(swap))

CAS：Compare and Swap。比较并交换的意思。CAS操作有3个基本参数：内存地址A，旧值B，新值C。它的作用是将指定内存地址A的内容与所给的旧值B相比，如果相等，则将其内容替换为指令中提供的新值C；如果不等，则更新失败。类似于修改登陆密码的过程。当用户输入的原密码和数据库中存储的原密码相同，才可以将原密码更新为新密码，否则就不能更新。

**CAS是解决多线程并发安全问题的一种乐观锁算法。**因为它在对共享变量更新之前，会先比较当前值是否与更新前的值一致，如果一致则更新，如果不一致则循环执行（称为自旋锁），直到当前值与更新前的值一致为止，才执行更新。

Unsafe类是CAS的核心类，提供**硬件级别的原子操作**（目前所有CPU基本都支持硬件级别的CAS操作）。

### 缺点

**开销大**：在并发量比较高的情况下，如果反复尝试更新某个变量，却又一直更新不成功，会给CPU带来较大的压力

**ABA问题**：当变量从A修改为B再修改回A时，变量值等于期望值A，但是无法判断是否修改，CAS操作在ABA修改后依然成功。版本号 

 **不能保证代码块的原子性**：CAS机制所保证的只是一个变量的原子性操作，而不能保证整个代码块的原子性。

## AQS

AbstractQueuedSynchronizer抽象队列同步器简称AQS，它是实现同步器的基础组件（框架），juc下面Lock（ReentrantLock、ReentrantReadWriteLock等）的实现以及一些并发工具类（Semaphore、CountDownLatch、CyclicBarrier等）就是通过AQS来实现的。具体用法是通过继承AQS实现其模板方法，然后将子类作为同步组件的内部类。But StampLock不是基于AQS实现的。

>  JUC 工具类 框架底层加锁和解锁都是根据AQS实现的，是所有JUC包下工具类的解锁和解锁实现的基石，当然我们也可以基于AQS自定义一些加锁和解锁的工具类。

### 框架结构

AQS框架结构如下：

AQS内部维护着一个FIFO双向队列，该队列就是`CLH同步队列`。
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/6e0cb17740d4ca629866070f18b00666.png)

AQS维护了一个volatile语义(支持多线程下的可见性)的共享资源变量**state**和一个FIFO（first-in-first-out）**线程等待队列**(多线程竞争state资源被阻塞时，会进入此队列)。

`state 属性表示资源的状态`

例如：

- 对于ReentrantLock来说，state=1，表示资源被占用；state=0，表示资源没有被占用。
- 对于CountDownLatch来说，state=0，表示计数器归零，所有线程都可以访问资源；status为N表示计数器未归零，所有线程都需要阻塞。

### 基于AQS实现锁的思路

AQS将大部分的同步逻辑均已经实现好，继承的自定义同步器只需要实现state的获取(acquire)和释放(release)的逻辑代码就可以，主要包括下面方法：

- acquire(int)：独占方式。尝试获取资源，成功则返回true，失败则返回false。
- release(int)：独占方式。尝试释放资源，成功则返回true，失败则返回false。
- 
- acquireShared(int)：共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。
- releaseShared(int)：共享方式。尝试释放资源，如果释放后允许唤醒后续等待结点返回true，否则返回false。
- 
- isHeldExclusively()：该线程是否正在独占资源。只有用到condition才需要去实现它。

也就是说：

​		通过AQS可以实现独占锁（只有一个线程可以获取到锁，如：ReentrantLock），也可以实现共享锁（多个线程都可以获取到锁Semaphore/CountDownLatch等）

### ReentrantLock底层原理

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/290dd92ba7e3e91ef40851699b9ffc6a.png)

在ReentrantLock类中包含了3个AQS的实现类：

1. 抽象类Sync
2. 非公平锁实现类NonfaireSync
3. 公平锁实现类FairSync

#### 公平和非公平

公平锁指的是按照线程请求的顺序，来分配锁；而非公平锁指的是不完全按照请求的顺序，在一定情况下，可以允许插队。但需要注意这里的非公平并不是指完全的随机，不是说线程可以任意插队，而是仅仅“在合适的时机”插队。

那么什么时候是合适的时机呢？假设当前线程在请求获取锁的时候，恰巧前一个持有锁的线程释放了这把锁，那么当前申请锁的线程就可以不顾已经等待的线程而选择立刻插队。但是如果当前线程请求的时候，前一个线程并没有在那一时刻释放锁，那么当前线程还是一样会进入等待队列。

### 面试题

AQS的底层原理：AQS使用一个volatile成员变量state来表示锁是否已被持有，通过内置的FIFO队列存储被阻塞的线程。AQS使用CAS机制对state进行原子操作从而对state的值进行修改。如果state的值为0，表示锁未被持有，则将当前线程设置为工作线程（即获取到了锁），并将state的值设置为1，返回成功获取到锁。如果未能成功获取到锁，AQS先自旋获取锁，如果一直获取不到，则将当前获取不到锁的线程加入到FIFO队列中

# JUC 扩展

## 并发三大特性

原子性：锁(synchronized、Lock)

可见性：volatile

有序性：volatile

## 有序性&指令重排

有序性：它指的是程序执行的顺序按照代码的先后顺序执行。

正常情况下，这是没什么可说的，但是如果在Java中，并且是并发情况，就不得不说了。计算机在执行程序时，为了提高性能，编译器和处理器常常会对**指令重排**。处理器。在进行重排序时，必须要考虑指令之间的**数据依赖性**。

## Happen-Before

在常规的开发中，如果我们通过上述规则来分析一个并发程序是否安全，估计脑壳会很疼。因为更多时候，我们是分析一个并发程序是否安全，其实都依赖Happen-Before原则进行分析。Happen-Before被翻译成**先行发生原则**，意思就是**当A操作先行发生于B操作，则在发生B操作的时候，操作A产生的影响能被B观察到**，“影响”包括修改了内存中的共享变量的值、发送了消息、调用了方法等。

Happen-Before的规则有以下几条：

1. 程序次序规则（Program Order Rule）：在**一个线程内**一段代码的**执行结果是有序的。**就算还会指令重排，但是随便它怎么排，结果是按照我们代码的顺序生成的不会变！
2. 管程锁定规则（Monitor Lock Rule）：就是无论是在单线程环境还是多线程环境，对于**同一个锁**来说，一个线程对这个锁解锁之后，另一个线程获取了这个锁都能看到前一个线程的操作结果！(管程是一种通用的同步原语，synchronized就是管程的实现）
3. volatile变量规则（volatile Variable Rule）：**对同一个volatile的变量，先行发生的写操作，肯定早于后续发生的读操作**
4. 线程启动规则（Thread Start Rule）：Thread对象的start()方法先行发生于此线程的每一个动作
5. 线程终止规则（Thread Termination Rule）：线程中的所有操作都先行发生于对此线程的终止检测，我们可以通过Thread.join()方法结束、Thread.isAlive()的返回值等手段检测到线程已经终止执行。
6. 线程中断规则（Thread Interruption Rule）：对线程的interruption()调用，先于被调用的线程检测中断事件(Thread.interrupted())的发生
7. 对象终结规则（Finalizer Rule）：一个对象的初始化完成（构造函数执行结束）先行发生于它的finalize()方法的开始。
8. 传递性（Transitivity）：如果操作A先于操作B、操作B先于操作C,则操作A先于操作C

以上这些规则保障了happen-before的顺序，如果不符合以上规则，那么在多线程环境下就不能**保证执行顺序等同于代码顺序**。通过这些条件的判定，仍然很难判断一个线程是否能安全执行，线程安全多数依赖于工具类的安全性来保证。想提高自己对线程是否安全的判断能力，必然需要理解所使用的框架或者工具的实现，并积累线程安全的经验。

## AQS的工作模式

### 独占模式

**原理介绍**

工作流程：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/33b3dcce4ac90eae34c8d5796a76f443.png)


线程获取锁的流程：

1、线程A获取锁，将state的值由0设置为1

2、在A没有释放锁之前，线程B也来获取锁，线程B获取到state的值为1，表示锁被占用。线程B创建Node节点放入队尾，并且阻塞线程B

3、同理线程C获取到的state的值为1，表示锁被占用。线程C创建Node节点放入队尾，并且阻塞线程C

线程释放锁的流程：

1、线程A执行完毕以后，将state的值由1设置为0

2、唤醒下一个Node B节点，然后删除线程A节点

### 共享模式
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/b196073b1a21955e132515acf42db2ae.png)


获取锁的流程：

1、线程A判断state的值是否大于0，如果否创建Node节点，将其加入到阻塞队列末尾。

2、如果大于0相当于获取到了锁，使用CAS算法对state进行-1

释放锁的流程

1、执行业务操作，业务操作完毕以后对state的值进行+1操作

2、唤醒下一个Node B节点，然后删除线程A节点


## synchronized原理

> Java对象结构

Java中的对象是由三部分组成，分别是**对象头、对象体和对齐填充**；

1、对象体是存储一个对象属性值和父类的属性值的地方，并且jvm虚拟机中要求一个对象大小必须是8字节的整数倍，通过对齐填充达到这个要求；

2、对象头来描述一个Java对象是何种对象，且是属于那个类的对象

* 对象头中的Klass Word存储的是Class对象的地址，表明该对象是属于那个类
* 标记字段Mark Word则存储了该对象运行时数据，如哈希码（hashcode)、GC分代年龄、**锁状态标志和锁类型等信息**。

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/e2e65a6045c9369633166c2cb8dd1573.png)


> synchronized上锁原理

**synchronized同步代码块的情况**  

```java
public class SynchronizedDemo {

    public void method() {
        synchronized (this) {  
            System.out.println("synchronized 代码块");
        }
    }
    
}
```

通过javap查看字节码文件信息，如下所示：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/4d5d7deb04055f4416ab1d852eeee939.png)

从上面我们可以看出：synchronized 同步语句块的实现使用的是 monitorenter 和 monitorexit 指令，其中monitorenter 指令指向同步代码块的开始位置，

monitorexit 指令则指明同步代码块的结束位置。当执行 monitorenter 指令时，线程试图获取锁也就是获取 monitor(monitor对象存在于每个Java对象的对象头中，synchronized 锁便是通过这种方式获取锁的，也是为什么Java中任意对象可以作为锁的原因) 的持有权。当计数器为0则可以成功获取，获取后将锁计数器设为1也

就是加1。相应的在执行monitorexit 指令后，将锁计数器设为0，表明锁被释放。如果获取对象锁失败，那当前线程就要阻塞等待，直到锁被另外一个线程释放为止。

Mark Word结构如下所示：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/6cf47960cc5c58c51f5ddd4b97f386de.png)

并发锁总共有4种状态：无锁状态、偏向锁状态、轻量级锁状态和重量级锁状态，每种状态在并发竞争情况下需要消耗的资源由低到高，性能由高到低。（锁信息占3位）在jdk1.6之前只有重量级锁，而JDK1.6之后对synchronized进行了优化，引入了偏向锁与轻量级锁，提高了性能降低了资源消耗。



锁状态确定：

1、无锁：是否偏向锁的字段值=0，锁标志位的值=01

2、偏向锁：是否偏向锁的字段值=1，锁标志位的值=01

3、轻量级锁：锁标志位的值=00

4、重量级锁：锁标志位的值=10


> 锁升级

所谓的上锁，就是把锁的信息记录在对象头中，默认是无锁的，当达到一定的条件时会进行锁升级，会按照下面的顺序依次升级。

1、无锁：没有对资源进行锁定，所有的线程都能访问并修改同一个资源，但同时只有一个线程能修改成功。

2、偏向锁：研究发现大多数情况下，锁不仅不存在多线程竞争，而且总是由同一线程多次获得，为了不让这个线程每次获得锁都需要CAS操作的性能消耗，就引入

了偏向锁【偏向锁会偏向于第一个获得它的线程】。当一个线程访问对象并获取锁时，会在对象头里存储锁偏向的这个线程的ID，以后该线程再访问该对象时只需判断对象头的Mark Word里是否有这个线程的ID，如果有就不需要进行CAS操作，这就是偏向锁。

3、轻量级锁：当线程竞争更激烈时，偏向锁就会升级为轻量级锁，轻量级锁认为虽然竞争是存在的，但是理想情况下竞争的程度很低，通过自旋方式等待一会儿上一个线程就会释放锁。

4、重量级锁：但是当自旋超过了一定次数，或者一个线程持有锁，一个线程在自旋，又来了第三个线程访问时（反正就是竞争继续加大了），轻量级锁就会膨胀为重量级锁，重量级锁就是Synchronized,重量级锁会使除了此时拥有锁的线程以外的线程都阻塞。

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/634979a855ebe5dabf3c714f4da9e31d.png)
