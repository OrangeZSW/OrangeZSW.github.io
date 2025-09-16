---
title: Spring Clould
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# 系统架构演进

## 单体架构

**单体架构具有以下优点：**

1、简单：单体架构模式相对于其他复杂的架构来说，其结构简单易用，便于新手学习和应用。

2、易于维护：由于整个应用程序都在一个代码库中，因此很容易对其进行维护和更新。

3、易于部署：单个可执行文件可以在任何支持运行该语言的环境中运行，并且部署也相对轻松。

**然而，单体架构也存在一些缺点：**

1、扩展性差：单体应用程序所有功能都在一个程序中实现，因此扩展功能时需要新增或修改源代码，并重新部署整个应用程序，这可能会导致系统不稳定和长时间停机。

2、可靠性低：由于单体应用程序集成了所有的逻辑和组件，因此如果其中有一个非常重要的组件出现故障，则可能导致从整个系统崩溃。

3、风险高：单体应用程序中的错误往往比较难以调试，因为代码复杂度高且耦合度强。 综上所述，单体架构适用于小型、简单的软件系统，但是对于大型、复杂的系统来说，单体架构面临诸多挑战，需要采用其他更加灵活和可扩展的架构模式。

## 分布式架构

**分布式系统架构**是指将一个软件系统分割成多个独立的服务，并且这些服务可以在不同的计算机或服务器上运行，并通过网络进行通信。

**微服务系统架构**：本质上也属于分布式系统架构，在微服务系统架构中，更加重视的是服务拆分粒度。

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/534159a0f89449029e583af24ccbe402.png)

### 微服务架构的特点：

1、单一职责：微服务拆分粒度更小，每一个服务都对应唯一的业务能力，做到单一职责

2、自治：团队独立、技术独立、数据独立，独立部署和交付

3、面向服务：服务提供统一标准的接口，与语言和技术无关



####  微服务：

  1.每个微服务负载一项业务、独立端口号、进程id(pid):服务的专业化、精细化管理

  2.每个微服务语言独立、技术独立、数据独立



**微服务系统架构的优点：**

1、可扩展性好：由于系统中的不同组件可以独立地进行扩展和升级，从而提高了整个系统的扩展性和可靠性。

2、容错性高：由于系统中的组件可以在不同的计算机或服务器上运行，因此即使某些节点出现故障也不会影响整个系统的运行。

3、高效性强：分布式系统可以将负载和任务分配到不同的节点上，从而提高系统的并发能力和处理速度。

4、灵活性强：分布式系统可以支持多种编程语言和应用程序框架，并且可以利用各种云计算技术，如Docker、Kubernetes等。



**微服务系统架构的存在的问题：**

1、微服务的管理：这些微服务如果没有进行统一的管理，那么维护性就会极差。

2、服务间的通讯：微服务之间肯定是需要进行通讯，比如购物车微服务需要访问商品微服务。

3、前端访问问题：由于每一个微服务都是部署在独立的一台服务器的，每一个微服务都存在一个对应的端口号，前端在访问指定微服务的时候肯定需要指定微服务的ip地址和端口号，难道需要在前端维护每一个微服务的ip地址和端口号?

4、配置文件管理：当构建服务集群的时候，如果每一个微服务的配置文件还是和微服务进行绑定，那么维护性就极差。

5、微服务的故障排查、调用链路：微服务追踪技术

## 分布式和集群

分布式：由多台服务器构成的网络环境，在分布式环境下每一台服务器的功能是不一样的。

集群：   由多台服务器构成的网络环境，在集群环境下每一台服务器的功能是一样的。

分布式环境中每一台服务器都可以做集群，如下图所示：

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/f6fb573ca2a8430e938436ff026345c7.png)

实际开发中：分布式+集群

​                        微服务+集群



针对上述微服务架构治理的问题，有一套微服务治理规范！针对微服务治理规范，有好多种实现。最著名的两种实现：

SpringCloud Netflix(SCN): OpenFeign、LoadBalancer、Gateway

SpringCloudAlibaba(SCA): Nacos、sentinel



微服务技术栈：微服务相关技术的统称

​    微服务开发技术：SpringBoot

​    微服务治理、保护技术: SCN+SCA: SpringCloud底层-->-SpringBoot3.x--->Spring6.x（SpringMVC）--->JDK17

​    微服务部署技术:Docker+K8s

# Spring Cloud Alibaba 概述

## Spring Cloud 简介

1、Spring Cloud 是一系列**框架**的有序**集合**。在Spring Cloud这个项目中包含了很多的组件【子框架】，每一个组件都是用来解决问题系统架构中所遇到的问题，因此Spring Cloud可以看做是一套微服务的解决方案。

