---
title: seata 分布式事务
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# 事务回顾

- 概述: 就是由多个操作组成的一个逻辑单元，组成这个逻辑单元的多个操作要么都成功要么都失败。

## ACID四大特性

**A：原子性(Atomicity)**

一个事务(transaction)中的所有操作，要么全部完成，要么全部不完成，不会结束在中间某个环节。事务在执行过程中发生错误，会被回滚（Rollback）到事务开始前

的状态，就像这个事务从来没有执行过一样。

**C：一致性(Consistency)**

事务的一致性指的是在一个事务执行之前和执行之后数据库都必须处于一致性状态。

如果事务成功地完成，那么系统中所有变化将正确地应用，系统处于有效状态。

如果在事务中出现错误，那么系统中的所有变化将自动地回滚，系统返回到原始状态。

**I：隔离性(Isolation)**

指的是在并发环境中，当不同的事务同时操纵相同的数据时，每个事务都有各自的完整数据空间。由并发事务所做的修改必须与任何其他并发事务所做的修改隔离。事务查看

数据更新时，数据所处的状态要么是另一事务修改它之前的状态，要么是另一事务修改它之后的状态，事务不会查看到中间状态的数据。

**D：持久性(Durability)**

指的是只要事务成功结束，它对数据库所做的更新就必须保存下来。即使发生系统崩溃，重新启动数据库系统后，数据库还能恢复到事务成功结束时的状态。


## 事务的并发问题

**脏读**：事务A读取了事务B更新的数据，事务B未提交并回滚数据，那么A读取到的数据是脏数据

**不可重复读**：事务A多次读取同一数据，事务B在事务A多次读取的过程中，对数据作了更新并提交，导致事务A多次读取同一数据时，结果不一致。

**幻读**：一个事务读取到了另外一个事务插入的数据，就好像发生了幻觉一样，这就叫幻读。

**小结**：不可重复读的和幻读很容易混淆，不可重复读侧重于修改，幻读侧重于新增或删除。

## 事务隔离级别

针对并发事务所带来的问题，要想解决就需要使用到事务的隔离级别。

常见的事务隔离级别和解决的问题的对应关系表如下所示：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/70e8222c4c5185cf2cae6a9436219e32.png)


## 事务传播行为

- **概述**：指的就是当一个方法被另一个方法调用时，这个方法对事务的态度。

Spring定义了七种传播行为：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/b8355de5ce618d4071211f66780424ab.png)



# 分布式事务概述

## 本地事务

- 称为数据库事务或传统事务（相对于分布式事务而言）。这一类事务是基于单个服务单一数据库访问的事务。

## 分布式事务简介

- 概述：分布式事务指的是组成业务逻辑单元的多个操作位于不同的服务上或者访问不同的数据库节点，分布式事务需要保证这些操作要么全部成功，要么全部失败。

# 理论基础

## CAP定理

1998年，加州大学的计算机科学家 Eric Brewer 提出，分布式系统有三个指标。

1、Consistency（一致性）

2、Availability（可用性）

3、Partition tolerance （分区容错性）

  

它们的第一个字母分别是 C、A、P。

Eric Brewer 说，这三个指标不可能同时做到。这个结论就叫做 CAP 定理。

### 一致性

Consistency（一致性）：用户访问分布式系统中的任意节点，得到的数据必须一致。

### 可用性

Availability （可用性）：用户访问集群中的任意健康节点，必须能得到响应，而不是超时或拒绝。

### 分区容错

因为网络故障或其它原因导致分布式系统中的部分节点与其它节点失去连接，形成独立分区。

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/6eee135715558706fc80fe9a8f2765db.png)


- Tolerance（容错）：在集群出现分区时，整个系统也要持续对外提供服务

在分布式系统中，系统间的网络不能100%保证健康，一定会有故障的时候，而服务有必须对外保证服务。因此Partition Tolerance不可避免。当节点接收到新的数据变更时，就会出现问题了：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/b3fef90f191b4db5800b1c0b026de78d.png)


- 如果此时要保证一致性，就必须等待网络恢复，完成数据同步后，整个集群才对外提供服务，服务处于阻塞状态，不可用。

