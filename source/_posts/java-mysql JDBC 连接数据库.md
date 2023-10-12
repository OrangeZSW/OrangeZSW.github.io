---
title: java-mysql JDBC 连接数据库
date: 2022-9-30 00:16:34
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/java-mysql.png
---

# java-mysql JDBC 连接数据库

前言:

因为数据库课程设计需要连接数据库，我唯一接触过的就是 jdbc, 也不知道还有没有其他方法，再加上我们实验课接触过 jdbc, 最后课程设计做完了，就想着把方法记下来.

# 连接前准备:

1. 安装 [mysql](https://www.mysql.com/downloads/),mysql 安装教程网上有很多，对着教程一步步就能安装下来，记住自己设置的密码，不然连不上数据库.

2. 下载 java 连接 mysql 的数据包 [jar](https://dev.mysql.com/downloads/connector/j/)

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664538641591.png)

## 导入 jar 数据包

注意！jar 包不能随便移动，我是直接把 jar 包放在了 IDEA 的根目录下面的 lib 里面.

1. 这里以 IDEA 为例，打开 IDEA. 打开项目结构 (theProjectStructure 使用的插件翻译，不知道准不准，下面一样)

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664539063792.png)

2. 找到模块 (theModule), 选择想要连接数据库的项目，然后点击依赖 (relyOn), 最后点击加号.

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664539710423.png)

3. 选择第一个 JAR 或目录

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664539813085.png)

4. 最后找到你放 jar 的位置，导入就行了。到此为止 jar 包就导入成功了.

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664539925809.png)

## 连接数据库

注意，这一步我也是跟着菜鸟教程做的。理解不深，可能说不清楚.

1. 首先，实例化这三个对象。根据我的理解，第一个 (Connection) 就是用来连接数据库的，第二个 (Statement) 是连接数据库之后，想要运行 mysql 语句用的，最后一个 (Resultset) 就是用来得到或更新你的 mysql 语句的结果.(可以先不用写这一步，你用到再写应该也行)

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664540196391.png)

user 就是你数据库的用户名，默认的就是 root.

password 是你数据的密码，前面安装 mysql 的时候设置的.

driver 就是驱动的名字，这个是固定的.

url 是你想要连接的数据库，就是那个框里面的。填你的数据库名字，其他的都是一些属性什么的，非必要应该不用改.

Calss.forNmae 是注册驱动，就是上面的 driver.

最后一步就是连接数据库，conn 是第一步实例化的 (Connetion) 对象.

很好，这样就成功连接了数据库.

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664540663146.png)

注意：数据库的语句操作都必须放在 try {catch (){}} 中，如下

```java
try{
    conn = DriverManager.getConnection(url, user, password);
    catch(Exception e){
        System.out.print(e);
    }
}

```

## 基本的数据库操作



1.select

```java
stmt = conn.createStatement();
String sql="select * from tablename;";
rs= stmt.executeQuery(sql);
// 这样rs就得到了数据
// 根据表中得字段名来输出数据（还可以得到这个语句返回得结果个数来输出，因为我不会，所以就不写了）
while(rs.next()){
        int id = rs.getInt("id");
        String name = rs.getString("name");
        String gender = rs.getString("gender");
        System.out.println("id:"+id+" 姓名："+name+" 性别："+gender);
    }
```

具体实现:

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/java-mysql/1664541517504.png)

2. insert:

```java
// 前两步与select相同
try{
    stmt = conn.createStatement();
    String sql="insert into tablename (字段名1,字段名2,...) values ("张三","男",..."");";
    stmt.executeUpdate(sql); //就这一步变了
    catch(){
    }
}
//记住一定要在try{catch(){}}里面写mysql代码，不然会报错。

```

