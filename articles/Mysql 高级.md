---
title: Mysql 高级
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# Mysql 高级

## 配置

- **配置文件路径**
  `/etc/mysql/conf.d`
- 以`.cnf`结尾的可以被mysql加载
- **配置文件节点**
  在配置文件中,配置项写在`[mysqld]`或`[mysql]`下,分别代表服务端和客户端配置


### 字符集

MySQL 8版本之前，默认字符集为 latin1（ISO-8859-1） ，不支持中文，使用前必须设置字符集为utf8（utf8mb3）或utf8mb4。从MySQL 8开始，数据库的默认字符集为 utf8mb4 ，从而避免中文乱码的问题。

` SHOW VARIABLES LIKE '%char%'`;

utf8与utf8mb4

```utf8 字符集表示一个字符需要使用1～4个字节，但是我们常用的一些字符使用1～3个字节就可以表示了。而字符集表示一个字符所用的最大字节长度，在某些方面会影响系统的存储和性能，所以设计MySQL的设计者偷偷的定义了两个概念：
utf8mb3 ：阉割过的 utf8 字符集，只使用1～3个字节表示字符。（无法存储emoji表情）
MySQL5.7中的utf8是utf8mb3字符集
utf8mb4 ：正宗的 utf8 字符集，使用1～4个字节表示字符。
MySQL8.0中的utf8是utf8mb4字符集
```

### 大小写

- **Windows环境：**

全部不区分大小写

- **Linux环境：**

1、数据库名、表名、表的别名、变量名严格区分大小写；

2、列名与列的别名不区分大小写。

3、关键字、函数名称不区分大小写；

-	 **设置linux不区分大小写**

1. 在配置文件中设置
   `lower_case_table_names=1 `
2. Docker容器

```shell
docker run -d \
-p 3309:3306 \
-v /atguigu/mysql/mysql8/conf:/etc/mysql/conf.d \
-v /atguigu/mysql/mysql8/data:/var/lib/mysql \
-e MYSQL_ROOT_PASSWORD=123456 \
--name atguigu-mysql8 \
--restart=always \
mysql:8.0.29 --lower-case-table-names=1
```

### sql_mode

- **宽松模式：**
  执行错误的SQL或插入不规范的数据，也会被接受，并且不报错。

- **严格模式：**
  执行错误的SQL或插入不规范的数据，会报错。MySQL5.7版本开始就将sql_mode默认值设置为了严格模式。

- **查看和设置sql_mode**

  - **查询**

    ```sql
    SELECT @@session.sql_mode; 
    SELECT @@global.sql_mode; 
    -- 或者 
    SHOW VARIABLES LIKE 'sql_mode'; --session级别
    ```

  - **修改**

    1. 临时修改

    ```sql
    SET GLOBAL sql_mode = 'mode1,model2,...'; --全局，要重新启动客户端生效，重启MySQL服务后失效
    SET SESSION sql_mode = 'mode1,model2,...'; --当前会话生效效，关闭当前会话就不生效了。可以省略SESSION关键字
    ```

    2. 配置文件修改

    ```sql
    [mysqld]
    sql-mode = "mode1,model2,..."
    ```

  - **sql_mode常用值**

    ```sql
    1、STRICT_TRANS_TABLES：启用严格模式，要求插入或更新操作中的数据类型必须与表定义的数据类型完全匹配，否则会抛出错误。
    2、NO_ZERO_IN_DATE：禁止在日期中的月份和日字段使用零值，但'0000-00-00'是例外，否则会抛出错误。
    3、NO_ZERO_DATE：禁止在日期中的年、月、日字段使用零值，例如'0000-00-00'或'0000-00-00 00:00:00'，否则会抛出错误。
    4、ERROR_FOR_DIVISION_BY_ZERO：当除数为零时，执行除法运算会抛出错误。
    5、ONLY_FULL_GROUP_BY：要求GROUP BY子句中的列必须出现在SELECT列表中，或者是聚合函数的参数，否则会抛出错误。
    6、ANSI_QUOTES：启用ANSI_QUOTES模式，要求使用双引号来引用字符串，而不是单引号。
    除了上述常见的sql_mode值，还有其他一些选项可以根据需要进行配置。
    ```

## 逻辑架构[面试]

