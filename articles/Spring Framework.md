## Spring Framework简介

### 1. Spring 和 SpringFramework

<https://spring.io/projects>

**广义的 Spring：Spring 技术栈**（全家桶）

广义上的 Spring 泛指以 Spring Framework 为核心的 Spring 技术栈。

经过十多年的发展，Spring 已经不再是一个单纯的应用框架，而是逐渐发展成为一个由多个不同子项目（模块）组成的成熟技术，例如 Spring Framework、Spring MVC、SpringBoot、Spring Cloud、Spring Data、Spring Security 等，其中 Spring Framework 是其他子项目的基础。

这些子项目涵盖了从企业级应用开发到云计算等各方面的内容，能够帮助开发人员解决软件发展过程中不断产生的各种实际问题，给开发人员带来了更好的开发体验。

**狭义的 Spring：Spring Framework**

狭义的 Spring 特指 Spring Framework，通常我们将它称为 Spring 框架。

Spring 框架是一个分层的、面向切面的 Java 应用程序的一站式轻量级解决方案，它是 Spring 技术栈的核心和基础，是为了解决企业级应用开发的复杂性而创建的。

Spring 有两个最核心模块： IoC 和 AOP。

**IoC**：Inverse of Control 的简写，译为“控制反转”，指把创建对象过程交给 Spring 进行管理。

**AOP**：Aspect Oriented Programming 的简写，译为“面向切面编程”。AOP 用来封装多个类的公共行为，将那些与业务无关，却为业务模块所共同调用的逻辑封装起来，减少系统的重复代码，降低模块间的耦合度。另外，AOP 还解决一些系统层面上的问题，比如日志、事务、权限等。

**理解：**

Spring类似于腾讯公司

SpringFramework类似于腾讯的发家产品QQ

为了称呼方便，我们后面会将SpringFramework简称为Spring!!!

### 2. SpringFramework主要功能模块

| 功能模块                | 功能介绍                                                    |
| ----------------------- | ----------------------------------------------------------- |
| Core Container          | 核心容器，在 Spring 环境下使用任何功能都必须基于 IOC 容器。 |
| AOP\&Aspects            | 面向切面编程                                                |
| Testing                 | 提供了对 junit 或 TestNG 测试框架的整合。                   |
| Data Access/Integration | 提供了对数据访问/集成的功能。                               |
| Spring MVC              | 提供了面向Web应用程序的集成功能。                           |

-   **1.4 组件交给Spring管理优势**!

    1.  降低了组件之间的耦合性：Spring IoC容器通过依赖注入机制，将组件之间的依赖关系削弱，减少了程序组件之间的耦合性，使得组件更加松散地耦合。
    2.  提高了代码的可重用性和可维护性：将组件的实例化过程、依赖关系的管理等功能交给Spring IoC容器处理，使得组件代码更加模块化、可重用、更易于维护。
    3.  方便了配置和管理：Spring IoC容器通过XML文件或者注解，轻松的对组件进行配置和管理，使得组件的切换、替换等操作更加的方便和快捷。
    4.  支持灵活的配置和扩展：Spring IoC容器支持动态配置和灵活扩展，可以根据实际需要添加自定义的Bean，并且支持各种不同的配置方式，使得开发人员能够更加灵活地定制配置。
    5.  交给Spring管理的对象（组件），方可享受Spring框架的其他功能（AOP,声明事务管理）等


**ApplicationContext容器实现类**：

| 类型名                          | 简介                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| ClassPathXmlApplicationContext  | 通过读取类路径下的 XML 格式的配置文件创建 IOC 容器对象       |
| FileSystemXmlApplicationContext | 通过文件系统路径读取 XML 格式的配置文件创建 IOC 容器对象     |
| ConfigurableApplicationContext  | ApplicationContext 的子接口，包含一些扩展方法 refresh() 和 close() ，让 ApplicationContext 具有启动、关闭和刷新上下文的能力。 |
| WebApplicationContext           | 专门为 Web 应用准备，基于 Web 环境创建 IOC 容器对象，并将对象引入存入 ServletContext 域中。 |

###  SpringIoC容器管理配置方式

 Spring IoC 容器使用一种形式的配置元数据。此配置元数据表示您作为应用程序开发人员如何告诉 Spring 容器实例化、配置和组装应用程序中的对象。

 Spring框架提供了多种配置方式：XML配置方式、注解方式和Java配置类方式