- 如果此时要保证可用性，就不能等待网络恢复，那node01、node02与node03之间就会出现数据不一致。

也就是说，在P一定会出现的情况下，A和C之间只能实现一个。

注意：在CAP定理中一致性强调的是强一致性

## BASE理论

BASE理论是对CAP的一种解决思路，包含三个思想：

1、Basically Available （基本可用）：分布式系统在出现故障时，允许损失部分可用性，即保证核心可用。

2、Soft State（软状态）：在一定时间内，允许出现中间状态，比如临时的不一致状态。

3、Eventually Consistent（最终一致性）：虽然无法保证强一致性，但是在软状态结束后，最终达到数据一致。


# Seata

## Seata简介

Seata是 2019 年 1 月份蚂蚁金服和阿里巴巴共同开源的分布式事务解决方案。致力于提供高性能和简单易用的分布式事务服务，为用户打造一站式的分布式解决方案。

官网地址：https://seata.io/zh-cn/，其中的文档、播客中提供了大量的使用说明、源码分析。

## Seata架构

- 基础概念：

  - 分支事务：每一个业务系统的事务

  - 全局事务：多个有关联的各个分支事务组成在一起



**Seata事务管理中有三个重要的角色：**

- 1、TC (Transaction Coordinator) - 事务协调者：维护全局和分支事务的状态，驱动全局事务提交或回滚。

- 2、TM (Transaction Manager) - 事务管理器：定义全局事务的范围：开始全局事务、提交或回滚全局事务。

- 3、RM (Resource Manager) - 资源管理器：管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。



工作流程如下图所示：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/68e4364165e0e1e70eb84c2cc5b2dac2.png)


基本流程介绍：

1、由TM注册全局事务到TC服务器

2、TC服务器会返回xid(本次全局事务的id)，这个xid会随着微服务的调用一并传递下去

3、执行分支事务，此时就需要通过RM服务器注册分支事务到TC服务器

4、执行业务SQL，并有RM服务器报告每一个分支事务的执行状态到TC服务器

5、当全局事务结束以后，TC会进行分支事务状态的统计，然后在通过RM服务器进行分支事务的回滚或者提交

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/d8cb491b07849f9c074b9297a20d511e.png)


### 四种不同的分布式事务解决方案：

1、XA模式：强一致性分阶段事务模式，牺牲了一定的可用性，无业务侵入

2、AT模式：最终一致的分阶段事务模式，无业务侵入，也是Seata的默认模式

3、TCC模式：最终一致的分阶段事务模式，有业务侵入

4、SAGA模式：长事务模式，有业务侵入

无论哪种方案，都离不开TC，也就是事务的协调者。

### 解决分布式事务的思想和模型：

- 全局事务：整个分布式事务

- 分支事务：分布式事务中包含的每个子系统的事务

- 最终一致思想：各分支事务分别执行并提交，如果有不一致的情况，再想办法恢复数据

- 强一致思想：各分支事务执行完业务不要提交，等待彼此结果。而启统一提交或回滚

## Seata 配置

### 1. 修改seata 的配置文件

这个TC服务在运行的时候需要一些配置信息，我们可以将这些配置信息交由Nacos进行统一管理。并且需要将TC服务注册到Nacos，后期微服务就可以从Nacos中获取TC服务器的地址信息完成事务的控制。

- config/application.yml

``` yml
# 配置seata后台管理系统的访问用户名和密码
  console:
  user:
    username: seata
    password: seata
seata:
  config:
    # support: nacos, consul, apollo, zk, etcd3
    type: nacos
    nacos:
      server-addr: 192.168.136.145:8848
      namespace:
      group: SEATA_GROUP
      username:
      password:
      context-path:
      data-id: seataServer.properties
  registry:
    # support: nacos, eureka, redis, zk, consul, etcd3, sofa
    type: nacos
    nacos:
      application: seata-server
      server-addr: 192.168.136.145:8848
      group: SEATA_GROUP
      namespace:
      cluster: default
      username:
      password:
      context-path:
  #store:
    # support: file 、 db 、 redis 、 raft
    # mode: file
  #  server:
  #    service-port: 8091 #If not configured, the default is '${server.port} + 1000'
```