![](http://120.26.79.238:9000/orange-blog/articleImages/1/06e13c61c21738a780a701689e2c142b.png)


- **mysql客户端**

- **mysql服务器端**

  - **connection连接层**------------------>用户身份的认证和授权---维护`Connnection`连接池

    - 认证
    - connection连接池

  - **Service服务层**

    - 查询缓存(query_cache)

      缓存select查询语句和结果

    - 解析器(parser)

      负责对sql进行词法和语法解析

      词法解析：检查sgl语句中的关键字是否正确

      语法解析：把手写的SQL转换机读SQL，并生成SQL执行树

    - 预处理器(preprocessor)

      负责语义解析，并校验权限，生成新的SQL的执行树

    - 优化器(Optimize)

      在不改变查询结果的前提下，对SQL语句进行优化，
      比如：生成SQL执行计划，选择合适的索引，选择合适的驱动表,将子查询转化为连表查询,  选择开销最小的路径,  最终生成sql执行计划.

  - **Pluggable Storage Engine引擎层**

    引擎:	`Innodb`	`MyISAM	`	`MEMORY	`	`BlackHole`

    可插拔引擎层

    功能:	负责数据的具体查找，以及数据在磁盘和内存之间的交互

  - **存储层**

    功能:	负责数据在磁盘的组织形式

    日志信息:	`redolog`、`unolog`、`binarylog`、`slowlog`

### 查询的执行流程

![](http://120.26.79.238:9000/orange-blog/articleImages/1/fcd2df398cac24c7f59718c618d10129.png)

### 查看sql执行流程 profiling

- profiling

- 查看是否开启

  - `SHOW VARIABLES LIKE '%profiling%';`

- 开启profiling

  - `SET profiling = 1;  -- profiling = ON`
  - ` profiling = ON`     配置文件

- 查询

  - 显示最近的几次查询：`SHOW PROFILES;`

  - 查看最后一个SQL的执行流程：`SHOW PROFILE;`

  - 查看指定SQL的执行流程：查询指定的 Query ID:    `SHOW PROFILE FOR QUERY 3;`

  - 查询更丰富的内容:  ` SHOW PROFILE cpu,block io FOR QUERY 3;`

    - 参数

      - `ALL：`显示所有的开销信息。

      - `BLOCK IO`：显示块IO开销。
      - `CONTEXT SWITCHES`：上下文切换开销。
      - `CPU`：显示CPU开销信息。
      - `IPC`：显示发送和接收开销信息。
      - `MEMORY`：显示内存开销信息。
      - `PAGE FAULTS`：显示页面错误开销信息。
      - `SOURCE`：显示和Source_function，Source_file，Source_line相关的开销信息。
      - `SWAPS`：显示交换次数开销信息。

      

## 存储引擎

### 查看与设置引擎

- 查看存储引擎:	`show engines` 

  mysql 默认存储引擎:	`innoDB`

  查看每个表的存储引擎: `show table status from 库名;`

- 查看默认的存储引擎:  `SHOW VARIABLES LIKE '%default_storage_engine%';`

- 设置存储引擎

  - 设置默认存储引擎: 	`SET DEFAULT_STORAGE_ENGINE=MyISAM;` 	或配置文件:	`default-storage-engine=MyISAM`

  - 为表设置不同的存储引擎:   

    ```sql
    CREATE TABLE 表名( 建表语句 ) ENGINE = 存储引擎名称;
    ALTER TABLE 表名 ENGINE = 存储引擎名称;
    
    -- 例如：
    CREATE TABLE student(id INT, `name` VARCHAR(16),age INT,dept INT) ENGINE = MyISAM;
    ```

### 存储引擎介绍

`1. InnoDB存储引擎`

- InnoDB是MySQL的默认事务型引擎，它被设计用来`处理大量的短期(short-lived)事务`。可以确保事务的完整提交(Commit)和回滚(Rollback)。

- 除非有非常特别的原因需要使用其他的存储引擎，否则`应该优先考虑InnoDB引擎`。

- InnoDB不仅缓存索引还要缓存真实数据， 对内存要求较 高 ，而且内存大小对性能有决定性的影响。



`2. MyISAM存储引擎`

- MyISAM提供了大量的特性，包括全文索引、压缩、空间函数(GIS)等，但`MyISAM不支持事务和行级锁`，有一个毫无疑问的缺陷就是崩溃后无法安全恢复。

- 优势是访问的 速度快 ，对事务完整性没有要求或者以SELECT、INSERT为主的应用。

- MyISAM只缓存索引，不缓存真实数据。



`3. Archive引擎`

- `Archive档案存储引擎只支持INSERT和SELECT操作`。
- Archive表适合日志和数据采集（档案）类应用。
- 根据英文的测试结论来看，Archive表比MyISAM表要小大约75%，比支持事务处理的InnoDB表小大约83%。



`4. Blackhole引擎（黑洞）`

- `Blackhole引擎没有实现任何存储机制，它会丢弃所有插入的数据，不做任何保存`。
- 但服务器会记录Blackhole表的日志，所以可以用于复制数据到备库，或者简单地记录到日志。但这种应用方式会碰到很多问题，因此并不推荐。 



`5. CSV引擎` 

- `CSV引擎可以将普通的CSV文件作为MySQL的表来处理，但不支持索引`。
- CSV引擎可以作为一种数据交换的机制，非常有用。
- CSV存储的数据直接可以在操作系统里，用文本编辑器，或者excel读取。



`6. Memory引擎`

- 如果需要快速地访问数据，并且这些数据不会被修改，重启以后丢失也没有关系，那么使用Memory表是非常有用。
- Memory表至少比MyISAM表要快一个数量级。



`7. Federated引擎`

- `Federated引擎是访问其他MySQL服务器的一个代理（跨库关联查询）`，尽管该引擎看起来提供了一种很好的跨服务器的灵活性，但也经常带来问题，因此默认是禁用的。





### MyISAM和InnoDB的区别[常见面试题]

| 对比项                     | InnoDB                     | MyISAM                                 |
| -------------------------- | -------------------------- | -------------------------------------- |
| 是否支持事务               | 支持                       | 不支持                                 |
| 是否支持分布式事务(XA协议) | 支持                       | 不支持                                 |
| 是否支持行锁               | 支持                       | 不支持                                 |
| 是否支持表锁               | 支持                       | 支持                                   |
| 是否支持外键               | 支持                       | 不支持                                 |
| 增删改的性能               | 高                         | 低                                     |
| 读的性能                   | 低                         | 高                                     |
| 适用场景                   | 主机(写)                   | 从机(读)                               |
| 是否聚簇索引               | 支持                       | 不支持                                 |
| 是否支持MVCC               | 支持                       | 不支持                                 |
| 数据在磁盘的组织形式       | .ibd (index、data、表结构) | .MYI(索引)、.MYD(数据)、.sdi（表结构） |



```sql
1.每张表对应一个数据库引擎。
  show table status from 库名;
  
  create table 表名(..) engine=存储引擎名;
  alter table 表名 engine=存储引擎名;
  
  show engines;

2.如何查看某张表的数据库引擎？
   show table status from 数据库名;
   
3.如何修改一张表对应的数据库引擎
  alter table 表名  engine= '数据库引擎';
  
4.如何查看数据库及表存在磁盘的哪个目录？

```



## 连表

- 横行连接

  - `join`

  ```sql
  select *
  from 表1
  left|right|inner join
  on 条件
  where 过滤条件
  ```

  - `from`

  ```sql
  select
  from 表1,表2
  where 连接条件
  ```

- 纵向连接:

  要求:	属性个数一致,类型一致

  - **`UNION`**：去除重复的记录后再合并结果。

  - **`UNION ALL`**：保留所有记录，包括重复的。

  

## MySQL索引介绍

### 什么是索引

- 本质:	数据结构
- 理解: 	对每行数据建立索引, 维护一个二叉查找树,查找数据时根据索引查找.
- 存储:	磁盘中

### 索引优缺点

- 优点:
  - 提高了检索速度,降低数据库的IO成本
  - 通过索引对数据进行排序, 降低了排序成本,降低了CPU的消耗
- 缺点:
  - 在更新表时, 还要更新索引信息, 降低了更新速度,
  - 索引也是一张表,占用一定空间

### 索引分类

- 从功能逻辑上划分，索引主要有4种，分别是`普通索引`、`唯一索引`、`主键索引`、`全文索引`。
- 按照作用字段个数划分，索引可以分为`单列索引`和`联合索引`。
- 按照物理实现方式划分，索引可以分为2种，分别是`聚簇索引`和`非聚簇索引`



### B树

- `B-Tree即B树，Balance Tree，平衡树,B树就是典型的多叉树，它的高度远小于平衡二叉树的高度（多路平衡二叉树）`。
- `B树的阶：`节点的最多子节点个数。

![](http://120.26.79.238:9000/orange-blog/articleImages/1/b8e1bc0d38bda6a1ed246ef1734ac733.png)


### MySQL索引结构 B+树

- 理解:	
  - 叶子节点存储数据项, 每一个节点为一页
  - 非叶子节点存储目录页:    目录项的最大值和最小值,   目录页也可以存在目录页,每一页大小页为16kb.
  - 同一层之间存在互相 指向的指针
- InooDB一页:16kb

![](http://120.26.79.238:9000/orange-blog/articleImages/1/f86eb072b9b517624f45300da10e4a8b.png)


### B树和B+树区别



| 特性             | B树                            | B+树                             |
| ---------------- | ------------------------------ | -------------------------------- |
| **数据存储**     | 数据存储在内部节点和叶子节点中 | 数据仅存储在叶子节点             |
| **叶子节点链接** | 叶子节点之间没有链表连接       | 叶子节点通过指针形成双向链表链表 |
| **查找路径**     | 查找路径可以在内部节点结束     | 查找必须到达叶子节点             |
| **树的高度**     | 相对较高                       | 相对较低                         |
| **范围查询**     | 效率较低                       | 效率较高，顺序遍历方便           |
| **磁盘I/O效率**  | 较低，内部节点存储数据和索引   | 较高，内部节点只存储索引信息     |



### 聚簇索引

- 也叫主键索引

- **特点**:

  - 索引和数据保存在同一个B+树中.
  - `页内的记录`是按照`主键`的大小顺序排成一个`单向链表` 。(页内物理上是顺序排列的,只是逻辑上看起来像链表)
  - 页与页之间也是通过主键(索引)大小形成双向链表
  - 非叶子节点存储的是主键(索引)+页号
  - 叶子节点存储的是完整记录

- **优点**:

  - 完整数据和索引存储在同一个B+树中,不需要回表,比非聚簇索引查询快
  - 对于主键(聚簇索引)的排序查找和范围查找快
  - 按照聚簇索引查找一定范围数据时,由于数据之间形成链表,节省了IO操作,

- **缺点**:

  - 由于插入是按照主键(索引)进行插入,如果主键(索引)不按照顺序插入时,会导致页出现分裂,响应性能.  

    解决办法: 插入时控制主键自增且不更新主键.  (雪花算法)

  - 更新主键的代价很高 ，因为将会导致被更新的行移动。因此，对于InnoDB表，我们一般定义`主键为不可更新`。

- **限制：**

  - InnoDB支持聚簇索引, MyISAM不支持.
  - 由于数据的物理顺序排列只能有一种(页内),  而聚簇索引又决定了数据的顺序,所以,聚簇索引只能有一个
  - 如果没有为表定义主键，InnoDB会选择`非空的唯一索引列代替`。如果没有这样的列，InnoDB会`隐式的定义一个主键`作为聚簇索引。
  - 为了充分利用聚簇索引的聚簇特性，InnoDB中表的`主键应选择有序的id`，不建议使用无序的id，比如UUID、MD5、HASH、字符串作为主键，无法保证数据的顺序增长。

### 非聚簇索引

- 也叫二级索引	辅助索引

- **特点**:

  - 叶子节点存储的数据为 索引和主键,并不是完整的数据.

  - 查找非`覆盖索引`时需要回表

    `回表`: 因为非聚簇索引的叶子节点中不包含完整数据,只有索引和主键,因此,在通过非聚簇索引查找到主键之后,InnoDB需要通过主键查找聚簇索引来获取完整的数据.(MyISAM的非聚簇索引中存储的数据为索引和数据的地址值,在查找之后,也需要通过地址值拿到完整的数据)

  - 索引非主键

  - 可以有多个非聚簇索引

- **问题**:

  - 为什么非聚簇索引不存储完整数据呢?

    答: 非聚簇索引不影响数据的物理顺序,所以可以有多个,如果每个非聚簇索引都存储完整数据,占用的空间就非常大.

#### 聚簇索引 vs 非聚簇索引：对比总结

| 特性         | 聚簇索引                         | 非聚簇索引                                |
| ------------ | -------------------------------- | ----------------------------------------- |
| **数据存储** | 数据和索引一起存储               | 数据和索引分开存储                        |
| **索引结构** | 叶子节点存储数据                 | 叶子节点存储指向数据的指针(Row id 或主键) |
| **数据顺序** | 数据按索引顺序物理存储           | 数据的物理顺序与索引无关                  |
| **索引数量** | 一个表只能有一个聚簇索引         | 一个表可以有多个非聚簇索引                |
| **查询效率** | 直接读取数据，效率较高           | 需要先找到指针，再查找数据，效率较低      |
| **范围查询** | 高效                             | 效率相对较低                              |
| **占用空间** | 占用较少，因为数据与索引合并存储 | 占用较大，需要额外的指针存储空间          |
| **更新插入** | 可能导致页分裂或重排，影响较大   | 对数据插入影响较小                        |
| **应用场景** | 适合主键或范围查询               | 适合优化特定列的查询                      |



### 联合索引

- 组成索引的有多个字段,

- 本质上也是二级索引

- **叶子节点**：对于非聚簇索引（联合索引），叶子节点存储的是**索引字段的值**和指向实际数据行的**主键值**（InnoDB）或**指针**（MyISAM）。

- 非叶子节点存储的是**部分索引字段的值**以及指向下一级节点的**指针**（页号或页地址）。

  - 先按照第一个字段排,如果一样,则根据第二个.

  非叶子节点通常只存储部分索引字段的值，不需要存储完整的联合索引字段，它的目的是帮助快速定位叶子节点。

### 覆盖索引

当一个索引包含了查询所需的所有列时，这个索引就称为**覆盖索引**。换句话说，如果查询的**SELECT**、**WHERE**、**GROUP BY**、**ORDER BY**语句中涉及的所有字段都在某个索引中，数据库可以只通过索引完成查询，而不需要再去表中读取数据行。

### MyISAM中的索引

- MyISAM引擎使用 B+Tree 作为索引结构，`叶子节点的data域存放的是数据记录的地址` 。 

- 下图是MyISAM索引的原理图`（索引和数据分开存储，是非聚簇索引）`： 

![](http://120.26.79.238:9000/orange-blog/articleImages/1/fa7f538a4e9af7de236026f810baa4b2.png)

### MyISAM与InnoDB对比

- InnoDB的数据文件本身就是索引文件，而MyISAM索引文件和数据文件是分离的：
  - InnoDB的表在磁盘上存储在以下文件中： `.ibd（表结构、索引和数据都存在一起,MySQL5.7表结构放在.frm中）`
  - MyISAM的表在磁盘上存储在以下文件中：  `*.sdi（描述表结构，MySQL5.7是.frm）`、`*.MYD（数据）`，`*.MYI（索引）`

- InnoDB中主键索引是聚簇索引，叶子节点中存储完整的数据记录；其他索引是非聚簇索引，存储相应记录主键的值 。
- InnoDB要求表必须有主键 （ MyISAM可以没有 ）。如果没有显式指定，则MySQL系统会自动选择一个可以`非空且唯一`标识数据记录的列作为主键。如果不存在这种列，则MySQL自动为InnoDB表生成一个隐含字段作为主键。
- MyISAM中无论是主键索引还是非主键索引都是非聚簇的，叶子节点记录的是数据的地址。

- `MyISAM的回表操作是十分快速的`，因为是拿着地址偏移量直接到文件中取数据的，反观InnoDB是通过获取主键之后再去聚簇索引里找记录，虽然说也不慢，但还是比不上直接用地址去访问。

### 索引操作

- **创建**

  

  创建表时:

  ```SQL
  creat table customer(
  	id int auto_increment,
      customer_no varchar(255),
      customer_name varchar(255),
      
      primary key(id),
      unique index uk_no(customer_no)
      key idx_customer_name(cusomer_name); //如果不指定名称,与名明一致
      key idx_customer_no_name(cusomer_no,customer_name)
  )
  ```

  - 创建表时指定主键,	自动创建主键索引  `primay key`
  - `unique index uk_no(customer_no)` --- 唯一索引( 当**有主键索引**时,为**非聚簇索引**,**没有主键索引**时 ,为**聚簇索引**)
  - `Key idx_name (customer_name)`   --- 普通索引
  - `key idx_name_no(,customer_name,customer_no)`  --- 二级索引

  

  > 唯一索引:
  >
  > **唯一索引**在 MySQL 的 **InnoDB** 引擎中仍然**可以包含 `NULL` 值**
  >
  > **没有主键时的聚簇索引**：
  >
  > - 如果表没有主键，但有一个唯一索引，InnoDB 会选择该唯一索引作为聚簇索引。虽然唯一索引允许多个 `NULL` 值，但如果该唯一索引被选为聚簇索引，InnoDB 会要求该索引列中所有值必须是唯一且**不能为 `NULL`**。

  创建表后:

  `creat`:

  - `create index 索引名 on 表名(colum_name_list)`
  - `create unique index 索引名 on 表名(colum_name_list)`

  `alter`:

  - `alter table customer add index idx_cusomer_name(cusomer_name)`
  - `alter table customer add unique idx_cusomer_name(cusomer_name)`
  - `alter table customer add primary key(cusomer_name)`
  - `alter table customer add index idx_cusomer_name_no(cusomer_name,cusomer_no)`

  

- **查看**

  - `show index from 表名`



- **删除**

  > 注意: 删除主键索引  ,当主键有自增时, 不能删除, 必须去掉自增 (自增的必须为主键)

  - `alter table customer drop index` 普通索引 | 唯一索引
  - `alter table customer drop primary key`;

  

  -  `drop index 索引名 on 表名`  不能删除主键索引

- **总结**:

  | **操作类型** | **操作**                         | **SQL 语句**                                                 | **备注**                             |
  | ------------ | -------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
  | **创建索引** | 创建主键索引                     | `PRIMARY KEY (id)`                                           | 创建表时自动创建，且为聚簇索引       |
  |              | 创建唯一索引                     | `UNIQUE INDEX uk_no (customer_no)`                           | 唯一索引，若无主键时可能作为聚簇索引 |
  |              | 创建普通索引                     | `KEY idx_customer_name (customer_name)`                      | 普通索引                             |
  |              | 创建复合索引                     | `KEY idx_customer_no_name (customer_no, customer_name)`      | 复合索引，二级索引                   |
  |              | 使用 `CREATE INDEX` 创建普通索引 | `CREATE INDEX idx_customer_name ON customer (customer_name)` | 创建后可以通过 `SHOW INDEX` 查看     |
  |              | 使用 `CREATE INDEX` 创建唯一索引 | `CREATE UNIQUE INDEX idx_customer_name ON customer (customer_name)` | 唯一索引允许 `NULL` 值               |
  |              | 使用 `ALTER TABLE` 添加普通索引  | `ALTER TABLE customer ADD INDEX idx_customer_name (customer_name)` | 使用 `ALTER TABLE` 添加索引          |
  |              | 使用 `ALTER TABLE` 添加唯一索引  | `ALTER TABLE customer ADD UNIQUE idx_customer_name (customer_name)` | 添加唯一索引                         |
  |              | 使用 `ALTER TABLE` 添加主键索引  | `ALTER TABLE customer ADD PRIMARY KEY (customer_name)`       | 添加主键索引                         |
  |              | 使用 `ALTER TABLE` 添加复合索引  | `ALTER TABLE customer ADD INDEX idx_customer_name_no (customer_name, customer_no)` | 复合索引                             |
  | **查看索引** | 查看表的所有索引                 | `SHOW INDEX FROM customer`                                   | 查看表 `customer` 中的所有索引信息   |
  | **删除索引** | 删除普通索引或唯一索引           | `ALTER TABLE customer DROP INDEX idx_customer_name`          | 删除普通索引或唯一索引               |
  |              | 删除主键索引                     | `ALTER TABLE customer DROP PRIMARY KEY`                      | 如果主键有自增属性，需要先去掉自增   |
  |              | 删除索引                         | `DROP INDEX 索引名 ON 表名`                                  | 不能删除主键索引                     |

### 索引使用场景 :

**适合使用索引的清空**:

- 频繁作为where条件的字段
- 经常group by 和 order by的列
- 有唯一性的限制的列
- 多表join ,对连接字段创建索引
- 使用频繁的
- 区分度高的
- 使用字符串前缀创建索引(节省空间) : 前缀索引
  - `alter table 表名 add index idx_d(address(20))` 以前20字符作为索引

**不适合创建索引的情况:**

- `where`  ` group by`   `order by`  里面用不到的
- 表的数据**记录太少**
- 有大量重复数据的列  (**区分度不高**)
- 经常增删改的表(**查询少** , **增删改 多**)
- 不用定义冗余或重复的索引 (已经创建过的)

## 索引优化

### 数据库优化

- 索引失效:  索引建立
- 关联查询太多JOIN（设计缺陷或不得已的需求）：`SQL优化`
- 数据过多500W，2GB：分库分表

- 服务器调优及各个参数设置（缓冲、线程数等）：调整my.cnf

### 性能分析(EXPLAN)

- explain : 使用EXPLAIN关键字可以`模拟优化器执行SQL查询语句`，从而知道MySQL是如何处理你的SQL语句的。`分析你的查询语句或是表结构的性能瓶颈`。
- 用发:` EXPLAIN + SQL语句`

#### explain 各字段解释

##### **id: **

- 在一个完整的查询语句中，每个SELECT关键字，都对应一个唯一的id。同时通过id也可以知道操作表的顺序。

- id 一样:

  对于涉及子查询的,  查询优化器可能对子查询进行优化,**转为连接查询**,变为一个select

- id为null:

  当对两张表进行  union  合并时, 会生成一张**临时表**,然后去重

  对于union all 因为不会生成临时表,就不会有这个null 的id

- 执行的顺序:

  - id如果相同，可以认为是一组，`从上往下顺序执行`
  - 在所有组中，`id值越大，越先执行`
  - 关注点：每个id号码，表示一趟独立的查询, `一个sql的查询趟数越少越好`

##### **table:**

- 意义:

  显示这一行的数据是关于哪张表的

- 驱动表:

  在**多表联查**中,若id相同,则在前面的为**驱动表(**驱动表一般会进行**全表查询或全索引**)

##### **type:**

- 结果值从最好到最坏依次是:

  `system > const > eq_ref > ref` > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > `range > index > ALL` 

- 比较重要的是:``system > const > eq_ref > ref > range > index > ALL`

- SQL 性能优化的目标：至少要达到 `range` 级别，要求是 `ref` 级别，最好是 `const`级别。（阿里巴巴开发手册要求）

- 结果值:

  - **ALL: **全表扫描 
  - **index:**全索引扫描。当使用`覆盖索引`，但需要扫描`全部的索引记录`时
  - **range：**只检索给定范围的行，使用一个索引来选择行。key 列显示使用了哪个索引，一般就是在你的where语句中出现了between、<、>、in等的查询。这种范围扫描索引扫描比全表扫描要好，因为它只需要开始于索引的某一点，而结束于另一点，不用扫描全部索引。
  - **ref：**通过普通二级索引列与常量进行等值匹配时
  - **eq_ref：**连接查询时通过`主键`或不允许NULL值的`唯一二级索引`列进行等值匹配时 **?** 数据量级，可能会影响索引的使用！ mysql 内部的优化器！
  - **const：**根据`主键`或者`唯一二级索引`列与`常数`进行匹配时
  - **system：**MyISAM引擎中，当表中只有一条记录时。`（这是所有type的值中性能最高的场景）`

##### **possible_keys 和 key**

- `possible_keys`表示执行查询时`可能用到的索引`，一个或多个。 查询涉及到的字段上若存在索引，则该索引将被列出，但不一定被查询实际使用。
- `keys`表示`实际使用的索引`。如果为NULL，则没有使用索引。

##### key_len

表示索引使用的字节数，根据这个值可以判断索引的使用情况，`检查是否充分利用了索引，针对联合索引值越大越好。`

- 如何计算

1. 先看索引上字段的类型+长度。比如：int=4 ; varchar(20) =20 ; char(20) =20 
2. 如果是varchar或者char这种字符串字段，视字符集要乘不同的值，比如utf8要乘 3(MySQL5.7)，如果是utf8mb4要乘4，GBK要乘2
3. varchar这种动态字符串要加2个字节
4. 允许为空的字段要加1个字节 

##### ref

显示与key中的索引进行比较的列或常量。

- **const：**  与索引列进行等值比较的东西是啥，const表示一个常数
- **ref=atguigudb.t1.id**   另外一个表的列

##### rows 

- MySQL认为它执行查询时实际从索引树中查找到的行数。`值越小越好。`

##### filtered

- 最后查询出来的数据占所有服务器端（server）检查行数（rows）的`百分比`。`值越大越好`。

例如上一个例子。

##### Extra 

包含不适合在其他列中显示但十分重要的额外信息。通过这些额外信息来`理解MySQL到底将如何执行当前的查询语句`。MySQL提供的额外信息有好几十个，这里只挑比较重要的介绍。

- **Using where：**使用了where，但在where上有字段没有创建索引。也可以理解为如果数据从引擎层被返回到server层进行过滤，那么就是Using where。
- **Using filesort：**如果出现了Using filesort 说明排序没有使用上索引
- **Using index：**`使用了覆盖索引`，表示直接访问索引就足够获取到所需要的数据，不需要通过索引回表
- **Using index condition：**叫作  `Index Condition Pushdown Optimization （索引下推优化）`
  - `如果没有索引下推（ICP）`，那么MySQL在存储引擎层找到满足`content1 > 'z'`条件的第一条二级索引记录。`主键值进行回表`，返回完整的记录给server层，server层再判断其他的搜索条件是否成立。如果成立则保留该记录，否则跳过该记录，然后向存储引擎层要下一条记录。
  - `如果使用了索引下推（ICP）`，那么MySQL在存储引擎层找到满足`content1 > 'z'`条件的第一条二级索引记录。`不着急执行回表`，而是在这条记录上先判断一下所有关于`idx_content1`索引中包含的条件是否成立，也就是`content1 > 'z' AND content1 LIKE '%a'`是否成立。如果这些条件不成立，则直接跳过该二级索引记录，去找下一条二级索引记录；如果这些条件成立，则执行回表操作，返回完整的记录给server层。
- **Using join buffer：**在连接查询时，当`被驱动表（t2）不能有效的利用索引时`，MySQL会提前申请一块内存空间（join buffer）存储驱动表的数据，来加快查询速度

### 单表索引失效

#### 1. 计算  函数导致索引失效

在函数中使用索引,  索引不会生效

```sql
-- 显示查询分析
EXPLAIN SELECT * FROM emp WHERE LEFT(emp.name,3) = 'abc'; --索引失效
```



#### 2. like以%开头索引失效

> 【强制】页面搜索严禁左模糊或者全模糊，如果需要请走搜索引擎来解决。 电商中全文检索es 不应该mysql

在使用模糊查找时,如果以%开头,索引失效

```sql
EXPLAIN SELECT * FROM emp WHERE name LIKE '%ab%'; --索引失效
```



#### 3. 不等于(!= 或者<>)索引失效

否定开头,导致索引失效

```sql
  !=  ||   <>
```

#### 4. IS NOT NULL 和 IS NULL

```sql
EXPLAIN SELECT * FROM emp WHERE emp.name IS NULL;
EXPLAIN SELECT * FROM emp WHERE emp.name IS NOT NULL; --索引失效
```

**注意：**当数据库中的数据的索引列的`NULL值达到比较高的比例的时候`，即使在IS NOT NULL 的情况下 MySQL的查询优化器会选择使用索引，`此时type的值是range（范围查询）`

#### 5. 类型转换导致索引失效

```sql
EXPLAIN SELECT * FROM emp WHERE name='123'; 
EXPLAIN SELECT * FROM emp WHERE name= 123; --索引失效
```

#### 6. 全值匹配我最爱

**准备：**

```sql
-- 首先删除之前创建的索引
CALL proc_drop_index("atguigudb","emp");
drop index idx_name on emp;
```

**问题：**为以下查询语句创建哪种索引效率最高

```sql
-- 查询分析
EXPLAIN SELECT * FROM emp WHERE emp.age = 30 and deptid = 4 AND emp.name = 'abcd';
-- 执行SQL
SELECT * FROM emp WHERE emp.age = 30 and deptid = 4 AND emp.name = 'abcd';
-- 查看执行时间
SHOW PROFILES;
```

**创建索引并重新执行以上测试：**

```sql
-- 创建索引：分别创建以下三种索引的一种，并分别进行以上查询分析
CREATE INDEX idx_age ON emp(age);
CREATE INDEX idx_age_deptid ON emp(age,deptid);
CREATE INDEX idx_age_deptid_name ON emp(age,deptid,`name`);
```

**结论：**可以发现最高效的查询应用了联合索引 `idx_age_deptid_name` 

#### 7. 最佳左前缀法则

- 如果索引了多列，要遵守最左前缀法则。即查询从`索引的最左前列`开始并且不跳过索引中的列。
- 过滤条件要使用索引，必须按照`索引建立时的顺序，依次满足`，一旦跳过某个字段，索引后面的字段都无法被使用。

#### 8.索引中范围条件右边的列失效 

- 场景:
  - 有三个索引    a,b,c,当进行查询时,b索引使用了范围条件,  那么查询中就算使用了c索引,还是会失效
  - 解决: 定义索引时,将需要范围判断的 放在最后,例如,定义索引: a,c,b

### 关联查询优化

**左连接:**

针对两张表的连接条件涉及的列，索引要创建在被驱动表上，驱动表尽量是小表

- 如果驱动表上没有where过滤条件
  - 当驱动表的连接条件没有索引时，驱动表是全表扫描
  - 当针对驱动表的连接条件建立索引时，驱动表依然要进行全索引扫描
  - 因此，此时建立在驱动表上的连接条件上的索引是没有太大意义的
- 如果驱动表上有where过滤条件，那么针对过滤条件创建的索引是有必要的

**内连接:**

在内连接中, 两表都可以做主表

发现即使交换表的位置，MySQL优化器也会自动选择驱动表，自动选择驱动表的原则是：索引创建在被驱动表上，驱动表是小表。



总结

- 上来就给连表字段创建索引
- 优化器在选择驱动表和被驱动表的时候，是优先根据索引确定，再跟据数据量
- 能连表的就直接连表查询，尽量不要使用子查询。



### 子查询优化

尽量不要使用NOT IN 或者 NOT EXISTS，用LEFT JOIN xxx ON xx = xx WHERE xx IS NULL替代

### 排序优化

#### 索引失效

- 无过滤,不索引  

  没有过滤limit或where 条件判断,索引失效

- 顺序错,不索引 ,  

  定义索引顺序与使用索引顺序不一致

- 反向反,不索引 , 

  不同字段排序,一个升序,一个降序

优化思路: 

 尽量让where的过滤条件和排序使用上索引



#### 双路排序和单路排序

如果排序没有使用索引，引起了filesort（手工排序），那么filesort有两种算法

- 双路排序:两次IO
- 单路排序:一次IO

**双路排序（慢）**

`MySQL 4.1之前是使用双路排序，`字面意思就是`两次扫描磁盘`，最终得到数据。

- 首先，根据行指针`从磁盘`取`排序字段,主键`，在buffer进行排序。

- 再按照排序字段的顺序`从磁盘`取`其他字段`。

`取一批数据，要对磁盘进行两次扫描。`众所周知，IO是很耗时的，所以在mysql4.1之后，出现了第二种改进的算法，就是单路排序。



**单路排序（快）**

- 从磁盘读取查询需要的`所有字段`，按照order by列在buffer对它们进行排序。

- 然后扫描排序后的列表进行输出。

它的效率更快一些，因为`只读取一次磁盘`，避免了第二次读取数据。`并且把随机IO变成了顺序IO`。但是它会`使用更多的空间`， 因为它把每一行都保存在内存中了。



**结论及引申出的问题**

- 单路比多路要多占用更多内存空间
- 因为单路是把所有字段都取出，所以有可能取出的数据的总大小超出了`sort_buffer_size`的容量，导致每次只能取`sort_buffer_size`容量大小的数据，进行排序（创建tmp文件，多路合并），排完再取sort_buffer容量大小，再排……从而多次I/O。
- `单路本来想省一次I/O操作，反而导致了大量的I/O操作，反而得不偿失。`

**优化策略**

- `减少select 后面的查询的字段：`Order by时`select * 是一个大忌`。查询字段过多会占用sort_buffer_size的容量。

- `增大sort_buffer_size参数的设置：`当然，要根据系统的能力去提高，因为这个参数是针对每个进程（connection）的 1M-8M之间调整。 MySQL8.0，InnoDB存储引擎默认值是1048576字节，1MB。

- `增大max_length_for_sort_data参数的设置：`MySQL根据max_length_for_sort_data变量来确定使用哪种算法，默认值是4096字节，如果需要返回的列的总长度大于max_length_for_sort_data，使用双路排序算法，否则使用单路排序算法。但是如果设的太高，数据总容量超出sort_buffer_size的概率就增大，明显症状是高的磁盘I/O活动和低的处理器使用率。1024-8192之间调整。

### 分组优化

- `group by 使用索引的原则几乎跟order by一致`。但是group by 即使没有过滤条件用到索引，也可以直接使用索引（Order By 必须有过滤条件才能使用上索引）
- 包含了order by、group by、distinct这些查询的语句，where条件过滤出来的结果集请保持在1000行以内，否则SQL会很慢。

#### 覆盖索引优化

- 禁止使用select *，禁止查询与业务无关字段
- 尽量利用覆盖索引

#### 优化口诀

全值匹配我最爱，最左前缀要遵守；
带头大哥不能死，中间兄弟不能断；
索引列上少计算，范围之后全失效；
like百分写最右，覆盖索引不写*；

不等空值还有or，索引失效要少用；
var引号不能丢，sql高级也不难；



## 慢查询日志

- **介绍:** 一种日志, 记录有哪些sql执行超出了阈值.

- **开启慢查询日志**

  默认情况下数据库没有开启 慢查询日志. 

  慢查询日志对性能有一定影响

  - 开启慢查询日志:  

    ```sql
    SET GLOBAL slow_query_log=1; 
    ```

  - 配置文件设置

    ```properties
    slow_query_log=1
    slow_query_log_file=slow-query.log
    long-query_time=0.1#慢查询日志的时间定义（秒），默认为10秒，多久就算慢查询的日志
    log_queries_not_using_indexes=1#将所有没有使用带索引的查询语句全部写到慢查询日志中
    ```

    

  - 查询是否开启,以及日志位置:

    ```sql
    SHOW VARIABLES LIKE '%slow_query_log%'; 
    ```

- **修改阈值**

  - 默认阈值为10秒

  ```sql
  SHOW VARIABLES LIKE '%long_query_time%'; -- 查看值：默认10秒
  SET GLOBAL long_query_time=0.1; -- 设置一个比较短的时间，便于测试
  ```

  ​	**注意：**

  - **需要重新登录客户端**使上面的设置生效
  - 假如运行时间正好等于long_query_time的情况，并不会被记录下来。
  - 也就是说，在mysql源码里是判断大于long_query_time，而非大于等于。

- **查询慢查询日志数:**

  ```sql
  SHOW GLOBAL STATUS LIKE '%Slow_queries%'; 
  ```

  存储路径: `vim /var/lib/mysql/atguigu-slow.log`

### 日志分析工具(mysqldumpslow)

在生产环境中，如果要手工分析日志，查找、分析SQL，显然是个体力活，MySQL提供了日志分析工具mysqldumpslow。退出mysql命令行，执行以下命令：

```sql
-- 查看mysqldumpslow的帮助信息
mysqldumpslow --help

-- 工作常用参考
-- 1.得到返回记录集最多的10个SQL
mysqldumpslow -s r -t 10 /var/lib/mysql/atguigu-slow.log
-- 2.得到访问次数最多的10个SQL
mysqldumpslow -s c -t 10 /var/lib/mysql/atguigu-slow.log
-- 3.得到按照时间排序的前10条里面含有左连接的查询语句
mysqldumpslow -s t -t 10 -g "left join" /var/lib/mysql/atguigu-slow.log
-- 4.另外建议在使用这些命令时结合 | 和more 使用 ，否则语句过多有可能出现爆屏情况
mysqldumpslow -s r -t 10 /var/lib/mysql/atguigu-slow.log | more
```

- -a: 不将数字抽象成N，字符串抽象成S

- -s: 是表示按照何种方式排序；
  - c: sql语句的访问次数
  - l: 锁定时间
  - r: 返回数据记录集的总数量
  - t: 查询时间

  - al:平均锁定时间
  - ar:平均返回记录数
  - at:平均查询时间

- -t: 即为返回前面多少条的数据；

- -g: 后边搭配一个正则匹配模式，大小写不敏感的；





## 视图

- **介绍:**

  视图是建立在表之上的伪表，视图本身**不存储数据**，视图中的数据都是视图底层表中的数据,**存储的是sql逻辑**。

- **作用:**

  - 保证数据的安全
  - 存储复杂的业务逻辑

- **使用场景:**

  - 共用查询结果
  - 报表
  - 复杂sql使用

- **语法:**

  ```sql
  视图的语法：
  视图的创建：
  create [or replace] view 视图名  as select查询语句!
   
  create table t5 as select * from t1;
    
  视图的修改：
  update 视图名 set 列名=列值,列名=列值 where 条件
    
  视图删除：
  delete from 视图名 where 条件
      
  视图的查询：
  select 列名 from 视图名 where 条件
  ```

  

#### 创建

```sql
-- 语法
CREATE VIEW view_name 
AS SELECT column_name(s) FROM table_name WHERE condition;

-- 例如：求所有人物对应的掌门名称
CREATE VIEW v_ceo AS

SELECT emp.name, ceo.name AS ceoname 
FROM t_emp emp
LEFT JOIN t_dept dept ON emp.deptid = dept.id 
LEFT JOIN t_emp ceo ON dept.ceo = ceo.id;
```

#### 使用

**查询**

```sql
-- 语法
SELECT * FROM view_name; 

-- 例如：
SELECT * FROM v_ceo; 
```

**更新**

```sql
-- 语法
CREATE OR REPLACE VIEW view_name 
AS SELECT column_name(s) FROM table_name WHERE condition

-- 建议直接删除重新创建
```

**删除**

```sql
DROP VIEW view_name;

-- 例如：
DROP VIEW v_ceo;
```

> 注意: 修改 视图的信息 ,源表的信息也会变,  修改源表,视图的也会更新.







## MVCC (略讲)

-  *MVCC*，是Multiversion Concurrency Control的缩写，翻译过来是多版本并发控制，他也是一种并发控制的解决方案。

-  在数据的并发场景中:  MVCC是用来解决**读-写并发**的
-  **只工作在可重复读和读已提交场景下**

   - 读-读并发

   - 写-写并发: 锁（悲观锁+乐观锁）

   - 读-写并发: MVCC

### 快照读和当前读

#### 当前读

- 读取的是记录的最新数据(不是历史版本)
- 要保证其他并发事务不能修改当前记录,所以**会对当前记录加锁**.

- 所以当前读就是**加锁的读操作**

- 加锁的select 或者对数据进行增删改都会进行当前读

```sql
SELECT * FROM xx_table LOCK IN SHARE MODE;  # 共享锁
SELECT * FROM xx_table FOR UPDATE;			# 排它锁

INSERT INTO xx_table ...					# 排它锁
DELETE FROM xx_table ...					# 排它锁
UPDATE xx_table ...							# 排它锁
```



#### 快照读

- **不加锁的简单的 SELECT 都属于快照读**，即不加锁的非阻塞

- **场景:**

  基于提高并发性能的考虑,  快照读是基于MVCC,  在很多情况下,避免了加锁, 减低了开销

  多版本，那么**快照读可能读到的并不一定是数据的最新版本，而有可能是之前的历史版本**。 快照读的前提是隔离级别不是串行级别，串行级别下的快照读会退化成当前读。

#### MVCC读取分析[读已提交、可重复读]

![](http://120.26.79.238:9000/orange-blog/articleImages/1/d424fd65c0ac5134a531e1262e41084e.png)

1. 在**读已提交**的隔离级别下: select 名称 查找的都是最新的数据,此时如果有新事务更新数据且提交,  在此期间的 select 读取到的同一条数据可能不同
2. 在**可重复读**隔离级别下: 当第一次提交select 之后, MVCC会生成一个当前查找的快照, 当再次select 时,会返回这个快照, 无论是否有其他事务提交, 此时在同一个事务下的两次select的数据一定一样,但不一定是最新数据.

**注意**：

1.在读已提交（Read Committed:简称RC）隔离级别下,一个事务中的每一次 SELECT 查询都会重新获取一次 Read View【读视图】。

![](http://120.26.79.238:9000/orange-blog/articleImages/1/c8a74c4f4bfc4df90c8824e53ed81947.png)


2.在可重复读（Repeatable Read:简称RR）隔离级别下,一个事务中只在第一次 SELECT 的时候会 获取一次 Read View，而后面所有的 SELECT 

都会复用这个 Read View。

![](http://120.26.79.238:9000/orange-blog/articleImages/1/a46d3d6e688932d2ed0608386e4b54b4.png)


#### 无索引索引失效情况

- 当对InnoDB引擎下的表进行更新,  如果 索引失效, 此时 就不会加 行锁,而是 加表锁 .

### 各种日志说明

1.慢查询日志（Slow Query Log）：记录执行时间超过指定阈值的查询语句。慢查询日志可以帮助你找出执行时间较长的查询，以便进行性能优化。

2.二进制日志（Binary Log）：记录所有对数据库的更改操作，包括数据修改、表结构变更等。二进制日志可以用于数据恢复、主从复制等场景。

  relay log: 中继日志

3.事务日志：

 也称为重做日志（Redo Log）,保证事务的持久性：记录正在进行的事务的更改操作。事务日志用于保证数据库的ACID特性，并支持崩溃恢复。



ACID: 原子性  一致性  隔离性  持久性

undo log：保证事务的原子性 和 一致性 

隔离性：

MVCC:undo log+ReadView(视图快照)