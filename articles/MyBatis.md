---
title: MyBatis
date: 2025-09-16
categories: 技术
tags: 
cover: 
---




# MyBatis

## 设置类型别名:

```xml
<typeAliases>
    <!--默认为别名为类名（不区分大小写-->
	<typeAlias type="online.zorange.entity.User" alias="aaa"></typeAlias>  
    
    
    <!--通过包来设置别名-->
    <package name="online.zorange.entity"></package>
</typeAliases>
```

### 默认类型别名

| 别名       | 映射的类型 |
| :--------- | :--------- |
| _byte      | byte       |
| _long      | long       |
| _short     | short      |
| _int       | int        |
| _integer   | int        |
| _double    | double     |
| _float     | float      |
| _boolean   | boolean    |
| string     | String     |
| byte       | Byte       |
| long       | Long       |
| short      | Short      |
| int        | Integer    |
| integer    | Integer    |
| double     | Double     |
| float      | Float      |
| boolean    | Boolean    |
| date       | Date       |
| decimal    | BigDecimal |
| bigdecimal | BigDecimal |
| object     | Object     |
| map        | Map        |
| hashmap    | HashMap    |
| list       | List       |
| arraylist  | ArrayList  |
| collection | Collection |
| iterator   | Iterator   |

## sql参数赋值

1. #{}   : ？占位符,	会自动添加单引号
2. ${}   :  字符串拼接        不会自动添加  

### 单个简单参数

在#{}中可以任意填入参数。不必与参数名相同。

在${}中也可以任意填入，但是如果要加单引号，这种方法要手动加

```java
public void findByName(String username);
```

```xml
<select id="findByName" resultType="online.zorange.entity">
  select * from user where username= #{username}
</select>
```

### 复杂类型参数

#### 多个参数传入

将User放入Map集合,通过key获取.

将key设置为arg1, arg0...., param1, param2....为键添加到Map集合中.

```java
public User login(String usrame, String password);
```

```xml
<select id="login" resultType="User">
	select * from user where username=#{param0|arg0} and password=#{param1|arg1}
</select>
```

#### 以Map集合传入

此时参数以key获取，自定义设置的key

```java
public User login(Map<String,String> map)
```

```java
Map<String,String> map=new Map<>;
map.put("username",user.username);
map.put("password",user.password);
UserMapper.login(map)
```

```xml
<select id="login" resultType="User">
	select * from user where username= #{} and password = #{}
</select>
```

#### 注解标记

@Param

1. 在参数上加@Param

   key为@param中的value 和  以param1，param2....为key

```java
public User login(@Param("username") String username,
                  @Param("password") String password);
```

#### 实体类传入

key为实体的属性名，值为属性值.

```java
public USer login(User user)
```

```xml
<select id="login" resultType="User" >
    select * from user where username=#{username} and password=#{password}
</select>
```

## 数据输出

### 实体类

```java
User findById(Integer id);

List<User> list();
```

```xml
<select id="findById" resultType="User">
	select * from user where id=#{id}
</select>

<select id="list" resultType="User" >
	select * from user
</select>
```

### 单行单列

```java
public int count();
```

```xml
<select id="count" resultType="Integer">
	select count(id) from user
</select>
```

### 多表联查返回结果

使用map集合或 自定义返回类

使用Map:

单条数据

```java
public Map<String,Object> findArticleAndUserType(Integer userId,Integer ArticleId)
```

```xml
<select id="findArticleAndUserType" resultType="map">
	select article.*,user.type from user 
    inner join aritcle
    on article.userId=user.id
    where user.id=#{userId} and article.id=#{articleId}
</select>
```

多条数据类型为Map的集合

```java
public List<Map<String,Object>> findAll(Integer userId,Integer articleid)
```

### 获取自增的主键

```java
int insertEmployee(Employee employee);
```

```xml
<!-- int insertEmployee(Employee employee); -->
<!-- useGeneratedKeys属性字面意思就是“使用生成的主键” -->
<!-- keyProperty属性可以指定主键在实体类对象中对应的属性名，Mybatis会将拿到的主键值存入这个属性 -->
<insert id="insertEmployee" useGeneratedKeys="true" keyProperty="empId">
  insert into t_emp(emp_name,emp_salary)
  values(#{empName},#{empSalary})
</insert>
```

## 全局配置自动识别驼峰式命名规则

在Mybatis全局配置文件加入如下配置：