### 2.  为seata配置,(nacos配置中心)

在Nacos中添加TC服务所需要的配置文件seataServer.properties。

```ct.properties
#For details about configuration items, see https://seata.io/zh-cn/docs/user/configurations.html
#Transport configuration, for client and server
transport.type=TCP
transport.server=NIO
transport.heartbeat=true
transport.enableTmClientBatchSendRequest=false
transport.enableRmClientBatchSendRequest=true
transport.enableTcServerBatchSendResponse=false
transport.rpcRmRequestTimeout=30000
transport.rpcTmRequestTimeout=30000
transport.rpcTcRequestTimeout=30000
transport.threadFactory.bossThreadPrefix=NettyBoss
transport.threadFactory.workerThreadPrefix=NettyServerNIOWorker
transport.threadFactory.serverExecutorThreadPrefix=NettyServerBizHandler
transport.threadFactory.shareBossWorker=false
transport.threadFactory.clientSelectorThreadPrefix=NettyClientSelector
transport.threadFactory.clientSelectorThreadSize=1
transport.threadFactory.clientWorkerThreadPrefix=NettyClientWorkerThread
transport.threadFactory.bossThreadSize=1
transport.threadFactory.workerThreadSize=default
transport.shutdown.wait=3
transport.serialization=seata
transport.compressor=none

# 首先应用程序（客户端）中配置了事务分组，若应用程序是SpringBoot则通过配置seata.tx-service-group=[事务分组配置项]
# 事务群组，service.vgroupMapping.[事务分组配置项]=TC集群的名称
service.vgroupMapping.default_tx_group=default
#If you use a registry, you can ignore it
service.default.grouplist=127.0.0.1:8091
service.enableDegrade=false
service.disableGlobalTransaction=false

client.metadataMaxAgeMs=30000
#Transaction rule configuration, only for the client
client.rm.asyncCommitBufferLimit=10000
client.rm.lock.retryInterval=10
client.rm.lock.retryTimes=30
client.rm.lock.retryPolicyBranchRollbackOnConflict=true
client.rm.reportRetryCount=5
client.rm.tableMetaCheckEnable=true
client.rm.tableMetaCheckerInterval=60000
client.rm.sqlParserType=druid
client.rm.reportSuccessEnable=false
client.rm.sagaBranchRegisterEnable=false
client.rm.sagaJsonParser=fastjson
client.rm.tccActionInterceptorOrder=-2147482648
client.rm.sqlParserType=druid
client.tm.commitRetryCount=5
client.tm.rollbackRetryCount=5
client.tm.defaultGlobalTransactionTimeout=60000
client.tm.degradeCheck=false
client.tm.degradeCheckAllowTimes=10
client.tm.degradeCheckPeriod=2000
client.tm.interceptorOrder=-2147482648
client.undo.dataValidation=true
client.undo.logSerialization=jackson
client.undo.onlyCareUpdateColumns=true
server.undo.logSaveDays=7
server.undo.logDeletePeriod=86400000
client.undo.logTable=undo_log
client.undo.compress.enable=true
client.undo.compress.type=zip
client.undo.compress.threshold=64k
#For TCC transaction mode
tcc.fence.logTableName=tcc_fence_log
tcc.fence.cleanPeriod=1h
# You can choose from the following options: fastjson, jackson, gson
tcc.contextJsonParserType=fastjson

#Log rule configuration, for client and server
log.exceptionRate=100

#事务会话信息存储方式
#Transaction storage configuration, only for the server. The file, db, and redis configuration values are optional.
store.mode=db
#事务锁信息存储方式
store.lock.mode=db
#事务回话信息存储方式
store.session.mode=db
#Used for password encryption
store.publicKey=

#If `store.mode,store.lock.mode,store.session.mode` are not equal to `file`, you can remove the configuration block.
store.file.dir=file_store/data
store.file.maxBranchSessionSize=16384
store.file.maxGlobalSessionSize=512
store.file.fileWriteBufferCacheSize=16384
store.file.flushDiskMode=async
store.file.sessionReloadReadSize=100

#存储方式为db
#These configurations are required if the `store mode` is `db`. If `store.mode,store.lock.mode,store.session.mode` are not equal to `db`, you can remove the configuration block.
store.db.datasource=druid
store.db.dbType=mysql
store.db.driverClassName=com.mysql.cj.jdbc.Driver
store.db.url=jdbc:mysql://192.168.136.145:3308/seata?useUnicode=true&rewriteBatchedStatements=true&useSSL=false
store.db.user=root
store.db.password=1234
store.db.minConn=5
store.db.maxConn=30
store.db.globalTable=global_table
store.db.branchTable=branch_table
store.db.distributedLockTable=distributed_lock
store.db.queryLimit=100
store.db.lockTable=lock_table
store.db.maxWait=5000

#These configurations are required if the `store mode` is `redis`. If `store.mode,store.lock.mode,store.session.mode` are not equal to `redis`, you can remove the configuration block.
store.redis.mode=single
store.redis.type=pipeline
store.redis.single.host=127.0.0.1
store.redis.single.port=6379
store.redis.sentinel.masterName=
store.redis.sentinel.sentinelHosts=
store.redis.sentinel.sentinelPassword=
store.redis.maxConn=10
store.redis.minConn=1
store.redis.maxTotal=100
store.redis.database=0
store.redis.password=
store.redis.queryLimit=100

#Transaction rule configuration, only for the server
server.recovery.committingRetryPeriod=1000
server.recovery.asynCommittingRetryPeriod=1000
server.recovery.rollbackingRetryPeriod=1000
server.recovery.timeoutRetryPeriod=1000
server.maxCommitRetryTimeout=-1
server.maxRollbackRetryTimeout=-1
server.rollbackRetryTimeoutUnlockEnable=false
server.distributedLockExpireTime=10000
server.session.branchAsyncQueueSize=5000
server.session.enableBranchAsyncRemove=false
server.enableParallelRequestHandle=true
server.enableParallelHandleBranch=false

server.raft.cluster=127.0.0.1:7091,127.0.0.1:7092,127.0.0.1:7093
server.raft.snapshotInterval=600
server.raft.applyBatch=32
server.raft.maxAppendBufferSize=262144
server.raft.maxReplicatorInflightMsgs=256
server.raft.disruptorBufferSize=16384
server.raft.electionTimeoutMs=2000
server.raft.reporterEnabled=false
server.raft.reporterInitialDelay=60
server.raft.serialization=jackson
server.raft.compressor=none
server.raft.sync=true

#Metrics configuration, only for the server
metrics.enabled=false
metrics.registryType=compact
metrics.exporterList=prometheus
metrics.exporterPrometheusPort=9898
```


