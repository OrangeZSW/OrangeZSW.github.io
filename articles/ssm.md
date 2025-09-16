## SSM整合

spring + spring mvc + mybatis 

spring ：整合型/设计型

spring mvc : 控制层

mybatis：持久层

1. 涉及 的ioc容器：spring mvc+ spring 的容器
2. 关系：父子关系
3. 子容器可以访问父容器的bean，但是父容器不能访问子容器的bean
4. 在ServletContextLinsliner中获取Spring ioc容器

| 配置名             | 对应内容                      | 对应容器 |
| ------------------ | ----------------------------- | -------- |
| spring-mvc.xml     | controller,springmvc相关      | web容器  |
| spring-service.xml | service,aop,tx相关            | root容器 |
| spring-mapper.xml  | mapper,datasource,mybatis相关 | root容器 |

配置spring的ioc配置。让DipatcherServelet在初始化时，加载spring ioc的容器作为父容器，ContextLoaderListener会在服务器启动时运行。

### 三个spring配置文件:

1. `spring-service.xml `      spring-ioc  父容器

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:context="http://www.springframework.org/schema/context"
          xmlns:aop="http://www.springframework.org/schema/aop" xmlns:tx="http://www.springframework.org/schema/tx"
          xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd">
   
       <context:property-placeholder location="classpath:jdbc.properties" />
   
       <context:component-scan base-package="online.zorange" >
           <context:exclude-filter type="annotation" expression="org.springframework.web.bind.annotation.RestController"/>
       </context:component-scan>
   
   
   
       <bean class="com.alibaba.druid.pool.DruidDataSource" id="dataSource">
           <property name="driverClassName" value="${jdbc.driver}"/>
           <property name="url" value="${jdbc.url}"/>
           <property name="username" value="${jdbc.name}"/>
           <property name="password" value="${jdbc.password}"/>
       </bean>
   
       <aop:aspectj-autoproxy />
       <bean class="org.springframework.jdbc.datasource.DataSourceTransactionManager" id="transactionManager" >
           <property name="dataSource" ref="dataSource" />
       </bean>
   
       <tx:annotation-driven transaction-manager="transactionManager" />
   
       <import resource="spring-mapper.xml" />
   </beans>
   
   ```

2. `spring-mvc.xml `           spring-mvc的ioc容器，管理controller

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:context="http://www.springframework.org/schema/context"
          xmlns:mvc="http://www.springframework.org/schema/mvc"
          xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc https://www.springframework.org/schema/mvc/spring-mvc.xsd">
   
       <context:component-scan base-package="online.zorange.controller" />
   
       <mvc:annotation-driven/>
   </beans>
   
   ```

   `web.xml `   配置DispacherServelet

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
            version="4.0">
       <!-- 配置Spring MVC的DispatcherServlet -->
       <servlet>
           <!-- 指定servlet的名称为"spring-mvc" -->
           <servlet-name>spring-mvc</servlet-name>
           <!-- 指定servlet的类为Spring的DispatcherServlet -->
           <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
           <!-- 配置DispatcherServlet的初始化参数，指定Spring MVC配置文件的位置 -->
           <init-param>
               <param-name>contextConfigLocation</param-name>
               <param-value>classpath:spring-mvc.xml</param-value>
           </init-param>
           <!-- 指定该servlet在web应用启动时即加载和创建，优先级为1 -->
           <load-on-startup>1</load-on-startup>
       </servlet>
       <!-- 映射servlet名称"spring-mvc"到所有请求的URL模式"/" -->
       <servlet-mapping>
           <servlet-name>spring-mvc</servlet-name>
           <url-pattern>/</url-pattern>
       </servlet-mapping>
   
       <!-- 配置应用上下文的初始化参数，指定Spring服务层配置文件的位置 -->
       <context-param>
           <param-name>contextConfigLocation</param-name>
           <param-value>classpath:spring-service.xml</param-value>
       </context-param>
       <!-- 注册Spring的监听器，用于在应用启动时加载Spring应用上下文 -->
       <listener>
           <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
       </listener>
   
   </web-app>
   
   ```

   

3. `spring-mapper.xml `     spring整合MyBatis的配置文件

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
   
       <bean class="org.mybatis.spring.SqlSessionFactoryBean">
           <property name="dataSource" ref="dataSource" />
   <!--        设置配置文件位置-->
           <property name="configLocation" value="classpath:mybatis-config.xml" />
   <!--        设置映射文件位置-->
           <property name="mapperLocations" value="classpath:mapper/*Mapper.xml" />
   <!--        设置别名-->
           <property name="typeAliasesPackage" value="online.zorange.entity" />
       </bean>
   
   <!--    设置Mapper扫描的包名-->
       <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
           <property name="basePackage" value="online.zorange.mapper" />
       </bean>
   
   </beans>
   
   ```

   

   `mybati-config.xml  `      mybatis的核心配置文件，可以通过整合配置文件来配置，两个一起配置也可以。

   ```xml
   <?xml version="1.0" encoding="UTF-8" ?>
   <!DOCTYPE configuration
           PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
           "http://mybatis.org/dtd/mybatis-3-config.dtd">
   <configuration>
       <!--引入jdbc.properties-->
       <properties resource="jdbc.properties"/>
   
       <settings>
           <!-- 将xxx_xxx这样的列名自动映射到xxXxx这样驼峰式命名的属性名 -->
           <setting name="mapUnderscoreToCamelCase" value="true"/>
           <!--开启resultMap自动映射 -->
           <setting name="autoMappingBehavior" value="FULL"/>
       </settings>
       <!--        设置别名-->
       <typeAliases>
           <package name="online.zorange.entity"/>
       </typeAliases>
   
       <plugins>
           <plugin interceptor="com.github.pagehelper.PageInterceptor">
               <property name="helperDialect" value="mysql"/>
           </plugin>
       </plugins>
   </configuration>
   
   ```