1.  XML配置方式：是Spring框架最早的配置方式之一，通过在XML文件中定义Bean及其依赖关系、Bean的作用域等信息，让Spring IoC容器来管理Bean之间的依赖关系。该方式从Spring框架的第一版开始提供支持。
2.  注解方式：从Spring 2.5版本开始提供支持，可以通过在Bean类上使用注解来代替XML配置文件中的配置信息。通过在Bean类上加上相应的注解（如@Component, @Service, @Autowired等），将Bean注册到Spring IoC容器中，这样Spring IoC容器就可以管理这些Bean之间的依赖关系。
3.  Java配置类方式：从Spring 3.0版本开始提供支持，通过Java类来定义Bean、Bean之间的依赖关系和配置信息，从而代替XML配置文件的方式。Java配置类是一种使用Java编写配置信息的方式，通过@Configuration、@Bean等注解来实现Bean和依赖关系的配置。
     配置方式的使用场景不同，SSM期间，我们使用XML+注解方式为主。SpringBoot期间，我们使用配置类+注解方式为主！


 ### 3. Spring IoC / DI概念总结

- **IoC（Inversion of Control）概念**

  IoC 主要是针对对象的创建和调用控制而言的，也就是说，当应用程序需要使用一个对象时，不再是应用程序直接创建该对象，而是由 IoC 容器来创建和管理，即控制权由应用程序转移到 IoC 容器中，也就是“反转”了控制权。这种方式基本上是通过依赖查找的方式来实现的，即 IoC 容器维护着构成应用程序的对象，并负责创建这些对象。

- **DI (Dependency Injection)概念**

  DI 是指在组件之间传递依赖关系的过程中，将依赖关系在容器内部进行处理，这样就不必在应用程序代码中硬编码对象之间的依赖关系，实现了对象之间的解耦合。在 Spring 中，DI 是通过 XML 配置文件或注解的方式实现的。它提供了三种形式的依赖注入：构造函数注入、Setter 方法注入和接口注入。

> SPI机制

![Clip_2024-10-08_08-29-27.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/cf640b6856eb43bd89a48d28de7b64b0.png)

``

## XMl配置

接口注入：需要注入的依赖对象为一个接口，ioc自动为依赖注入实现类。



反射获取对象：

1. 根据构造方法的newInstance()

2. 根据字节码对象的newInstance()



### FactoryBean

> 生产一种bean，可以对bean进行处理。
>
> `BeanFactory`是spring IOC的根接口

FactoryBean与普通工厂的区别：

1. FactorBean工厂：ioc可直接获得工厂提供的bean
2. 普通工厂：ioc需要先获取工厂对象，才能获取工厂提供的bean



### bean的作用域

scope：singLeton|prototype|session|request

单例：每次都是同一个实例

多例：每次都是不同的



### bean的生命周期

1. 创建对象（默认使用无参构造）
2. 依赖注入
3. 初始化（使用init-method="",指定初始化方法)
4. 使用
5. 销毁（使用destory-method="",指定销毁方法)   ioc容器关闭时执行bean的销毁    ioc.close() 



### bean的作用域对生命周期的影响

单例：在初始化ioc时就已经初始化了

多例：只有在获取bean对象时才初始化，且销毁不被ioc管理。



### bean的后置处理器

1. 本质：实现了`BeanPostProcessor`的类

2. 在bean`初始化`前后加上两个额外的步骤
3. 必须配置到ioc容器中，bean的后置处理器会作用于所有组件



## 注解配置

@Component   @Server @Controller @Resource

在xml中配置扫描的主包：<context:component-scan base-package="online.zorange.a_scan"/>

获取所有加上注解的组件

配置项扫描，与xml一样<context:property-placeholder location="application.properties"/>

属性注解：Value("${jdbc.password}")



## java配置类

1. 在配置类上加@Configuration,标注配置类

   扫描包配置注解；@ComponentScan(basePackages = {"online.zorange.define_components"})

   扫描配置项注解：@PropertySource("classpath:jdbc.properties")

2. 在ioc获取时采用AnnotationConfigApplicationContext(配置类.class);



3. 注解配置和java配置类的beanName的区别

   | 注解配置         | Java配置类 |
   | ---------------- | ---------- |
   | 类名的首字母小写 | 方法名     |