注意：

1、其中的数据库地址、用户名、密码都需要修改成你自己的数据库信息

2、添加useSSL=false参数，关闭安全链接

3、如果使用的是mysql8，需要指定mysql8的驱动：com.mysql.cj.jdbc.Driver

4、注意jdk版本是8或者11，其他的jdk版本可能导致出现问题
5、创建数据库表

 >特别注意：tc服务在管理分布式事务时，需要记录事务相关数据到数据库中，你需要提前创建好这些表。
 >新建一个名为seata的数据库，运行script\server\db\mysql.sql脚本文件。

- 启动seata: 
  打开浏览器，访问seata后台管理系统。地址：http://localhost:7091，用户名/密码: seata/seata

### 3. 引入依赖

```xml
<!--Seata依赖  -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    <exclusions>
        <exclusion>
            <groupId>io.seata</groupId>
            <artifactId>seata-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!--使用2.0.0的seata的版本-->
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
</dependency>
```

### 4. 添加公共配置

- 在nacos配置中心上添加seata的tc服务的公共配置：data-id=seata-common.yaml   group=SEATA_GROUP

```yml
seata:
  # 配置seata-server在nacos注册中心上的信息
  registry:
    type: nacos
    nacos:
      namespace:
      group: SEATA_GROUP
      application: seata-server
      server-addr: 192.168.136.145:8848
  # 配置事务组的名称，需要和seata服务端的配置保持一致
  tx-service-group: default_tx_group
  service:
    vgroup-mapping:
      default_tx_group: default
  data-source-proxy-mode: XA   # 配置事务管理模式为xa模式
```