2、Spring Cloud中常见的组件：Eureka(服务注册中心)、Openfeign(服务远程调用)、Gateway(服务网关)、Spring Cloud Config(统一配置中心)等。

3、Spring Cloud项目官方网址：https://spring.io/projects/spring-cloud

4、Spring Cloud依赖于Spring Boot，并且有版本的兼容关系

## Spring Cloud Alibaba简介

Spring Cloud Alibaba是阿里针对微服务系统架构所存在的问题给出了一套解决方案，该项目包含了微服务系统架构必须的一些组件。

常见的组件可以参看官网地址：https://spring-cloud-alibaba-group.github.io/github-pages/2021/en-us/index.html

注意：

1、Spring Cloud Alibaba中所提供的组件是遵循Spring Cloud规范的，两套技术所提供的组件是可以搭配使用的。

2、在现在企业开发中往往是两套技术组件搭配进行使用：Nacos(服务注册中心和配置中心)、Openfeign(远程调用)、LoadBalancer(客户端负载均衡器)、Gateway(服务网关)、Sentinel(服务保护组件)等。

# 微服务环境准备

## 过程说明

在创建微服务工程的时候都需要先提供一个父工程，使用父工程来管理多个微服务所需要的依赖。我们的微服务系统结构如下所示：

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/f6641d07bcd14683b3aeaefc40422279.png)

## 服务的远程调用

需求：在查询订单时候需要将订单所属用户的信息也一并查询出来。

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/6ef20cee90334495941ae5931f3b2c76.png)

### 传统调用

要完成上述的需求，我们就需要在order微服务中向user微服务发起一个http的请求，调用

http://localhost:10100/api/user/findUserByUserId/{userId}这个接口。

### RestTemplate

在order微服务的Spring容器中注册一个**RestTemplate**

```java
// com.atguigu.spzx.cloud.order.config;
@Configuration
public class RestTemplateConfiguration {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate() ;
    }

}
```

具体使用：

```java
@Service
public class OrderServiceImpl implements OrderService {

    @Autowired          // 注入RestTemplate远程调用工具
    private RestTemplate restTemplate ;

    @Autowired
    private OrderMapper orderMapper ;

    @Override
    public Order findOrderByOrderId(Long orderId) {

        // 根据id查询订单数据
        Order order = orderMapper.findOrderByOrderId(orderId);

        // 发起远程调用
        User user = restTemplate.getForObject("http://localhost:10100/api/user/findUserByUserId/" + order.getUserId(), User.class);
        order.setUser(user);

        // 返回订单数据
        return order;
    }
}
```



### 问题说明

1、维护性差：服务提供方的ip地址发生了改变，那么此时服务的消费方就需要更改代码

2、缺少负载均衡机制：负载均衡就是负载【请求】通过多台服务器进行处理

# Nacos注册中心

## 注册中心简介

通过注册中心可以对服务提供方和服务消费方进行解耦。具体的工作模式如下图所示：

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/27ff36fe1ab94d5c800c7ecc0ebabe13.png)

工作流程说明：

1、服务提供方在启动的时候，会向注册中心注册自己服务的详情信息(ip、端口号等)。在注册中心中会维护一张服务清单，保存这些注册信息，注册中心需要以心跳的方式去监测清单中的服务是否可用，如果不可用，需要在服务清单中剔除不可用的服务。

2、服务消费方向服务注册中心咨询服务，并获取所有服务的实例清单，然后按照指定的负载均衡算法从服务清单中选择一个服务实例进行访问。

## Nacos

Nacos架构图如下所示：

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/6c0a39c5bc464d3bbf8744e8e0e70035.png)

1. Nacos Server：服务注册中心，它是服务，其实例及元数据的数据库。服务实例在启动时注册到服务注册表，并在关闭时注销。服务注册中心可能会调用服务实例的健康检查 API 来验证它是否能够处理请求。Nacos Server需要独立的部署。

2. Nacos Client: Nacos Client负责和Nacos Server进行通讯完成服务的注册和服务的发现。

3. Nacos Console：是Nacos的控制模块，Nacos提供了可视化的后台管理系统，可以很容易的实现服务管理操作。

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/8c0d2c0ab6884cd3a4ced31c0151ae46.png)

Nacos的优点包括：

1、高可用性：Nacos支持多节点部署，通过选举算法实现了高可用和故障转移能力，在节点宕机或网络异常情况下仍能保证整个系统的稳定运行。

