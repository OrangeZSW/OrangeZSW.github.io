---
title: spring相关注解
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


1. **IoC** (控制反转) 和 依赖注入

## 		Spring 核心注解:

```java
// 标记类为 Spring 容器管理的 Bean，其默认的 Bean 名称由类名派生而来。
@Component

// 这不是一个标准的 Spring 注解。
@Service
// 持久层注解
@Repository
// 标记类为一个控制器 Bean。通常用于 Web 层的组件。
@Controller

// JDK提供的依赖注入注解，默认根据name
@Resource

// 标记依赖注入，是 Spring 框架中最常用的依赖注入方式。
@Autowired

// 若一个接口有多个实现类，可以通过指定name来注入
@Qualifier("name")
```

```java
// 指定要扫描的包以发现带有 @Component 等注解的类。
@ComponentScan(basePackages = {"online.zorange.define_components"})

// 指定属性文件的位置，该文件中包含了配置信息。
@PropertySource("classpath:jdbc.properties")

// 标记类为配置类，可以包含一个或多个 @Bean 方法。
@Configuration

// 导入其他配置文件
@import("ConfigB.")

/**
myCondition实现Condition接口，实现match方法，
如果返回为true，则注入bean，如果为false，则不注入
**/
@conditional({myCondition.class,....})'
    
// 定义一个 Bean 对象，返回类型即为 Bean 类型。
@Bean

// 从配置文件中获取指定属性的值，并将其注入到字段或方法参数中。
@Value("${name}")
```

## 2. **AOP** (面向切面编程)

   Spring AOP 注解:

   ```java
// 标记类为一个切面，其中包含多个通知（Advice）。
@Aspect

// 定义一个切入点表达式，用于匹配目标方法。
@Pointcut("execution(public int online.zorange.annotation.CalculatorImpl.*(..))")

// 在方法执行前触发的通知。
@Before("pointCut()")

// 在方法执行后触发的通知。
@After("pointCut()")

// 在方法正常返回后触发的通知，可以获取到返回结果。
@AfterReturning(value = "pointCut()", returning = "result")

// 在方法抛出异常后触发的通知，可以获取到异常对象。
@AfterThrowing(pointcut = "pointCut()", throwing = "e")

// 环绕通知，在方法调用前后都会触发。
@Around("pointCut()")
   ```

## 3. **JUnit 测试**

   Spring 测试注解:

   ```java
// 配置 Spring 测试上下文，指定 Spring 配置文件的位置。
@SpringJUnitConfig(locations = "classpath:JDBCTemplate.xml")
   ```

## 4. **事务管理**

   Spring 事务管理注解:

   ```java
// 用于标记方法需要开启事务管理。
@Transactional
   ```

## 5. **Spring-MVC**

   ```java
   // 为每个方法默认加上@ResponseBody注解
   @RestController
   
   // 将后端对象转为json对象
   @ResponseBody
   // 将前端json转为后端对象
   @RequestBody
   
   // 设置资源路径
   @RequestMapping("/hello",method=RequestMethod[].class)
   // 获取请求头中的数据
   @RequestHeader(value="",requier="")
   
   // 获取请求头中的cookie
   @CookieValue(value="")
   
   // 接收Param参数,
   @RequestParam(value="name",required="true",defaultValue="orange")
   
   // 接收路径中的参数，将路径占位符绑定到目标方法的参数上
   //value、require
   @PathVariable("id")
   
   // 接收请求体中的参数 json
   @RequestBody("name")
   
   // 默认指定方法的资源路径注解 RESTFul f
   @GetMapping("/")  @PostMapping("/")  @Put- @Delete- @Update- 
       
   // 解决跨域w
   @CrossOrigin
      
       
   // 参数校验
   @Validated   //BindingResult result 接收校验结果
	 
	 // 获取cookie
	 @CookieValue
	 
	 
   ```

   异常处理

   ```java
   // 控制器通知
   @RestControllerAdvice
   // 处理的异常类型
   @ExceptionHandler(ServiceException.class)
	 //抛出异常（类似Throws ）且在出口不用处理
	 @SneakyThrows
   ```

## spring cloud 注解

```java
@LoadBalanced   //让Resttmplate具有负载均衡的能力
// 将负载均衡算法应用到指定的服务提供方中
@LoadBalancerClients(value = @LoadBalancerClient(name = "spzx-cloud-user", configuration = CustomLoadBalancerConfiguration.class))
@RefreshScope  // 刷新@Value映射的值
@SentienlResorce  //定义资源名称
@FeignClient(value = "spzx-cloud-user",path = "/user",fallback = UserFeignFallback.class) //注册Feign接口和降级类
@EnableAdminServer  //微服务监控图像界面


@RabbitListener(queues = "one")   //设置Rabbitmq监听队列

@RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "direct_queue_02" , durable = "true") ,
            exchange = @Exchange(value = "direct_exchange" , durable = "true" , type = ExchangeTypes.DIRECT) ,
            key = { "error" , "info"}
    ))    // 在消费方，定义队列，交换机以及绑定关系
		
	// OpenFeign远程调用默认为json数据，使用这个注解将json解析为普通数据
	@SpringQueryMap

```