```application.properties
spring.cloud.nacos.config.shared-configs[0].data-id=seata-common.yaml
spring.cloud.nacos.config.shared-configs[0].group=SEATA_GROUP
```

### 5. 使用

@GlobalTransactional
在BusinessServiceImpl的add方法上添加@GlobalTransactional注解，声明当前方法是一个全局事务方法。


# XA原理

XA规范是X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准。

XA规范描述了全局的事务管理器与局部的资源管理器之间的接口。 XA规范的目的是允许的多个资源（如数据库，应用服务器，消息队列等）在同一事务中访问，这样可以使 

ACID属性跨越应用程序而保持有效。



XA规范使用两阶段提交（2PC，Two-Phase Commit）来保证所有资源同时提交或回滚任何特定的事务。

XA规范在上世纪 90 年代初就被提出。目前，几乎所有主流的数据库(MySQL、Oracle)都对 XA 规范 提供了支持。


## 工作原理

在 Seata 定义的分布式事务框架内，利用事务资源（数据库、消息服务等）对XA协议的支持，以XA协议的机制来管理分支事务的一种事务模式。
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/098e4a093965a9b27dbf05d93e38201e.png)



- 工作流程如下所示：

**RM一阶段的工作**：

1、注册分支事务到TC

2、执行分支业务sql但不提交

3、报告执行状态到TC

**TC二阶段的工作**：TC检测各分支事务执行状态

a.如果都成功，通知所有RM提交事务

b.如果有失败，通知所有RM回滚事务

**RM二阶段的工作**：接收TC指令，提交或回滚事务


- 正常情况：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/4bd77fdbe3836562005674bbb6f94427.png)



- 异常情况：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/9e20a6800eaf8f7b03337a042e66a3cc.png)




## 优缺点

- XA模式的优点是什么？

1、业务无侵入：和 AT 一样，XA 模式将是业务无侵入的，不给应用设计和开发带来额外负担。

2、事务的强一致性，满足ACID原则。

3、数据库的支持广泛：XA 协议被主流关系型数据库广泛支持，不需要额外的适配即可使用。



- XA模式的缺点是什么？

XA prepare后，分支事务进入阻塞阶段，收到XA commit 或 XA rollback 前必须阻塞等待。事务资源长时间得不到释放，锁定周期长，而且在应用层上面无法干预，性能差。



# AT模式

更改nacos中seata-common.yaml的配置，如下所示：

``` yml
      seata:
      data-source-proxy-mode: AT          # 使用Seata框架的AT模式，默认是AT模式
```

重启服务进行测试。

## 原理介绍

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/883e33edda608618b89a9a8614d808fd.png)


- 工作流程如下所示：

**阶段一RM的工作：**

1、注册分支事务

2、记录undo-log（数据快照：记录某一时刻数据的状态）

3、执行业务sql并提交

4、报告事务状态

**阶段二提交时RM的工作**：删除undo-log即可

**阶段二回滚时RM的工作**：根据undo-log恢复数据到更新前

## 流程梳理

AT模式下，当前分支事务执行流程如下：

### 一阶段：

1）TM发起并注册全局事务到TC

2）TM调用分支事务

3）分支事务准备执行业务SQL

4）RM拦截业务SQL，根据where条件查询原始数据，形成快照。

``` json
      {
        "id": 1, "money": 100
    }
```

5）RM执行业务SQL，提交本地事务，释放数据库锁。此时 money = 90

6）RM报告本地事务状态给TC

###  二阶段：

1）TM通知TC事务结束

2）TC检查分支事务状态

2.1 如果都成功，则立即删除快照

2.2 如果有分支事务失败，需要回滚。读取快照数据（{"id": 1, "money": 100}），将快照恢复到数据库。此时数据库再次恢复为100

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/a434854772308504fab555287337eb29.png)


![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/d5ee70dc3dec24d1a2ffdaaa63ecb242.png)



## AT与XA的区别

简述AT模式与XA模式最大的区别是什么？

1、XA模式一阶段不提交事务，锁定资源；AT模式一阶段直接提交，不锁定资源。