2、动态扩展性：Nacos可以根据实际需求进行快速扩展和缩容，支持集群、多数据中心、地域感知等特性。

3、完备的功能支持：Nacos支持服务注册与发现、配置管理、流量管理、DNS解析、存储KV对等功能，并且提供了Web界面和RESTful API等多种方式来使用这些功能。

4、易于集成：Nacos提供了多种语言和框架的集成方案，并且支持Spring Cloud等流行的微服务框架。

总的来说，Nacos是一个功能齐全、易于使用和高可用的分布式服务治理平台，可以为分布式系统提供高效、稳定的运行环境。

## 微服务集成naocs

需求：将两个微服务(user、order)注册到nacos中

实现步骤：

1、在两个子工程中引入如下依赖

```xml
<!-- nacos作为注册中心的依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

2、在application.yml文件中添加如下配置

```yaml
spring:
  # 配置nacos注册中心的地址
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  application:
    name: spzx-cloud-user   # 每一个服务注册到nacos注册中心都需要提供一个服务名称,order微服务注册的时候需要更改微服务名称
```

3、启动两个微服务：就可以在nacos的后台管理系统中，看到如下的注册信息：

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/0fb1ecafc81c4aa7b912a71cc33c0a55.png)

## 更改远程调用

当我们把微服务都注册到注册中心以后，那么此时就可以根据服务的名称从注册中心获取服务的ip地址和端口号了，进而就可以更改远程调用代码！

使用Spring Cloud中所提供的一个组件：**spring-cloud-loadbalancer**

使用步骤：

1、在order微服务中添加依赖

```xml
<!-- spring cloud 所提供的负载均衡器 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

2、在声明RestTemplate的方法上添加**@LoadBalanced**注解

```java
@Bean
@LoadBalanced       // 让RestTemplate具有负载均衡的能力：轮询
public RestTemplate restTemplate() {
    return new RestTemplate() ;
}
```

3、更改远程调用代码

```java
// 服务提供方的服务ip地址和端口号可以使用服务提供方的服务名称进行替换
restTemplate.getForObject("http://spzx-cloud-user/api/user/findUserByUserId/" + order.getUserId(), User.class);
```

注意：默认使用的负载均衡算法就是轮询【依次调用对应服务】

## 高级特性

### 服务集群

为了保证每一个服务的高可用，那么此时就需要去构建服务集群，但是并不是说把所有的服务都部署在一个机房里。而是将多个服务分散的部署到不同的机房中，每一个机房的服务可以看做成是一个集群

微服务互相访问时，应该尽可能访问同集群实例，因为本地访问速度更快。当本集群内不可用时，才访问其它集群。例如：上海机房内的order微服务应该优先访问同机房的user微服务。

#### 集群配置

添加所属集群名

```yml
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: SH		# 配置服务所属集群
```

#### 集群访问

在同一个集群的微服务，优先访问同一个集群的微服务，除非都不可用

配置微服务所属集群

```yml
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: SH		# 配置服务所属集群
```

开启集群访问：

```yml
spring:
  # 配置nacos注册中心的地址
  cloud:
    loadbalancer:
      nacos:    # 集成nacos的负载均衡算法
        enabled: true
```

### 权重配置

权重修改：

```yml
spring:
  cloud:
    nacos:
      discovery:
        weight: 1
```

**注意**：如果权重修改为0，则该实例永远不会被访问

## 环境隔离

在实际的开发过程中，可能会存在很多个软件环境：开发环境、测试环境、生产环境。

nacos也是支持多环境隔离配置的，在nacos是通过**namespace**来实现多环境的隔离。

完整的服务注册数据存储结构如下所示：

