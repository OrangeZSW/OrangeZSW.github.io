---
title: Gateway组件
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# Gateway组件

## 概述

* Gateway是在spring生态系统之上构建的API网关服务，基于Spring5，SpringBoot2和Project Reactor等技术。Gateway旨在提供一种简单而有效的方式来对API进行路由，以及提供一些强大的过滤器功能，例如：熔断、限流、重试等
* SpringCloud Gateway是SpringCloud的一个全新项目，基于Spring5.X+SpringBoot2.X和Project Reactor等技术开发的网关，它旨在为微服务架构提供一种简单有效的统一的API路由管理方式。
* 为了提升网关的性能，SpringCloud Gatway是基于WebFlux框架实现的，而WebFlux框架底层则使用了高性能的Reactor模式通讯框架Netty。
* SpringCloud Gateway的目标提供统一的路由方式且基于Filter链的方式提供了网关基本的功能，例如：安全、监控/指标、和限流。

## 架构图

![](http://120.26.79.238:9000/blog/img/500aeff97ef93d3543ef8c059bf4e0f8.png)


## 三大核心概念

### Route(路由)

路由是构建网关的基本模块，它由ID，目标URI，一系列的断言和过滤器组成，如果断言为true则匹配该路由

### Predicate（断言）

参考的是java8的java.util.function.Predicate开发人员可以匹配HTTP请求中的所有内容（例如请求头或请求参数），如果请求与断言相匹配则进行路由

### Filter（过滤）

指的是Spring框架中GatewayFilter的实例，使用过滤器，可以在请求被路由前或者之后对请求进行修改。

## 工作流程

![](http://120.26.79.238:9000/blog/img/b6febb88e53ca66217d7b95833168f37.png)


* 客户端向Spring Cloud Gateway发出请求。然后在Gateway Handler Mapping中找到与请求匹配的路由，将其发送到Gateway Web Handler.
* Handler再通过指定的过滤器链来将请求发送给我们实际的服务执行业务逻辑，然后返回。
* 过滤器之间用虚线分开是因为过滤器可能会在发送代理请求之前（"pre"）或之后("post")执行业务逻辑。
* Filter在"pre"类型的过滤器可以做参数校验、权限校验、流量监控、日志输出、协议转换等，在"post"类型的过滤器中可以做响应内容、响应头的修改，日志的输出等有着非常重要的作用

## Gateway入门

1. 创建模块
2. 引入如下依赖：

```xml
<!--网关-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<!--nacos服务发现依赖-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>

<!-- 负载均衡组件 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-loadbalancer</artifactId>
</dependency>
```

3. 编写启动类

```java
@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```



3. 在application.yml配置文件中编写基础配置和路由规则

```yml
server:
  port: 8222
spring:
  application:
    name: spzx-cloud-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
      routes:
        - id: spzx-cloud-user  # 路由id，可以自定义，只要唯一即可
          uri: lb://spzx-cloud-user  # 路由的目标地址 lb就是负载均衡，后面跟服务名称
          predicates:
            - Path=/*/user/** # 路径匹配
        - id: spzx-cloud-order
          uri: lb://spzx-cloud-order
          predicates:
            - Path=/*/order/** # 路径匹配
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
```

## Predicate的使用

- 断言：网关的入口，访问路径的规则
- 框架底层提供了很多规则
- 官网：https://docs.spring.io/spring-cloud-gateway/docs/4.0.6/reference/html/#gateway-request-predicates-factories

![](http://120.26.79.238:9000/blog/img/214a26d647add7520610640d7f93baba.png)


### predicate

- 时间

  - After: 之后
  - before：之前
  - Between：之间

- Cookie

- Header

- Host

- Method

- Path

- Query

- RemoteAddr

- Weight：权重

- XForworded：网段

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
        - id: xforwarded_remoteaddr_route
          uri: https://example.org
     	     predicates:
          - XForwardedRemoteAddr=192.168.1.1/24
  ```

  

### 总结

Spring Cloud Gateway将路由匹配作为Spring WebFlux HandlerMapper基础框架的一部分。
Spring Cloud Gateway包括许多内置的Route Predicate工厂。所有这些Predicate都与HTTP请求的不同属性匹配。多个Route Predicate工厂可以进行组合
Spring Cloud Gateway创建Route对象时，使用RoutePredicateFactory创建Predicate对象，Predicate对象可以赋值给 Route。Spring Cloud Gateway包含许多内置的Route Predicate Factories。所有这些谓词都匹配HTTP请求的不同属性。多种谓词工厂可以组合，并通过逻辑and 。

## 过滤器

GatewayFilter: 局部过滤器

​    路由过滤器：

​    默认过滤器:

GlobalFilter: 全局过滤器

### 内置过滤器

spring gateway提供了31种不同的过滤器。

官网地址：https://docs.spring.io/spring-cloud-gateway/docs/2.2.9.RELEASE/reference/html/#gatewayfilter-factories

例如：

| **名称**             | **说明**                     |
| -------------------- | ---------------------------- |
| AddRequestHeader     | 给当前请求添加一个请求头     |
| RemoveRequestHeader  | 移除请求中的一个请求头       |
| AddResponseHeader    | 给响应结果中添加一个响应头   |
| RemoveResponseHeader | 从响应结果中移除有一个响应头 |
| RequestRateLimiter   | 限制请求的流量               |

在Gateway中提供了三种级别的类型的过滤器：

1、路由过滤器：只针对当前路由有效

2、默认过滤器：针对所有的路由都有效

3、全局过滤器：针对所有的路由都有效，需要进行自定义

### 路由过滤器

- 位置，写在路由下

  ```yaml
  spring:
    cloud:
      gateway:
        routes:
          - id: spzx-cloud-user
            uri: lb://spzx-cloud-user
            predicates:
              - Path=/api/user/**
            filters:
              - AddRequestHeader=Truth, atguigu		# 配置路由基本的过滤器，给访问user微服务的所有接口添加Truth请求头
  ```

  

### 默认过滤器

- 对所有路由都生效

- 格式：

  ```yml
  spring:
    cloud:
      gateway:
        routes:
          - id: spzx-cloud-user
            uri: lb://spzx-cloud-user
            predicates:
              - Path=/api/user/**
              - After=2017-01-20T17:42:47.789-07:00[America/Denver]
        default-filters:
          - AddRequestHeader=Truth, atguigu is good
  ```

### 全局过滤器

- 自定义过滤器：需要自己实现

#### 步骤

1、定义一个类实现GlobalFilter接口

2、重写filter方法

3、将该类纳入到spring容器中

4、实现Ordered接口定义该过滤器的顺序

​		当有多个全局过滤器时，Orderd返回的值越小，优先级越高

#### 实现代码

```java
package online.zorange.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.apache.http.HttpStatus.SC_BAD_REQUEST;

/**
 * @author orange
 * @since 2024/9/13
 */
@Component
public class CustomGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        MultiValueMap<String, String> queryParams = request.getQueryParams();
        String username = queryParams.getFirst("username");
        if(username!=null){
          return    chain.filter(exchange);
        }else{
            response.setStatusCode(HttpStatus.BAD_REQUEST);
        }
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return 0;  //优先级 越小越高
    }
}
```

### 过滤器执行的顺序

- 请求进入网关会碰到三类过滤器：当前路由的过滤器、DefaultFilter、GlobalFilter
- 执行规则

​		1、按照order的值进行排序，order的值越小，优先级越高，执行顺序越靠前。

​		2、路由过滤器和默认过滤器会按照order的值进行排序，这个值由spring进行指定，默认是按照声		明顺序从1递增

​		3、当过滤器的order值一样时，会按照 globalFilter > defaultFilter > 路由过滤器的顺序执行

### RequestRateLimiter

- 默认的限流器
- 基于redis实现

#### 实现步骤

1. 准备可用的redis

   

2. maven中添加依赖

   ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
   </dependency>
   ```

3. 确定按照什么维度限流，例如按照请求中的username参数限流，这是通过编写KeyResolver接口的实现来完成的

   ```java
   @Configuration
   public class CustomizeConfig {
       @Bean
       KeyResolver userKeyResolver() {
           return exchange -> Mono.just(exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());
       }
   }
   ```

   

4. 配置application.yml文件，添加过滤器

   ```yml
   spring:
     cloud:
       nacos:
         discovery:
           server-addr: localhost:8848
       gateway:
         routes:
           - id: spzx-cloud-order
             uri: lb://spzx-cloud-order
             predicates:
               - Path=/*/order/**
             filters:
               - AddResponseHeader=X-Response-Red, Blue
               - name: RequestRateLimiter
                 args:
                   key-resolver: "#{@userKeyResolver}"
                   # 令牌入桶的速度为每秒1个，相当于QPS
                   redis-rate-limiter.replenishRate: 1
                 # 桶内能装5个令牌，相当于峰值，要注意的是：第一秒从桶内能去5个，但是第二秒只能取到1个了，因为入桶速度是每秒1个
                   redis-rate-limiter.burstCapacity: 5
                 # 每个请求需要的令牌数
                   redis-rate-limiter.requestedTokens: 1
   
   # http://localhost:80/api/order/findOrderByOrderId/101
     application:
       name: spzx-cloud-gateway
     data:
       redis:
         host: localhost
         port: 6379
   ```


- 最后使用Jemeter测试即可。

## 跨域处理

### Global CORS Configuration 全局跨域

```yml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "https://docs.spring.io"
            allowedMethods:
            - GET
```

### Route CORS Configuration 路由跨域

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: cors_route
        uri: https://example.org
        predicates:
        - Path=/service/**
        metadata:
          cors:
            allowedOrigins: '*'
            allowedMethods:
              - GET
              - POST
            allowedHeaders: '*'
            maxAge: 30
```