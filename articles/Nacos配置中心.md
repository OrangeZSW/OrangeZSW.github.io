---
title: Nacos配置中心
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# Nacos配置中心

## 统一配置管理

- 当微服务部署的实例越来越多，达到数十、数百时，逐个修改微服务配置就显得十分的不方便，而且很容易出错。我们需要一种统一配置管理方案，可以集中管理所有实例的配置。
- nacos一方面可以将配置集中管理，另一方可以在配置变更时，及时通知微服务，实现配置的热更新。

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/d923af8cb110e8c0b7cccfaec19767cb.png)

## Nacos入门

### 1.在nacos中添加配置

- 配置的选项与服务配置基本一致
- 只有一个区别：服务名改成了配置文件的id（**Data ID**）
- 都有 namespace和group

### 2.微服务集成配置中心

微服务需要进行改造，从Nacos配置中心中获取配置信息进行使用。

步骤：

1、在spzx-cloud-user微服务中，引入spring-cloud-starter-alibaba-nacos-config依赖

```xml
<!-- nacos作为配置中心时所对应的依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

2、在spzx-cloud-user项目的 /src/main/resources/application.yml 配置文件中配置 Nacos Config 地址并引入服务配置

```yml
# 配置数据库的连接信息
spring:
  cloud:
    nacos:
      config:
        server-addr: 192.168.136.142:8848
  config:
    import:
      - nacos:spzx-cloud-user-dev.yml
```

### 读取自定义配置

- @value
- @ConfigurationProperties(prefix="aaa")

**区别**

`@ConfigurationProperties` 当nacos配置文件更新时，里面的参数可以热更新（同步更新）

`@Value` 不能热更新，但是可以使用`@RefreshScope`加在类上，实现热更新

### 配置优先级

优先级顺序：Nacos配置中心的配置(后导入的配置 > 先导入的配置) > application.yml

## 拓展：加载yml文件的两种方式

新版方式：加载yml文件的方式的方式是新版中的方式：spring.config.import

旧版方式：借助于`bootstrap.properties`，`bootstrap.yml`文件，不过 从技术上讲`bootstrap.properties`，`bootstrap.yml` **其文件已被弃用**。

如果使用旧版方式：需要两步：【旧版方式就不需要application.yml文件了】

第一步:需要导入spring-cloud-starter-bootstrap依赖信息

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

第二步：在src/main/resource目录下创建bootstrap.yml

```yml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848 
        enabled: true # 如果不想使用 Nacos 进行配置管理，设置为 false 即可
        group: DEFAULT_GROUP # 组，默认为 DEFAULT_GROUP
        file-extension: yaml # 配置内容的数据格式，默认为 properties
        namespace: 483bb765-a42d-4112-90bc-50b8dff768b3 #指定名称空间的id,如果是public名称空间，这里可以省略。
  datasource:
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/spzx-cloud-user
  application:
    name: spzx-cloud-user