2、XA模式依赖数据库机制实现回滚；AT模式利用数据快照实现数据回滚。(undo_log表(快照))

3、XA模式强一致；AT模式最终一致



## 脏写问题

### 问题介绍

在多线程并发访问AT模式的分布式事务时，有可能出现丢失更新问题，如图：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/1f43a45b40f83b2146fae8e97e9b4bc7.png)


### 全局锁

解决思路就是引入了全局锁的概念。在释放DB锁之前，先拿到全局锁。避免同一时刻有另外一个事务来操作当前数据。

如下图所示：

tx1 先开始，开启本地事务，拿到本地锁，更新操作 m = 1000 - 100 = 900。本地事务提交前，先拿到该记录的 全局锁 ，本地提交释放本地锁。 tx2 后开始，开启本地事务，拿到本地锁，更新操作 m = 900 - 100 = 800。本地事务提交前，尝试拿该记录的 全局锁 ，tx1 全局提交前，该记录的全局锁被 tx1 持有，tx2 需要重试等待 全局锁 。

tx1 二阶段全局提交，释放 全局锁 。tx2 拿到 全局锁 提交本地事务。


如果 tx1 的二阶段全局回滚，则tx1需要重新获取该数据的本地锁，进行反向补偿的更新操作，实现分支的回滚。此时，如果tx2仍在等待该数据的 全局锁，同时持有本地锁，则tx1的分支回滚会失败。分支的回滚会一直重试，直到tx2的 全局锁 等锁超时，放弃 全局锁 并回滚本地事务释放本地锁，tx1 的分支回滚最终成功。

为整个过程 全局锁 在 tx1 结束前一直是被 tx1 持有的，所以不会发生 脏写 的问题。

思考问题：每一个微服务中所提供的undo_log表的作用、以及seata数据库中所对应的表的作用分表是什么?


# TCC模式

## TCC模式概述

TCC模式与AT模式非常相似，每阶段都是独立事务，不同的是TCC通过**人工编码**来实现数据恢复。需要实现三个方法：

1、Try：资源的检测和预留； 

2、Confirm：完成资源操作业务；要求 Try 成功 Confirm 一定要能成功。

3、Cancel：预留资源释放，可以理解为try的反向操作。

##  流程分析

举例，一个扣减用户余额的业务。假设账户A原来余额是100，需要余额扣减30元。

**阶段一（ Try ）**：检查余额是否充足，如果充足则冻结金额增加30元，可用余额扣除30

初识余额：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/bfcf35531d2f9f6ccb02e133b7d776c1.png)

余额充足，可以冻结：
![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/6431cfac8b9f19d26b8230bd0fe0a9b8.png)





此时，总金额 = 冻结金额 + 可用金额，数量依然是100不变。事务直接提交无需等待其它事务。

**阶段二（Confirm)**：假如要提交（Confirm），则冻结金额扣减30

确认可以提交，不过之前可用金额已经扣减过了，这里只要清除冻结金额就好了：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/751ecd147e82aef38e0a52ff7914a1a8.png)

此时，总金额 = 冻结金额 + 可用金额 = 0 + 70  = 70元

**阶段二(Canncel)**：如果要回滚（Cancel），则冻结金额扣减30，可用余额增加30

需要回滚，那么就要释放冻结金额，恢复可用金额：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/301479a856a77e47521610c8dc8038d7.png)


## 7.3 原理介绍

工作模式如下图所示：

![](http://120.26.79.238/minioapi/orange-blog/articleImages/1/bfa02782458a9a4ba2d677002031a441.png)


## 7.4 优缺点

TCC模式的每个阶段是做什么的？

- Try：资源检查和预留
- Confirm：业务执行和提交
- Cancel：预留资源的释放

TCC的优点是什么？

- 一阶段完成直接提交事务，释放数据库资源，性能好
- 相比AT模型，无需生成快照，无需使用全局锁，**性能最强**
- **不依赖数据库事务**，而是依赖补偿操作，可以用于非事务型数据库

TCC的缺点是什么？

- 有代码侵入，需要人为编写try、Confirm和Cancel接口，太麻烦
- 软状态，事务是最终一致













