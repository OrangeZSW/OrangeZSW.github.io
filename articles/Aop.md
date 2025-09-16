---
title: Aop
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


## Aop

1. 切面：用于实现通知方法的类
2. 横切关注点：在核心业务中分离出来的非核心业务，通知方法的方法体
3. 连接点：用来运行通知方法的位置
4. 切入点：用切入表达式计算出连接点。
5. 通知:每一个横切关注点需要包装成一个方法，这个方法就叫做通知

### 基于注解

#### 开启自动代理

` <aop:aspectj-autoproxy />`

@Aspect：切面标记

1. 通知：

   1. @Before	:前置

      参数：JoinPoint joinPoint

   2. @AfterReturning(returning="result")  ：返回

      参数：Object result

   3. @AfterThrowing(throwing="e") :  异常

      参数：Exception|Throwable e

   4. @After

   5. @Around()

      参数：ProceedingJoinPoint joinPoint

2. 切入点：

   @Pointcut("execution=(public int zornage.online.Entity.User.toString(int i))")  =  ("* zorange.online..*(..)")

3. 优先级

   @round("1")  越小优先级越高，默认为Integer最大值

   ```java
   package online.zorange.annotation;
   
   import org.aspectj.lang.JoinPoint;
   import org.aspectj.lang.ProceedingJoinPoint;
   import org.aspectj.lang.annotation.*;
   import org.springframework.stereotype.Component;
   
   import java.util.Arrays;
   
   @Component
   @Aspect
   public class OneAspect {
       // 切点
       @Pointcut("execution(public  int online.zorange.annotation.CalculatorImpl.*(..))")
       public void pointCut(){
   
       }
       // 前置通知
       @Before("pointCut()")
       public void before(JoinPoint joinPoint){
           // 获取方法名称
           String name = joinPoint.getSignature().getName();
           // 获取参数
           Object[] args = joinPoint.getArgs();
           System.out.println("前置通知"+name+"方法执行了"+args[0]+","+args[1]);
       }
   
       // 后置通知
       @After("pointCut()")
       public void after(JoinPoint joinPoint){
           String name = joinPoint.getSignature().getName();
           System.out.println("后置通知"+name+"方法执行了");
       }
   
       /**
        * 设置返回值参数 returning = "result"
        * @param joinPoint // 连接点
        * @param result // 返回值
        */
       @AfterReturning(value = "pointCut()",returning = "result")
       public  void  afterReturning(JoinPoint joinPoint ,Object result){
           joinPoint.getSignature().getName();
           System.out.println("返回通知 ,结果："+result);
       }
   
       /**
        * 异常通知
        * 设置异常参数 throwing = "e"
        * @param joinPoint
        * @param e
        */
       @AfterThrowing(pointcut = "pointCut()",throwing = "e")
       public  void  afterThrowing(JoinPoint joinPoint,Throwable e){
           String name = joinPoint.getSignature().getName();
           System.out.println("异常通知"+name+"方法抛出异常了"+e);
       }
   
       /**
        * 环绕通知
        * 必须有返回值
        * 有一个专门的参数 ProceedingJoinPoint
        * @param joinPoint
        */
       @Around("pointCut()")
       public Object around(ProceedingJoinPoint joinPoint){
           // 获取方法名称
           String name = joinPoint.getSignature().getName();
           // 获取参数
           Object[] args = joinPoint.getArgs();
           Object result = null;
           try {
               // 前置通知
               System.out.println("环绕通知"+name+"方法执行了"+"参数："+ Arrays.toString(args));
               // 执行目标方法
               result = joinPoint.proceed();
               // 返回通知
               System.out.println("环绕通知"+name+"方法执行了"+"结果："+result);
   
           }catch (Throwable e){
               // 异常通知
               System.out.println("环绕通知"+name+"方法执行了"+"异常："+e);
           }finally {
               // 后置通知
               System.out.println("环绕通知"+name+"方法执行了"+"最终执行");
           }
   
           return result;
       }
   
   }
   
   ```

   

### 基于配置文件

```xml
<!-- 配置目标类的bean -->
<bean id="calculatorPure" class="com.atguigu.aop.imp.CalculatorPureImpl"/>
    
<!-- 配置切面类的bean -->
<bean id="logAspect" class="com.atguigu.aop.aspect.LogAspect"/>
    
<!-- 配置AOP -->
<aop:config>
    
    <!-- 配置切入点表达式 -->
    <aop:pointcut id="logPointCut" expression="execution(* *..*.*(..))"/>
    
    <!-- aop:aspect标签：配置切面 -->
    <!-- ref属性：关联切面类的bean -->
    <aop:aspect ref="logAspect">
        <!-- aop:before标签：配置前置通知 -->
        <!-- method属性：指定前置通知的方法名 -->
        <!-- pointcut-ref属性：引用切入点表达式 -->
        <aop:before method="printLogBeforeCore" pointcut-ref="logPointCut"/>
    
        <!-- aop:after-returning标签：配置返回通知 -->
        <!-- returning属性：指定通知方法中用来接收目标方法返回值的参数名 -->
        <aop:after-returning
                method="printLogAfterCoreSuccess"
                pointcut-ref="logPointCut"
                returning="targetMethodReturnValue"/>
    
        <!-- aop:after-throwing标签：配置异常通知 -->
        <!-- throwing属性：指定通知方法中用来接收目标方法抛出异常的异常对象的参数名 -->
        <aop:after-throwing
                method="printLogAfterCoreException"
                pointcut-ref="logPointCut"
                throwing="targetMethodException"/>
    
        <!-- aop:after标签：配置后置通知 -->
        <aop:after method="printLogCoreFinallyEnd" pointcut-ref="logPointCut"/>
    
        <!-- aop:around标签：配置环绕通知 -->
        <!--<aop:around method="……" pointcut-ref="logPointCut"/>-->
    </aop:aspect>
    
</aop:config>

```