![image.png](http://120.26.79.238/minioapi/orange-blog/articleImages/1/8ede372313bc42b6b5851905ad770ec9.png)

> Group：组，通常来表示不同的项目，不同组之间也存在隔离性的

### 配置名称空间

1. 在nacos页面创建不同的名称空间
2. 复制名称空间id

给微服务添加名称空间的配置，来指定该微服务所属环境。

```yml
spring:
  # 配置nacos注册中心的地址
  cloud:
    nacos:
      discovery:
        namespace: 4a88035e-acf3-45a9-924f-2421acbff67a  # 配置服务实例所属名称空间
```

最佳实践：

   1.命名空间表示不同的环境：开发环境、测试环境、生产环境

   2.同一个项目分配同一个group

  3.同一个名称空间下的同一个group中的微服务可以进行远程通信。

## 实例类型

Nacos中的服务实例存在两种类型：

1、临时实例：如果实例宕机超过一定时间，会从服务列表剔除，并且实例会定时上报自身的健康状态给Nacos注册中心，默认的类型。

2、非临时实例(永久实例)：如果实例宕机，不会从服务列表剔除，Nacos注册中心会主动询问实例的健康状态，也可以叫永久实例。

配置一个服务实例为永久实例：

```yml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # 配置该实例为非临时实例
```

# LoadBalancer

Spring Cloud LoadBalancer是Spring Cloud中负责客户端负载均衡的模块，其主要原理是通过选择合适的服务实例来实现负载均衡。

客户端负载均衡：就是负载均衡算法由客户端提供

默认的负载均衡算法：RoundRobinLoadBalancer (轮询)

## 更改负载均衡算法

1、在Spring容器中注册一个Bean

```java
public class CustomLoadBalancerConfiguration {

    /**
     * @param environment: 用于获取环境属性配置，其中LoadBalancerClientFactory.PROPERTY_NAME表示该负载均衡器要应用的服务名称。
     * @param loadBalancerClientFactory: 是Spring Cloud中用于创建负载均衡器的工厂类，通过getLazyProvider方法获取ServiceInstanceListSupplier对象，以提供可用的服务列表。
     * ServiceInstanceListSupplier：用于提供ServiceInstance列表的接口，可以从DiscoveryClient或者其他注册中心中获取可用的服务实例列表。
     * @return
     */
    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment, LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class), name);
    }
}

```

2、配置负载均衡算法的使用者

```java
@Configuration
@LoadBalancerClients(value = {
        @LoadBalancerClient(name = "spzx-cloud-user" , configuration = CustomLoadBalancerConfiguration.class)// 将负载均衡算法应用到指定的服务提供方中
})
public class RestTemplateConfiguration {

    @Bean
    @LoadBalanced       // 让RestTemplate具有负载均衡的能力
    public RestTemplate restTemplate() {
        return new RestTemplate() ;
    }

}
```

# OpenFeign组件

概述：feign是一个声明式的http客户端，官方地址：https://github.com/OpenFeign/feign其作用就是帮助我们优雅的实现http请求的发送。替换Resttemplate



**使用OpenFeign远程调用的四步**：

1.导入OpenFeign依赖

2.在主启动类上加@EnableFeignclients,主要作用：用来扫描@FeignClient

3.自定义FeignClient接口

​      3.1.接口上标记@FeignClient(value="被调用方在注册中心的服务名")

​      3.2 方法要和被调用方controller层方法保持完全一致。请求方式、请求路径、请求参数[个数、顺序、类型]、返回值类型

  4.在远程调用的地方直接注入自定义FeignClient接口的代理类对象。



**拓展**：OpenFeign有几个注意点：

  1.OpenFeign在远程调用时，最好带着@RequestParam、@PathVariable的value属性值

  2.OpenFeign在远程调用的时候，传递是json数据。

 3.给微服务A发送的请求方式并不影响微服务A使用OpenFeign远程调用微服务B的请求方式



## OpenFeign入门

OpenFeign的使用步骤如下：

1、我们在spzx-cloud-order服务的pom文件中引入OpenFeign的依赖

```xml
<!-- 加入OpenFeign的依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

2、在启动类上添加**@EnableFeignClients**开启OpenFeign的功能支持

3、编写OpenFeign的客户端

```java
@FeignClient(value = "spzx-cloud-user")		// 声明当前接口是一个访问user-service的feign的客户端
public interface UserFeignClient {

    @GetMapping("/api/user/findUserByUserId/{userId}")
    public abstract User queryById(@PathVariable("userId") Long userId) ;	// 根据userId查询用户信息的接口方法

}
```

这个客户端主要是基于SpringMVC的注解来声明远程调用的信息，比如：

① 请求方式：GET

② 请求路径：/api/user/findUserByUserId/{userId}

③ 请求参数：Long userId

④ 返回值类型：User

这样，Feign就可以帮助我们发送http请求，无需自己使用RestTemplate来发送了。

4、修改OrderService中的远程调用代码，使用Feign客户端代替RestTemplate：

```java
@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper ;

    @Autowired
    private UserFeignClient userFeignClient ;

    @Override
    public Order findOrderByOrderId(Long orderId) {
        Order order = orderMapper.findOrderByOrderId(orderId);

		// 远程调用
        User user = userFeignClient.queryById(order.getUserId());
        order.setUser(user);
        return order ;
    }
}
```

## OpenFeign自定义配置

### 日志配置

OpenFeign可以支持很多的自定义配置，如下表所示：

| 类型                   | 作用             | 说明                                                   |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| **feign.Logger.Level** | 修改日志级别     | 包含四种不同的级别：NONE、BASIC、HEADERS、FULL         |
| feign.codec.Decoder    | 响应结果的解析器 | http远程调用的结果做解析，例如解析json字符串为java对象 |
| feign.codec.Encoder    | 请求参数编码     | 将请求参数编码，便于通过http请求发送                   |
| feign.Contract         | 支持的注解格式   | 默认是SpringMVC的注解                                  |
| feign.Retryer          | 失败重试机制     | 请求失败的重试机制，默认是没有，不过会使用Ribbon的重试 |

一般情况下，默认值就能满足我们使用，如果要自定义时，只需要创建自定义的@Bean覆盖默认Bean即可。

查看OpenFeign的远程通信日志：

  第一步：把日志级别调节为debug: debug<info<waring<error

 第二步：给OpenFeign的日志级别





下面以日志为例来演示如何自定义配置，支持两种方式的配置：

> ##### 基于配置文件的方式

基于配置文件修改feign的日志级别可以针对单个服务：

```yaml
# 将feign包下产生的日志的级别设置为debug
logging:
  level:
    com.atguigu.spzx.cloud.order.feign: debug
    
