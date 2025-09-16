---
title: Spring Boot 项目启动时自动执行的方法
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


## Spring Boot 项目启动时自动执行的方法

在实际项目开发中，有时需要在项目启动时执行特定的方法，比如提前加载数据到缓存、检查运行环境、检查授权信息等。以下是八种实现方式，按照执行顺序介绍。

### 1. 实现 ServletContextListener 接口

通过实现 `ServletContextListener` 接口的 `contextInitialized` 方法，可以在 Web 应用程序初始化之前执行代码。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

@Slf4j
@Component
public class ServletContextListenerImpl implements ServletContextListener {
    static {
        log.info("启动时自动执行 静态代码块");
    }

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        log.info("启动时自动执行 ServletContextListener 的 contextInitialized 方法");
    }
}
```

### 2. 静态代码块方式

将要执行的方法所在的类交给 Spring 容器扫描，并在类中添加静态代码块。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StaticBlockTest {
    static {
        log.info("启动时自动执行 静态代码块");
    }
}
```

### 3. @PostConstruct 注解方式

使用 `@PostConstruct` 注解，可以在 Spring 容器初始化完 Bean 后自动执行指定方法。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Slf4j
@Component
public class PostConstructTest {
    @PostConstruct
    public void postConstruct() {
        log.info("启动时自动执行 @PostConstruct 注解方法");
    }
}
```

### 4. 实现 ServletContextAware 接口

通过实现 `ServletContextAware` 接口的 `setServletContext` 方法，在普通 Bean 属性填充后但在初始化之前执行代码。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.ServletContextAware;

import javax.servlet.ServletContext;

@Slf4j
@Component
public class ServletContextAwareImpl implements ServletContextAware {
    @Override
    public void setServletContext(ServletContext servletContext) {
        log.info("启动时自动执行 ServletContextAware 的 setServletContext 方法");
    }
}
```

### 5. @EventListener 方式

通过 `@EventListener` 注解，监听应用程序上下文刷新事件。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EventListenerTest {
    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        log.info("启动时自动执行 @EventListener 注解方法");
    }
}
```

### 6. 实现 ApplicationRunner 接口

实现 `ApplicationRunner` 接口的 `run` 方法，可以在 Spring Boot 应用启动后执行特定逻辑。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
public class ApplicationRunnerImpl implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("启动时自动执行 ApplicationRunner 的 run 方法");
        Set<String> optionNames = args.getOptionNames();
        for (String optionName : optionNames) {
            log.info("这是传过来的参数[{}]", optionName);
        }
    }
}
```

### 7. 实现 CommandLineRunner 接口

实现 `CommandLineRunner` 接口的 `run` 方法，可以在应用启动时执行命令行参数的处理逻辑。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CommandLineRunnerImpl implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        log.info("启动时自动执行 CommandLineRunner 的 run 方法");
    }
}
```

### 8. 实现 SpringApplicationListener 接口

通过实现 `ApplicationListener` 接口，你可以监听特定的事件，如 `ApplicationEnvironmentPreparedEvent`。在 Spring Boot 中，通常在 `META-INF/spring.factories` 文件中配置监听器。

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;

@Slf4j
public class SpringApplicationListenerImpl implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {
    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        log.info("启动时自动执行 SpringApplicationListener 的 onApplicationEvent 方法");
    }
}
```

### `META-INF/spring.factories` 配置

在 `src/main/resources/META-INF/spring.factories` 文件中添加如下内容：

```
org.springframework.context.ApplicationListener=\
com.example.SpringApplicationListenerImpl
```

### 执行顺序

以上几种方法的执行顺序如下：

1. 静态代码块
2. ServletContextListener 的 contextInitialized
3. ServletContextAware 的 setServletContext
4. @PostConstruct 注解的方法
5. @EventListener 监听的事件
6. SpringApplicationListener 的 onApplicationEvent 方法
7. ApplicationRunner 的 run 方法
8. CommandLineRunner 的 run 方法

### 执行阶段说明

- **静态代码块**
  - **阶段**：类加载阶段
  - **说明**：在类被加载到 JVM 中时，静态代码块会被执行，适用于一些初始化逻辑。

- **ServletContextListener 的 contextInitialized 方法**
  - **阶段**：Web 应用初始化阶段
  - **说明**：在初始化 Web 应用程序中的任何过滤器或 Servlet 之前，`contextInitialized` 方法会被调用。

- **ServletContextAware 的 setServletContext 方法**
  - **阶段**：Bean 属性填充后
  - **说明**：在填充普通 Bean 属性之后，但在初始化之前，`setServletContext` 方法会被调用。

- **@PostConstruct 注解的方法**
  - **阶段**：Bean 初始化阶段
  - **说明**：在 Bean 完成属性填充后，`@PostConstruct` 注解的方法会被调用，用于执行任何必要的初始化逻辑。

- **@EventListener 监听的 ContextRefreshedEvent 事件**
  - **阶段**：应用上下文刷新阶段
  - **说明**：在应用上下文被刷新时，标识应用已完全初始化，此时 `@EventListener` 方法会被调用。

- **SpringApplicationListener 的 onApplicationEvent 方法**
  - **阶段**：环境准备阶段
  - **说明**：在应用程序环境准备阶段，可以用于执行与环境相关的初始化逻辑。

- **ApplicationRunner 的 run 方法**
  - **阶段**：应用启动后
  - **说明**：在 Spring Boot 应用启动并完成初始化后，`run` 方法会被调用，适合执行与应用参数相关的逻辑。

- **CommandLineRunner 的 run 方法**
  - **阶段**：应用启动后
  - **说明**：与 `ApplicationRunner` 类似，`run` 方法会在应用启动后被调用，通常用于处理命令行参数。

---


## 可以注入Bean的方法

@PostConstruct 注解方式：在 @PostConstruct 注解的方法中，你可以注入其他 Bean，并在该方法中访问它们。

实现 ServletContextAware 接口：通过实现 ServletContextAware 接口，你可以获取到 ServletContext，并在 setServletContext 方法中使用其他 Bean（需要通过依赖注入）。

@EventListener 方式：在被 @EventListener 注解的方法中，你可以注入其他 Bean。

实现 ApplicationRunner 接口：在 ApplicationRunner 的 run 方法中，你可以注入其他 Bean，并在该方法中使用它们。

实现 CommandLineRunner 接口：同样地，在 CommandLineRunner 的 run 方法中，你也可以注入其他 Bean。

不能获取到 Bean 的方法：

ServletContextListener 的 contextInitialized 方法：因为在该方法中，你通常不能直接注入 Spring 管理的 Bean，除非通过其他方式获取到 ApplicationContext。
静态代码块方式：静态代码块是在类加载阶段执行的，无法直接访问 Spring 容器中的 Bean。