```

### DataId

说明：之所以需要配置 `spring.application.name`，是因为它是构成 Nacos 配置管理 `dataId`字段的一部分。在 Nacos Spring Cloud 中，`dataId` 的完整格式如下：

```txt
${prefix}-${spring.profile.active}.${file-extension}
```

- `prefix` 默认为 `spring.application.name` 的值，也可以通过配置项 `spring.cloud.nacos.config.prefix`来配置。

  ```properties
  # 若不指定，默认采用应用名的方案
  spring.application.name=spzx-cloud-user
  # 手动指定配置的dataID前缀标识
  # spring.cloud.nacos.config.prefix=spzx-cloud-user
  ```

  

- `spring.profile.active` 即为当前环境对应的 profile。**注意：当 `spring.profile.active` 为空时，对应的连接符 `-` 也将不存在，dataId 的拼接格式将变成 `${prefix}.${file-extension}`**

  ```properties
  # dev表示开发环境
  spring.profiles.active=dev
  ```

  

- `file-exetension` 为配置内容的数据格式,默认为properties类型，可以通过配置项 `spring.cloud.nacos.config.file-extension` 来配置,目前支持的类型有 TEXT、JSON、XML、YAML、HTML、Properties。

  ```properties
  # 指定配置文件类型为yaml文件
  spring.cloud.nacos.config.file-extension=yaml
  ```

   最终配置：

  ​    经过前面三个步骤，我们最终在nacos配置中心的控制台新增配置文件就是：spzx-cloud-user-dev.yaml

  

  

  

  通常我们可以这样定义 Namespace，Group，DataId：

  - `Namespace`：代表不同的**环境**，如：开发、测试， 生产等；
  - `Group`：代表某个**项目**，如：XX物流项目，XX教育项目；
  - `DataId`：每个项目下往往有若干个**应用**，每个配置集(DataId)是一个应用的**主配置文件**

  

## 公共配置

日常开发中，多个模块可能会有很多共用的配置，比如数据库连接信息，Redis 连接信息，RabbitMQ 连接信息，监控配置等等。那么此时，我们就希望可以加载多个配置，多个项目共享同一个配置之类等功能，Nacos Config 也确实支持。

Nacos在配置路径spring.cloud.nacos.config.extension-configs下，允许我们指定⼀个或多个额外配置。
        Nacos在配置路径spring.cloud.nacos.config.shared-configs下，允许我们指定⼀个或多个共享配置。

上述两类配置都⽀持三个属性：

```tex
data-id(引用的配置文件全称)
group(默认为字符串DEFAULT_GROUP)
refresh(默认为false)    //是否开启热更新
```

- 这两种配置方式都可以同时导入多个配置文件，因此就有两种（都有两种，把extension替换成shared）方式,

  1. 下标

     ```yaml
     spring:
       cloud:
         nacos:
           config:
           	extension-configs[0]:
           		data-id: xxxxx
           		group: 
           		refresh: true
           	extension-configs[1]:
           		data-id: yyyyy
           		group: 
           		refresh: true
     ```

  2. `-`

     ```yaml
     spring:
       cloud:
         nacos:
           config:
           	extension-configs:
           		- data-id: xxx.uml
           			graoup:
           			refresh: true
           		- data-id: yyyy.uml
           			graoup:
           			refresh: true
     ```

### 不同方式配置加载优先级

  Nacos 配置中心目前提供以下三种配置能力从 Nacos 拉取相关的配置，当三种方式共同使用时，他们的一个优先级关系是:A < B < C：

- A：通过 spring.cloud.nacos.config.shared-configs[n].data-id 支持多个共享 Data Id 的配置
- B：通过 spring.cloud.nacos.config.extension-configs[n].data-id 的方式支持多个扩展 Data Id 的配置
- C：通过内部相关规则(spring.cloud.nacos.config.prefix、spring.cloud.nacos.config.file-extension、spring.cloud.nacos.config.group)自动生成相关的 Data Id 配置。


### 共享配置和拓展配置的区别

在Nacos中，`shared-configs`和`extension-configs`是两种不同的配置存储方式，它们主要用于不同的场景和目的：

1. **shared-configs**：
   - **作用**：用于存储应用程序的共享配置，即多个应用程序可以共同使用的配置信息。
   - **特点**：这些配置项通常是多个微服务或应用程序之间共享的核心配置，例如数据库连接信息、公共服务的地址、全局性的配置参数等。
   - **优点**：通过将这些共享配置放在`shared-configs`中，可以实现统一管理和更新，确保所有使用这些配置的应用程序在配置变更时能够及时获取最新的配置信息。
2. **extension-configs**：
   - **作用**：用于存储应用程序的扩展配置，即特定于某个应用或模块的配置信息。
   - **特点**：这些配置项是应用程序特有的，通常是各个微服务或模块需要的特定配置，如每个微服务的业务相关的配置、特定功能的开关等。
   - **优点**：将这些配置放在`extension-configs`中有助于保持配置的独立性和隔离性，避免不同应用程序之间的配置混淆和冲突。

**总结**：

- `shared-configs`适用于存储全局和共享的配置，以确保多个应用程序能够共享和同步这些配置。
- `extension-configs`适用于存储特定应用程序或服务的个性化配置，以确保每个应用程序都能获取到其所需的特定配置信息。

在实际使用中，根据配置的共享程度和应用的功能需求，可以灵活选择将配置项存储在哪种配置中心中。

## Nacos做配置中心数据持久化到mysql

- 第一步：在navicat创建nacos_config库，并将nacos/conf目录下的mysql-schema.sql文件在navicat中导入

- 第二步：在conf 下找到application.properties 文件，进行配置。配置文件如下:

  ```properties
  spring.datasource.platform=mysql
  db.num=1
  
  ### Connect URL of DB:
  db.url.0=jdbc:mysql://127.0.0.1:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
  db.user.0=root
  db.password.0=123456
  ```

- 第三步：配置置完成启动nacos，操作就可以持久化