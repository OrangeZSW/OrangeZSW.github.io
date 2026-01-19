---
title: 分布式链路追踪技术Zipkin+Micrometer Tracing
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# 分布式链路追踪技术Zipkin+Micrometer Tracing

## zipkin介绍

**Zipkin 分布式跟踪系统**就能非常好地解决该问题，**主要解决以下3点问题：**

1.动态展示服务的链路；

2.分析服务链路的瓶颈并对其进行调优；

3.快速进行服务链路的故障发现。

## zipkin架构

**ZipKin 可以分为两部分：**

- **ZipKin Server** ：用来作为数据的采集存储、数据分析与展示；
- **ZipKin Client** ：基于不同的语言及框架封装的一些列客户端工具，这些工具完成了追踪数据的生成与上报功能。

![](http://120.26.79.238:9000/orange-blog/articleImages/1/5c1546e81af2c067128d5091dc127743.png)


Instrumented client和server是分别使用了ZipKin Client的服务，Zipkin Client会根据配置将追踪数据发送到Zipkin  Server中进行数据存储、分析和展示。

#### zipkin服务端

Zipkin (服务端)包含四个组件，分别是 collector、storage、search、web UI。

**1) collector 信息收集器**: collector 接受或者收集各个应用传输的数据。

**2) storage 存储组件**: zipkin 默认直接将数据存在内存中，此外支持使用 Cassandra、ElasticSearch 和 Mysql 。

**3) API（Query）** 负责查询Storage中存储的数据，提供简单的JSON API获取数据，主要提供给web UI使用。

**4) web UI 服务端展示平台**:主要是提供简单的 web 界面，用图表将链路信息清晰地展示给开发人员。

### zipkin客户端

![](http://120.26.79.238:9000/orange-blog/articleImages/1/9782c69779f42011b169990f01b2c809.png)


ZipKin几个概念:

在追踪日志中，有几个基本概念spanId、traceId、parentId

traceId：用来确定一个追踪链的16字符长度的字符串，在某个追踪链中保持不变。

spanId：区域Id，在一个追踪链中spanId可能存在多个，每个spanId用于表明在某个服务中的身份，也是16字符长度的字符串。

parentId：在跨服务调用者的spanId会传递给被调用者，被调用者会将调用者的spanId作为自己的parentId，然后自己再生成spanId。

## 具体整合步骤：Micrometer tacing + brave + zipkin

第一步：先自动ZipkinServer:

>  java -jar zipkin-server-3.3.1-exec.jar

或者docker方式：

> docker方式： docker run -d -p 9411:9411 openzipkin/zipkin

如果是本机启动，启动后访问：http://localhost:9411/ 即可。

第二步：在微服务中整合zipkin客户端依赖信息：

```xml
    <dependencies>
         <!-- 用于监控和管理 Spring Boot 应用 -->
       <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
          <!-- 是 Zipkin 的一个组件，用于将分布式追踪数据（trace data）从应用程序发送到 Zipkin 服务器 -->
        <dependency>
            <groupId>io.zipkin.reporter2</groupId>
            <artifactId>zipkin-reporter-brave</artifactId>
        </dependency>
        <!-- 是 Micrometer 项目的一部分，用于将 Micrometer 的指标（metrics）和 Brave 的分布式追踪（tracing）功能集成在一起 -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-tracing-bridge-brave</artifactId>
        </dependency>

         <!--用于集成 Feign 客户端和 Micrometer 度量库的模块 -->
        <dependency>
            <groupId>io.github.openfeign</groupId>
            <artifactId>feign-micrometer</artifactId>
            <version>12.3</version>
        </dependency>
      <!--用于对应用程序中的关键操作进行观测（observation），从而收集详细的性能指标和追踪数据 -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-observation</artifactId>
        </dependency>
        
         <!--整合zipkin时提示信息用到的 -->
         <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
            <version>2.2.8.RELEASE</version>
        </dependency>
    </dependencies>


    <dependencyManagement>
        <!--为io.micrometer包下的jar包提供版本管理 -->
        <dependencies>
            <dependency>
                <groupId>io.micrometer</groupId>
                <artifactId>micrometer-tracing-bom</artifactId>
                <version>1.0.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

```

第三步：在微服务yml文件中配置:

```yml
spring:
  zipkin:
    base-url: http://192.168.200.111:9411/  #zipkin链接地址
    discovery-client-enabled: false  #不用开启服务发现


management:
  tracing:
    sampling:
      probability: 1.0   #采样频率
  zipkin:
    tracing:
      endpoint: http://192.168.200.111:9411/api/v2/spans  #zipkin的追踪入口
logging:
  pattern:
    level: ${spring.application.name},%X{traceId:-},%X{spanId:-}  #采集日志格式
```



第四步：访问订单微服务接口：http://localhost:10200/api/order/findOrderByOrderId/101

​                访问zipkin服务：http://192.168.200.111:9411/zipkin

就能看到微服务调用链路、每个阶段的时间消耗及哪个微服务出现了异常信息。