## 声明时事务

> **编程式事务**：需要手动去实现事务的功能呢

> **声明式事务**：只需要声明事务，具体的功能由框架完成。

事务特性：

1. **原子性**：事务被视为一个不可分割的单位，事务中的操作要么都执行，要么都不执行

2. **一致性**：事务将数据库从一个一致性转换到另外一个一致性状态

3. **隔离性**：多个并发执行的事务不会干扰，

   1. **隔离级别**：
      1. **读未提交 (Read Uncommitted)**：提供了最低的隔离级别，可能导致脏读、不可重复读和幻读。
      2. **读已提交 (Read Committed)**：防止脏读，但仍然可能遇到不可重复读和幻读。
      3. **可重复读 (Repeatable Read)**：防止脏读和不可重复读，但仍然可能发生幻读。==对正在操作的数据加锁。==
      4. **序列化 (Serializable)**：防止所有并发问题，但可能会引起较高的锁定开销。==对表加锁==
   2. 脏读：读到了未提交的数据
   3. 不可重复读：只能读到已经提交的数据，读两次的数据可能不一样
   4. 幻读：对没有加锁的数据进行操作，当其他事务操作了之后，可能两次读到数据不一样。

4. **持久性**：

   一旦事务被提交，它对数据库所做的更改就是永久性的，并且不能因为任何系统故障而丢失。

   即使是在系统崩溃之后，一旦事务提交，它的结果也必须是可用的。

### 基于注解的声明式事务

1. **配置事务管理器**

   配置连接对象，依赖数据源: 因为事的开启是Connection对象开启的，所以事务管理就依赖数据源管理对象。

   ```xml
   <bean id="transactionManager" class="DataSourceTransactionManager" >
    //数据源   
   <property name="DataSource" ref="dataSource"></property>
       
   </bean>
   ```

   

2. **开启事务注解驱动**(连接点)

   @Transactional   标记连接点的注解。一般是加在Service层

   ```xml 
   <tx:annotation-driven transaction-manager="transactionManager"/>
   ```

​	==标记位置==：类或方法。



### 声明式事务属性

1. **事务只读**：readOnly="false"

   功能：对于==全部都是查询的操作==，可以设置事务只读，此时会通知数据库当前操作为只读操作，会从==数据库层面==优化当前操作。提高效率. 若操作中存在增删改操作时，会报错 Connection is read only

   > 数据库默认的隔离级别为可重复读，会对表加锁。

2. **超时时间**：超时回滚，释放资源

   timeout="-1"   

   -1:一直等 ，默认单位秒。

   场景：事务超过指定时间未执行完毕。强制回滚，并抛出异常TransactionTimeOutException

3. **回滚策略**：

   rollBackFor = 字节码对象

   rollBackForClassName  = 全类名

   noRollBackFor

   noRollBackForClassName

   默认所有运行时异常回滚。

   设置触发或不触发回滚的异常类型：

4. **隔离级别**:

   isoLation="DEFAULT"

   1. DEFAULT:默认隔离级别，数据库决定
   2. READ_UNCOMMITTED  不可重复读
   3. READ_COMMITTED 
   4. Repeatable Read  可重复读
   5. SERVILAZIABLE 序列化

5. **传播行为**：

   propagation ="REQUIRED "

   1. REQUIRED   调用者的事务

   2. REQUIRES\_NEW   被调用者的事务

      | 名称                 | 含义                                                         |
      | -------------------- | ------------------------------------------------------------ |
      | REQUIRED &#xA;默认值 | 当前方法必须工作在事务中 &#xA;如果当前线程上有已经开启的事务可用，那么就在这个事务中运行 &#xA;如果当前线程上没有已经开启的事务，那么就自己开启新事务，在新事务中运行 &#xA;所以当前方法有可能和其他方法共用事务 &#xA;在共用事务的情况下：当前方法会因为其他方法回滚而受连累 |
      | REQUIRES\_NEW        | 当前方法必须工作在事务中 &#xA;不管当前线程上是否有已经开启的事务，都要开启新事务 &#xA;在新事务中运行 &#xA;不会和其他方法共用事务，避免被其他方法连累 |

   被传播的事务，默认使用的是事务是其调用者的事务。

   A->B,A和B都有事务，默认B使用的A的事务。==针对B事务设置==，且必须为不同类中的方法。

### 基于XMl的声明式事务

1. **配置事务管理器**

   ```xml
   <bean id="transactionManager" class="DataSourceTransactionManager" >
    //数据源   
   <property name="DataSource" ref="dataSource"></property>
       
   </bean>
   ```

2. **设置事务通知** (连接点)

   ```xml
   <tx:advice id="tx" tranaction-manager="transactionManager">
       //事务属性,必须指定。
       <tx:attributes>
           <tx:method name="menthod()" read-only="false"></tx:method>
           <tx:method name="add*" read-only="false"></tx:method>
       </tx:attributes>
   </tx:advice>
   
   
   <!--
   <aop:advisor> 标签：用于将一个已经定义好的Advice和一个Pointcut绑定在一起。
   Advisor是一个简单的切面实现，它只需要一个Advice和一个Pointcut就可以工作。
   在配置文件中，你可以通过advice-ref属性引用一个已经定义好的Advice，通过pointcut-expression或pointcut-ref属性来指定Pointcut。
   -->
   <aop:config>
       //
   	<aop:advisor advice-ref="tx" 
                    pointcut="excution(* online.zorange.service..*(..) )">				</aop:advisor>
   </aop:config>
   ```