```xml
<!-- 使用settings对Mybatis全局进行设置 -->
<settings>

  <!-- 将xxx_xxx这样的列名自动映射到xxXxx这样驼峰式命名的属性名 -->
  <setting name="mapUnderscoreToCamelCase" value="true"/>

</settings>
```

SQL语句中可以不使用别名

```xml
<!-- Employee selectEmployee(Integer empId); -->
<select id="selectEmployee" resultType="com.atguigu.mybatis.entity.Employee">

  select emp_id,emp_name,emp_salary from t_emp where emp_id=#{empId}

</select>
```



## 模糊查询

Concat(’%‘，#{}，’%‘)     ===   ”%”#{}“%“   =     ‘%${}%'

问题：

1. in  (#{})  时 #{} 会添加单引号====in('1,2,3') 会报错.

   ？ :是不是可以 in (#{},#{})



## 自定义映射

resultMap结果映射，

```xml
<resultMap id="test" type="User" >
	<id property="userId" column="user_id"></id>
    <result property="age" column="age"></result>
    <result property="sex" column="sex"></result>
</resultMap>

<select id="findAll" resultMap="test">
	select * from user
</select>
```



| 关联关系 | 配置项关键词                            | 所在配置文件和具体位置            |
| -------- | --------------------------------------- | --------------------------------- |
| 对一     | association标签/javaType属性 **实体类** | Mapper配置文件中的resultMap标签内 |
| 对多     | collection标签/ofType属性 **集合**      | Mapper配置文件中的resultMap标签内 |



### 一对一：

一个用户对应一个身份证:

在用户类，每个用户都有一个身份证，所以在用户类中设置一个字段为身份证类，

在查找用户时，将用户所在的身份证也查找出来。

但是在查找时，获得的是身份证的id和班级的属性，而用户的类中只有身份证的对象，

这时，查找到的结果集就不能一一对应，所以，就需要我们自定义一个结果集，将班级的属性赋值给身份证对象。

```xml
<!-- 创建resultMap实现“对一”关联关系映射 -->
<!-- id属性：通常设置为这个resultMap所服务的那条SQL语句的id加上“ResultMap” -->
<!-- type属性：要设置为这个resultMap所服务的那条SQL语句最终要返回的类型 -->

<resultMap id="selectOrderWithCustomerResultMap" type="order">

  <!-- 先设置Order自身属性和字段的对应关系 -->
  <id column="order_id" property="orderId"/>

  <result column="order_name" property="orderName"/>

  <!-- 使用association标签配置“对一”关联关系 -->
  <!-- property属性：在Order类中对一的一端进行引用时使用的属性名 -->
  <!-- javaType属性：一的一端类的全类名 -->
  <association property="customer" javaType="customer">

    <!-- 配置Customer类的属性和字段名之间的对应关系 -->
    <id column="customer_id" property="customerId"/>
    <result column="customer_name" property="customerName"/>

  </association>

</resultMap>





<!-- Order selectOrderWithCustomer(Integer orderId); -->
<select id="selectOrderWithCustomer" resultMap="selectOrderWithCustomerResultMap">

  SELECT order_id,order_name,c.customer_id,customer_name
  FROM t_order o
  LEFT JOIN t_customer c
  ON o.customer_id=c.customer_id
  WHERE o.order_id=#{orderId}

</select>
```



### 一对多：

一个用户对应多个课程，即在用户类中定义一个课程类的集合类型。

在查找用户时，查找用户的所有课程。

即查找出来的数据，存在相同的用户数据对应不同的课程数据。

```xml
<!-- 配置resultMap实现从Customer到OrderList的“对多”关联关系 -->
<resultMap id="selectCustomerWithOrderListResultMap"

  type="customer">

  <!-- 映射Customer本身的属性 -->
  <id column="customer_id" property="customerId"/>

  <result column="customer_name" property="customerName"/>

  <!-- collection标签：映射“对多”的关联关系 -->
  <!-- property属性：在Customer类中，关联“多”的一端的属性名 -->
  <!-- ofType属性：集合属性中元素的类型 -->
  <collection property="orderList" ofType="order">

    <!-- 映射Order的属性 -->
    <id column="order_id" property="orderId"/>

    <result column="order_name" property="orderName"/>

  </collection>

</resultMap>

<!-- Customer selectCustomerWithOrderList(Integer customerId); -->
<select id="selectCustomerWithOrderList" resultMap="selectCustomerWithOrderListResultMap">
  SELECT c.customer_id,c.customer_name,o.order_id,o.order_name
  FROM t_customer c
  LEFT JOIN t_order o
  ON c.customer_id=o.customer_id
  WHERE c.customer_id=#{customerId}
</select>
```

### 多对多：

与多对一的区别：

sql语句需要查找三张表，resultMap处理与多对一一样。

### 分部查询：



## 多表映射优化

| setting属性         | 属性含义                                                     | 可选值              | 默认值  |
| ------------------- | ------------------------------------------------------------ | ------------------- | ------- |
| autoMappingBehavior | 指定 MyBatis 应如何自动映射列到字段或属性。 NONE 表示关闭自动映射；PARTIAL 只会自动映射没有定义嵌套结果映射的字段。 FULL 会自动映射任何复杂的结果集（无论是否嵌套）。 | NONE, PARTIAL, FULL | PARTIAL |

我们可以将autoMappingBehavior设置为full,进行多表resultMap映射的时候，可以省略符合列和属性命名映射规则（列名=属性名，或者开启驼峰映射也可以自动映射）的result标签！

修改mybati-sconfig.xml:

```xml
<!--开启resultMap自动映射 -->
<setting name="autoMappingBehavior" value="FULL"/>
```

修改teacherMapper.xml

```xml
<resultMap id="teacherMap" type="teacher">
    <id property="tId" column="t_id" />
    <!-- 开启自动映射,并且开启驼峰式支持!可以省略 result!-->    id不能省
<!--        <result property="tName" column="t_name" />-->
    <collection property="students" ofType="student" >
        <id property="sId" column="s_id" />
<!--            <result property="sName" column="s_name" />-->
    </collection>
</resultMap>
```


## 动态语句

### 多条件判断

#### if标签

根据条件判断是否拼接

```xml
<selecct >
select * from user where 
	<if test="id!=null and id!=''">id=#{id}</if>
    <if test="name!=null and name!=''">name=#{}</if>
    <if test="password!=null and password!=''">password=#{}</if>
</selecct>
```

问题:当第一个if不成立时，会去掉多余where，and

解决:加上恒成立条件

```xml
<selecct >
select * from user where and 1=1
	<if test="id!=null and id!=''">id=#{id}</if>
    <if test="name!=null and name!=''">name=#{}</if>
    <if test="password!=null and password!=''">password=#{}</if>
</selecct>
```

#### where标签

自动生成where条件，自动删除多余的and和or

```xml
<selecct >
select * from user 
	<where>
    	<if test="id!=null and id!=''">id=#{id}</if>
    	<if test="name!=null and name!=''">and name=#{}</if>
    	<if test="password!=null and password!=''">and password=#{}			</if>
    </where>

</selecct>
```

#### trim标签

使用trim标签控制条件部分两端是否包含某些字符

-   prefix属性：指定要动态添加的前缀
-   suffix属性：指定要动态添加的后缀
-   prefixOverrides属性：指定要动态去掉的前缀，使用“|”分隔有可能的多个值
-   suffixOverrides属性：指定要动态去掉的后缀，使用“|”分隔有可能的多个值

```xml
<trim prefix="where" prefixOverrides="and">
    <if test="id!=null and id!=''">id=#{id}</if>
    <if test="name!=null and name!=''">and name=#{}</if>
    <if test="password!=null and password!=''">and password=#{}
</trim>
```

#### set

动态去掉多余的逗号

```xml
<set>
        <if test="empName != null">
            emp_name=#{empName},
        </if>
        <if test="empSalary &lt; 3000">
            emp_salary=#{empSalary},
        </if>
</set>
```

#### choose/when/otherwise

相当于if...else   if...else

switch....case....default，按顺序查，满足一个直接退出

```xml
<select id="selectEmployeeByConditionByChoose" resultType="com.atguigu.mybatis.entity.Employee">
    select emp_id,emp_name,emp_salary from t_emp
    where
    <choose>
        <when test="empName != null">emp_name=#{empName}</when>
        <when test="empSalary &lt; 3000">emp_salary &lt; 3000</when>
        <otherwise>1=1</otherwise>
    </choose>
    
    <!--
     第一种情况：第一个when满足条件 where emp_name=?
     第二种情况：第二个when满足条件 where emp_salary < 3000
     第三种情况：两个when都不满足 where 1=1 执行了otherwise
     -->
</select>
```

#### foreach

1. 批量插入

   ```xml
   <!--
       collection属性：要遍历的集合
       item属性：遍历集合的过程中能得到每一个具体对象，在item属性中设置一个名字，将来通过这个名字引用遍历出来的对象
       separator属性：指定当foreach标签的标签体重复拼接字符串时，各个标签体字符串之间的分隔符
       open属性：指定整个循环把字符串拼好后，字符串整体的前面要添加的字符串
       close属性：指定整个循环把字符串拼好后，字符串整体的后面要添加的字符串
       index属性：这里起一个名字，便于后面引用
           遍历List集合，这里能够得到List集合的索引值
           遍历Map集合，这里能够得到Map集合的key
    -->
   <foreach collection="empList" item="emp" separator="," open="values" index="myIndex">
       <!-- 在foreach标签内部如果需要引用遍历得到的具体的一个对象，需要使用item属性声明的名称 -->
       (#{emp.empName},#{myIndex},#{emp.empSalary},#{emp.empGender})
   </foreach>
   ```

2. 批量更新

   上面批量插入的例子本质上是一条SQL语句，而实现批量更新则需要多条SQL语句拼起来，用分号分开。也就是一次性发送多条SQL语句让数据库执行。此时需要在数据库连接信息的URL地址中设置：

   ```xml
   atguigu.dev.url=jdbc:mysql:///mybatis-example?allowMultiQueries=true
   ```

   ```xml
   <!-- int updateEmployeeBatch(@Param("empList") List<Employee> empList) -->
   <update id="updateEmployeeBatch">
       <foreach collection="empList" item="emp" separator=";">
           update t_emp set emp_name=#{emp.empName} where emp_id=#{emp.empId}
       </foreach>
   </update>
   ```

#### sql片段

抽取重复的sql

```xml
<!-- 使用sql标签抽取重复出现的SQL片段 -->
<sql id="mySelectSql">
    select emp_id,emp_name,emp_age,emp_salary,emp_gender from t_emp
</sql>
```

引用已抽取的SQL片段

```xml
<!-- 使用include标签引用声明的SQL片段 -->
<include refid="mySelectSql"/>
```

## MyBatis高级扩展（分页插件）

具体来说，MyBatis 的插件机制包括以下三个组件：

1.  `Interceptor`（拦截器）：定义一个拦截方法 `intercept`，该方法在执行 SQL 语句、执行查询、查询结果的映射时会被调用。
2.  `Invocation`（调用）：实际上是对被拦截的方法的封装，封装了 `Object target`、`Method method` 和 `Object[] args` 这三个字段。
3.  `InterceptorChain`（拦截器链）：对所有的拦截器进行管理，包括将所有的 Interceptor 链接成一条链，并在执行 SQL 语句时按顺序调用。

插件的开发非常简单，只需要实现 Interceptor 接口，并使用注解 `@Intercepts` 来标注需要拦截的对象和方法，然后在 MyBatis 的配置文件中添加插件即可。

1. 依赖

   ```xml
   <dependency>
       <groupId>com.github.pagehelper</groupId>
       <artifactId>pagehelper</artifactId>
       <version>5.1.11</version>
   </dependency>
   ```

2. 在mybatis配置文件中配置

   ```xml
   <plugins>
       <plugin interceptor="com.github.pagehelper.PageInterceptor">
           <property name="helperDialect" value="mysql"/>
       </plugin>
   </plugins>
   ```

3. 使用

   ```java
   @Test
   public void testTeacherRelationshipToMulti() {
   
       TeacherMapper teacherMapper = session.getMapper(TeacherMapper.class);
   
       // 开启分页
       PageHelper.startPage(1,2);
       // 查询Customer对象同时将关联的Order集合查询出来
       List<Teacher> allTeachers = teacherMapper.findAllTeachers();
   //
       PageInfo<Teacher> pageInfo = new PageInfo<>(allTeachers);
   
       System.out.println("pageInfo = " + pageInfo);
       long total = pageInfo.getTotal(); // 获取总记录数
       System.out.println("total = " + total);
       int pages = pageInfo.getPages();  // 获取总页数
       System.out.println("pages = " + pages);
       int pageNum = pageInfo.getPageNum(); // 获取当前页码
       System.out.println("pageNum = " + pageNum);
       int pageSize = pageInfo.getPageSize(); // 获取每页显示记录数
       System.out.println("pageSize = " + pageSize);
       List<Teacher> teachers = pageInfo.getList(); //获取查询页的数据集合
       System.out.println("teachers = " + teachers);
       teachers.forEach(System.out::println);
   }
   ```

## 逆向工程 (代码生成器)



   

   







