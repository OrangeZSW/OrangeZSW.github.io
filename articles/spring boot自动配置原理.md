---
title: spring boot自动配置原理
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


## spring boot自动配置原理

1. **导入场景**：导入依赖和bean对象

2. **默认的扫描包规则**

   `@SpringBootApplication(scanBeanPackages="online.zorange")`

   默认扫描启动类所在的包，以及子包

3. **绑定配置**

   配置文件的配置项和java类的对象进行一一绑定

4. **按需加载自动配置**

   1. spring.boot.autoconfiguration 在spting-boot-start包中，它包含各种技术的配置类，来生产对应技术bean对象。

      ![image-20240816150132987](http://120.26.79.238:9000/blog/img/image-20240816150132987.png)

   2. 导入哪个场景就开启哪个自动配置,如果没有引入对应技术的场景启动器，则不会引入。

   3. SpringBootApplication在启动时会，拿到所有技术的XXXautoconfiguration.class【spi技术】【META-INF/spring/org.springframework.boot.autoconfiqure.AutoConfiguration.imports里面的技术】。只有在引入对应的启动器，才会加载，并不会直接全部加载。

   4. @SpringBootApplication--->

      1. ```java
         @SpringBootConfiguration
         @EnableAutoConfiguration  //自动配置的开关
         @ComponentScan
         ```

      2. 每一个自动配置类都有一个条件注解ConditioOnXXX,只有返回true才生效

      3. 每一个自动配置类都有@ConfigurationXXXProperties，来加载配置文件中，对应技术的配置项。

### spring boot自动配置的理解

#### @SpringBootApplication注解

包含三个注解：

1. `@SpringBootConfiguration`

2. `@EnableAutoConfiguration`

3. `@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
   @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })`

#### @SpringBootConfiguration

这个注解就是代表这是一个springboot的配置类



#### @EnableAutoConfiguration

注解里面的两个注解

```
@AutoConfigurationPackage
@Import({AutoConfigurationImportSelector.class})
```

 1. **@AutoConfigurationPackage**

    默认扫描启动类所在的包，以及子包

    

 2. **@Import({AutoConfigurationImportSelector.class})**

 3. 开启==自动配置的核心==，批量导入配置类

 4. 默认加载142个配置类  ->  来源于  `spring-boot-autoConfiguration` 包下的MATE-`INFO/spring/org.springframework.boot.autoconfigure.AutoConfiguration**.imports`文件里面

 5. 在项目启动时，则利用`@Import({AutoConfigurationImportSelector.class})`将`autoconfigration`包下的`XXXAutoConfiguration`的142个配置类导入

 6. 虽然导了142个配置类：

    但是这写配置类并不会全部生效，`AutoConfigurationImportSelector`根据条件注解`@ConditionlOnXXX`,只有条件成立时才导入

##### XXXAutoConfiguration

1. 用于配置第三方技术的`bean`。@Bean

2. 如果需要用到配置文件。则会有`@EnableConfigurationProperties(**ServerProperties**.class)`注解，用于把配置文件中指定前缀的的值封装到xxxProperties的类的属性中。

   以jbdc为例，`@ConfigurationProperties(prefix = "spring.datasource")`所有以spring.datasource为前缀的都封装到了属性类中。

3. 只需要修改核心配置文件，就能更改组件中的核心参数的值



##### 核心流程总结

1、导入`starter`，就会导入`autoconfigure`包。

2、`autoconfigure` 包里面 有一个文件 `META-INF/spring/**org.springframework.boot.autoconfigure.AutoConfiguration**.imports`,里面指定的所有启动要加载的自动配置类

3、@EnableAutoConfiguration 会自动的把上面文件里面写的所有**自动配置类都导入进来。xxxAutoConfiguration 是有条件注解进行按需加载**

4、`xxxAutoConfiguration`给容器中导入一堆组件，组件都是从 `xxxProperties`中提取属性值

5、`xxxProperties`又是和**配置文件**进行了绑定

**效果：**导入`starter`、修改配置文件，就能修改底层行为。



#### @ComponentScan

1. `TypeExcludeFilter`
   - 通常由程序员自定义，用于排除特定类型的组件。
2. `AutoConfigurationExcludeFilter`
   - 由 Spring Boot 提供，用于排除那些已经被自动配置机制处理过的组件。
   - 如果已经被自动配置机制处理了，那么配置类就不会生效了。