# openfeign日志级别配置
spring:
  cloud:
    openfeign:
      client:
        config: 
          spzx-cloud-user:  
            loggerLevel: full
```

也可以针对所有服务：

```yaml
# 将feign包下产生的日志的级别设置为debug
logging:
  level:
    com.atguigu.spzx.cloud.order.feign: debug
    
# openfeign日志级别配置
spring:
  cloud:
    openfeign:
      client:
        config: 
          default:  # 这里用default就是全局配置，如果是写服务名称，则是针对某个微服务的配置
            loggerLevel: full
```

而日志的级别分为四种：

① NONE：不记录任何日志信息，这是默认值。

② BASIC：仅记录请求的方法，URL以及响应状态码和执行时间

③ HEADERS：在BASIC的基础上，额外记录了请求和响应的头信息

④ FULL：记录所有请求和响应的明细，包括头信息、请求体、元数据。



### 超时配置

**超时机制概述**：Feign 的超时机制是指在使用 Feign 进行服务间的 HTTP 调用时，设置请求的超时时间。当请求超过设定的超时时间后，Feign 将会中断该请求并抛出相应的异常。

**超时机制的意义**：

1、防止长时间等待：通过设置适当的超时时间，可以避免客户端在请求服务时长时间等待响应而导致的性能问题。如果没有超时机制，客户端可能会一直等待，从而影响整个系统的吞吐量和响应时间。

2、避免资源浪费：超时机制可以帮助及时释放占用的资源，例如连接、线程等。如果请求一直处于等待状态而不超时，将导致资源的浪费和系统的负载增加。

3、优化用户体验：超时机制可以防止用户长时间等待无响应的情况发生，提供更好的用户体验。当请求超时时，可以及时给出错误提示或进行相应的处理，以提醒用户或采取其他措施。

超时时间越长，资源浪费的时间就越长，系统的稳定性就越差，因此需要设置为一个较为合理的超时时间，设置防止如下所示：

```java
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            loggerLevel: full	
            read-timeout: 2000			# 读取数据的超时时间设置为2s
            connect-timeout: 2000		# 建立连接的超时时间设置为2s
```



### 重试配置

feign一旦请求超时了，那么此时就会直接抛出**SocketTimeoutException**: Read timed out的异常。请求超时的原因有很多种，如网络抖动、服务不可用等。如果由于网络暂时不可用导致触发了超时机制，那么此时直接返回异常信息就并不是特别的合理，尤其针对查询请求，肯定希望得到一个结果。合理的做法：**触发超时以后，让feign进行重试**。

具体步骤：

1、自定义重试器

```java
public class FeignClientRetryer implements Retryer {

    // 定义两个成员变量来决定重试次数
    private int start = 1 ;
    private int end = 3 ;

    @Override
    public void continueOrPropagate(RetryableException e) {     // 是否需要进行重试取决于该方法是否抛出异常，如果抛出异常重试结束
        if(start >= end) {
            throw new RuntimeException(e) ;
        }
        start++ ;
    }

    @Override
    public Retryer clone() {    // 框架底层调用该方法得到一个重试器
        return new FeignClientRetryer();
    }
}
```

2、配置重试器

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            loggerLevel: full
            read-timeout: 2000
            connect-timeout: 2000
            retryer: com.atguigu.spzx.cloud.order.feign.FeignClientRetryer		# 配置自定义重试器
```