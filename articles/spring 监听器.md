---
title: spring 监听器
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


## 实现方式:

:one: Spring 框架自带的ApplicationListener

:two: 使用Spring Boot 框架封装的SpringApplicationRunListener

## 具体使用流程:

### 1. ApplicationListener

   用于监听 Spring 应用上下文事件的机制。通过实现 `ApplicationListener` 接口，你可以在应用启动、停止等生命周期事件发生时执行特定的逻辑

   常见事件: ContextRefreshedEvent 和 ContextClosedEvent  \ ApplicationStartedEvent  

| 事件类型                                  | 触发时机                                            | 用途                       |
| ----------------------------------------- | --------------------------------------------------- | -------------------------- |
| **`ApplicationStartedEvent`**             | 应用启动时（`SpringApplication.run()`）             | 记录启动日志、监控启动过程 |
| **`ApplicationEnvironmentPreparedEvent`** | `Environment` 初始化后，`ApplicationContext` 启动前 | 修改环境变量、添加配置源   |
| **`ApplicationContextInitializedEvent`**  | `ApplicationContext` 初始化后                       | 进行应用上下文初始化操作   |
| **`ApplicationPreparedEvent`**            | `ApplicationContext` 完全加载并准备好，但未启动时   | 初始化资源、执行启动检查   |
| **`ApplicationReadyEvent`**               | 应用完全启动并准备好处理请求时                      | 执行应用启动后任务         |
| **`ApplicationFailedEvent`**              | 应用启动失败时                                      | 记录失败日志、通知监控系统 |


### 2. SpringApplicationRunListener

   ① : 编写一个类型实现ApringApplicationRunListener

   ② : 重写该接口的7个方法, 每一个方法都有不同的回调时机, 因为布隆过滤器需要使用Redisson, 因此在业务我选择在Started中实现布隆过滤器的初始化

   ​	7个方法的回调时机:

| 方法                        | 回调时机                             | 用例                      |
| --------------------------- | ------------------------------------ | ------------------------- |
| **`starting()`**            | 应用启动开始时                       | 进行初始化、设置启动参数  |
| **`environmentPrepared()`** | Spring 环境准备好时                  | 修改环境变量、配置源      |
| **`contextPrepared()`**     | Spring 容器准备好时                  | 修改应用上下文、配置 Bean |
| **`contextLoaded()`**       | Spring 容器完全加载完成时            | 进一步初始化、配置应用    |
| **`started()`**             | 应用已启动但尚未完全准备好接受请求时 | 启动后任务、外部服务注册  |
| **`running()`**             | 应用已完全准备好，已能处理请求时     | 启动后操作、健康检查等    |
| **`failed()`**              | 应用启动失败时                       | 错误日志、通知、恢复操作  |

   这些回调方法使得开发者能够在应用启动过程中精细地控制不同阶段的行为，比如修改配置、注册外

   - `starting()`：Spring Boot 应用启动前

     修改启动参数或环境配置。

     打印启动日志。

   - `environmentPrepared`: Spring 应用环境准备好后

     修改系统属性或环境变量。

     在环境中添加自定义的 `PropertySource`。

   - `contextPrepared`: Spring 应用上下文准备好后

   - `contextLoaded`: Spring 应用上下文完全加载后,

     执行 Bean 初始化后的一些操作。

     完成一些额外的初始化工作。

   - `started` : Spring 应用启动后，`ApplicationStartedEvent` 触发时

   - `running`: Spring 应用完全准备好后，`ApplicationReadyEvent` 触发时

   - `failed`: Spring 应用启动失败时