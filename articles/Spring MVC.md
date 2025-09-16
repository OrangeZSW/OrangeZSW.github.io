---
title: Spring MVC
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


## Spring MVC

> Spring MVC是控制层框架

表述层：控制层和视图ui

服务层

持久化层



基于Servelet API构建的原始Web框架

#### 使用spring MVC 步骤

1. **配置前端控制器**

   ```xml
     <servlet>
       <servlet-name>DispatcherServlet</servlet-name>
       <!-- DispatcherServlet的全类名 -->
       <servlet-class>org.springframework.web.servlet.DispatcherServlet
         </servlet-class>
         
       <!--默认Spring MVC的配置文件配置
   		位置：WEB-INFO下
   		名称：DispatcherServlet的name-servelet.
   
   	-->
       <!-- 通过初始化参数指定SpringMVC配置文件位置 -->
       <init-param>
         <!-- 如果不记得contextConfigLocation配置项的名称，可以到DispatcherServlet的父类FrameworkServlet中查找 -->
         <param-name>contextConfigLocation</param-name>
         <!-- 使用classpath:说明这个路径从类路径的根目录开始才查找 -->
         <param-value>classpath:spring-mvc.xml</param-value>
       </init-param>
         
         
       <!-- 作为框架的核心组件，在启动过程中有大量的初始化操作要做，这些操作放在第一次请求时才执行非常不恰当 -->
       <!-- 我们应该将DispatcherServlet设置为随Web应用一起启动 -->
       <load-on-startup>1</load-on-startup>
   
     </servlet>
   
   
   
   
   
   
     <servlet-mapping>
       <servlet-name>DispatcherServlet</servlet-name>
       <!--将jsp请求交给jspservelt处理，因为DispatchServelet不能处理jsp-->
       <!-- 对DispatcherServlet来说，url-pattern有两种方式配置 -->
       <!-- 方式一：配置“/”，表示匹配整个Web应用范围内所有请求。这里有一个硬性规定：不能写成“/*”。
         只有这一个地方有这个特殊要求，以后我们再配置Filter还是可以正常写“/*”。 -->
       <!-- 方式二：配置“*.扩展名”，表示匹配整个Web应用范围内部分请求 -->
       <url-pattern>/</url-pattern>
     </servlet-mapping>
   ```

   spring mvc的配置文件

   ​	默认位置：WEB-INFO下

   ​	名称：DispatchServelet的name；

   ```xml
   <servelet-name>name</servelet-name>
   ```

2. 配置spring mvc的ioc容器

   在配置文件中扫描bean

3. 注解

   1. 配置路径：@RequestMapping("/user")
   2. 将返回值以返回体的方式返回 @ResponseBody 

#### 访问路径设置

1. 支持ant风格的路径

​		`？`：表示任意单个字符 `"/a?a",`除了`？`和`/`

​        `*`：表示任意个数的字符,除了`?`和`/`

​		`**`:表示任意层数的任意目录，`/** ` ,不能有其他字符 如`/a**a`



@RequestMapping

1. 属性

   method=RequestMethod[]   可以匹配多个方法，默认全部都可以匹配



@RestController

默认为每个方法加上@ResponseBody注解，将返回值作为返回体返回

## 接收参数

自动进行类型转换：若无法转换报400.

1. **RequestParam 参数**：localhost:8080/login?`username="zsw"&password="123"`

   接收时可以使用@RequestParam注解接收，也可以不使用注解，但是形参名要与param名一致。

   ```java
   @GetMapping("/login")
   public void login(@RequestParam("username") String username, 
                     @RequestParam String password)
   ```

   1. 如果有多个同名的参数

      localhost:8080/login?`hobby=唱&hobby=跳`

      1. 数组

      ```java
      @GetMapping("/login")
      public void login(String [] hobby) //[唱,跳]
      ```

      2. 字符串

      ```java
      @GetMapping("/login")
      public void login(String  hobby)  //唱,跳
      ```

      3. list集合获取，必须使用注解

         

2. **路径中的参数**：localhost:8080/book/1/3

   这个参数需要使用注解@PathVariable来接收。

   将参数放入请求域中。

   ```java
   @GetMapping(/book/{id}/{uid})
   public void book(@PathVariable("id") Integer id,
                    @PathVariable("uid") Integer uid)
   ```

   

3. **请求体中的参数**`json格式`

   1. 开启mvc的注解驱动

   ```xml
   <mvc:annotation-driven />
   ```

   1. 注解：@RequestBody

   ```java
   @PostMapping(/data)
   public void data(@RequestBody("data") Data data)
   ```

    

## 获取Cookie数据

1. 获取HttServeletRequest对象和HttpServeletResponse,直接在形参类名声明

   ```java
   public void cookie(HttpServeletRequest req
                     HttpServeletResponse resp
                     HttpSeeion session
                     @CookieValue(value="JSESSIONID" ,required="false")  
                      //初始化一个cookie，响应cookie，第一次时
                      String JSESSIONID){
   }
   ```

2. `@CookieValue(value="JSESSIONID" ,required="false") String JSESSION`

   第一次获取时可能没有，所以将required设置为false，

3. `@RequestHeader("user-agent")` 

   获取请求头中的数据。

   | Controller method argument 控制器方法参数                    | Description                                                  |
   | ------------------------------------------------------------ | ------------------------------------------------------------ |
   | `jakarta.servlet.ServletRequest`, `jakarta.servlet.ServletResponse` | 请求/响应对象                                                |
   | `jakarta.servlet.http.HttpSession`                           | 强制存在会话。因此，这样的参数永远不会为 `null` 。           |
   | `java.io.InputStream`, `java.io.Reader`                      | 用于访问由 Servlet API 公开的原始请求正文。                  |
   | `java.io.OutputStream`, `java.io.Writer`                     | 用于访问由 Servlet API 公开的原始响应正文。                  |
   | `@PathVariable`                                              | 接收路径参数注解                                             |
   | `@RequestParam`                                              | 用于访问 Servlet 请求参数，包括多部分文件。参数值将转换为声明的方法参数类型。 |
   | `@RequestHeader`                                             | 用于访问请求标头。标头值将转换为声明的方法参数类型。         |
   | `@CookieValue`                                               | 用于访问Cookie。Cookie 值将转换为声明的方法参数类型。        |
   | `@RequestBody`                                               | 用于访问 HTTP 请求正文。正文内容通过使用 `HttpMessageConverter` 实现转换为声明的方法参数类型。 |
   | `java.util.Map`, `org.springframework.ui.Model`, `org.springframework.ui.ModelMap` | 共享域对象，并在视图呈现过程中向模板公开。                   |
   | `Errors`, `BindingResult`                                    | 验证和数据绑定中的错误信息获取对象！                         |



## 域对象的使用

### 请求域

1. 请求域

   ```java
   public void test(HttpServeletRequest req){
       req.settAribute("item",object)
   }
   ```

2. ModelAndView

   ```java
   public ModelAndView test(){
       ModelAndView mv=new ModelAndView()
       mv.addObject("item",object)  //放入请求域
       // 设置逻辑视图
       mv.setViewName("index")
       return mv  //需要返回ModeAndView对象
   }
   ```

3. Model 

   ```java
   public String test(
       Model model
   ){
       model.addArttibute("item",object)  //放入请求域
       // 设置逻辑视图
       mv.setViewName("index")
       return "index"  //需要返回ModeAndView对象
   }
   ```

4. Map

   ```java
   public String test(
       Map<String,String> map
   ){
       map.put("item",Object);  //放入请求域
       return "index"
   }
   ```

5. ModelMap

   ```java
   public String test(
       ModelMap modeMap 
   ){
       modeMap.addArttribute("item",object) //放入请求域
           return "index"
   }
   ```

model、map、ModelMap三个对象属于同一个类

### 会话域

```java
@RequestMapping("/attr/session")
@ResponseBody
public String testAttrSession(HttpSession session) {
    //直接对session对象操作,即对会话范围操作!
    return "target";
}
```

### 应用域

解释：springmvc会在初始化容器的时候，讲servletContext对象存储到ioc容器中！

```java
@Autowired
private ServletContext servletContext;

@RequestMapping("/attr/application")
@ResponseBody
public String attrApplication() {
    
    servletContext.setAttribute("appScopeMsg", "i am hungry...");
    
    return "target";
}
```



## spring MVC 跳转控制

1. **视图解析器**

   spring mvc.xml

   ```xml
   <!-- 配置动态页面语言jsp的视图解析器,快速查找jsp-->
   <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
       <property name="viewClass"value="org.springframework.web.servlet.view.JstlView"/>
       <!--
   		物理路径
   		前缀：/WEB-INF/views/
   		后缀：.jsp
   		资源路径:前缀+逻辑路径+后缀
   	-->
       <property name="prefix" value="/WEB-INF/views/"/>
       <property name="suffix" value=".jsp"/>
   </bean>
   ```

2. 设置**转发**

   ```java
   @Controller
   // /WEB-INF/views/xxx.jsp
   // index:/WEB-INF/views/index.jsp
   @RequestMapping("/")
   public void goIndex(){
       return "index";
   }
   
   
   // /xxx.jsp
   // test:/test.jsp
   @RequestMapping("/test")
   public void test(){
       return "forword:/test.jsp";  //转发，有前缀forword，不会被视图解析器解析
   }
   ```

   返回的index被视图解析器解析，返回index.jsp.完成转发。

3. **重定向**

   ```java
   @RequestMapping("/redirect-demo")
   public String redirectDemo() {
       // 重定向到 /demo 路径 
       return "redirect:/demo";   //重定向
   }
   ```

## 返回Json数据

 1. 导入依赖

    ```xml
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.15.0</version>
    </dependency>
    ```

 2. 添加mvc注解驱动

    mvc.xml

    ```xml
    <mvc:annotation-driven />
    ```

 3. 使用注解ResponseBody

    直接返回对象。

## 返回静态资源处理

### 原因：

1. 在tomcat中，静态资源由DefaultServlet资源处理，jsp资源由JSPServelet处理，url="/*"

2. 但是在spring mvc中，配置了DispatcherServelet,且url="/"这代表静态资源由DispatcherServelet处理，但是它处理不了静态资源。只能处理spring mvc请求。



### 处理：

```xml
<!--设置DefaultServlet处理静态资源-->  但是spring mvc请求不能访问
<mvc:default-servelet-handler />
```



先被DispatcherServelet处理。若未找到，则由DefaultServelet处理。

```xml
<mvc:default-servelet-handler />
<mvc:annotation-driven />
```



## RESTFul 风格设计

1. 一个URI代表一种资源
2. GET：获取、POST：新建、PUT:更新、DELETE：删除
3. 资源表示形式是XML或JSON
4. 客户端和服务端之间是无状态的，



@CrossOrigin  解决跨域问题



## 异常处理

声明式异常处理

控制层通知

```
@ControllerAdvice
@RestControllerAdvice
```

指定处理的异常类型

```
@ExceptionHandler(ServiceException.class)
```

## 拦截器

**实现HandlerInterceptor接口**;



> ==拦截==浏览器发送到服务器的请求，会在控制器方法执行前后执行,在DispatcherServelet和Controller之间拦截。
>
> ==过滤器==是在DispatcherServelt之前执行。



preHandle() 在控制器方法之前执行

postHandle() 在控制器方法之后执行

afterCompletion();在渲染视图完毕之后执行







1. 编写Myinterceptor.java

​		实现HandleInterceptor的方法。

2. mvc.xml配置文件

```xml
<mvc:interceptor>
    <!--默认拦截所有请求-->
 <bean class="online.zorange.config.Myinterceptor"/>
</mvc:interceptor>
```

```xml
<mvc:interceptor>
    <!--默认拦截所有请求-->
	<ref bean="myInterceptor"></ref>
</mvc:interceptor>
```

```xml
<mvc:interceptors>
   <mvc:interceptor>
        <!--
        /* 一层路径
        /** 多层
        --> 

        <!--拦截路径-->
        <mvc:mapping path=""/>
        <!--排除路径-->
        <mvc:exclude-mapping path=""/>
        <ref bean="myInterceptor" />
    </mvc:interceptor>
</mvc:interceptors>
```

3. 多个拦截器执行顺序

   preHandle() 方法：SpringMVC 会把所有拦截器收集到一起，然后按照配置顺序调用各个 preHandle() 方法。

   postHandle() 方法：SpringMVC 会把所有拦截器收集到一起，然后按照配置相反的顺序调用各个 postHandle() 方法。

   afterCompletion() 方法：SpringMVC 会把所有拦截器收集到一起，然后按照配置相反的顺序调用各个 afterCompletion() 方法。

## 参数校验

1. 依赖

   ```xml
   <!-- 校验注解 -->
   <dependency>
       <groupId>jakarta.platform</groupId>
       <artifactId>jakarta.jakartaee-web-api</artifactId>
       <version>9.1.0</version>
       <scope>provided</scope>
   </dependency>
           
   <!-- 校验注解实现-->        
   <!-- https://mvnrepository.com/artifact/org.hibernate.validator/hibernate-validator -->
   <dependency>
       <groupId>org.hibernate.validator</groupId>
       <artifactId>hibernate-validator</artifactId>
       <version>8.0.0.Final</version>
   </dependency>
   <!-- https://mvnrepository.com/artifact/org.hibernate.validator/hibernate-validator-annotation-processor -->
   <dependency>
       <groupId>org.hibernate.validator</groupId>
       <artifactId>hibernate-validator-annotation-processor</artifactId>
       <version>8.0.0.Final</version>
   </dependency>
   ```

2. 应用注解

```
 			  | 注解 | 规则 |
 			  | ---- | ---- |
       | @Null                      | 标注值必须为 null               |
       | @NotNull                   | 标注值不可为 null               |
       | @AssertTrue                | 标注值必须为 true               |
       | @AssertFalse               | 标注值必须为 false              |
       | @Min(value)                | 标注值必须大于或等于 value          |
       | @Max(value)                | 标注值必须小于或等于 value          |
       | @DecimalMin(value)         | 标注值必须大于或等于 value          |
       | @DecimalMax(value)         | 标注值必须小于或等于 value          |
       | @Size(max,min)             | 标注值大小必须在 max 和 min 限定的范围内 |
       | @Digits(integer,fratction) | 标注值值必须是一个数字，且必须在可接受的范围内   |
       | @Past                      | 标注值只能用于日期型，且必须是过去的日期      |
       | @Future                    | 标注值只能用于日期型，且必须是将来的日期      |
       | @Pattern(value)            | 标注值必须符合指定的正则表达式           |
       JSR 303 只是一套标准，需要提供其实现才可以使用。Hibernate Validator 是 JSR 303 的一个参考实现，除支持所有标准的校验注解外，它还支持以下的扩展注解：
       | 注解        | 规则                   |
       | --------- | -------------------- |
       | @Email    | 标注值必须是格式正确的 Email 地址 |
       | @Length   | 标注值字符串大小必须在指定的范围内    |
       | @NotEmpty | 标注值字符串不能是空字符串        |
       | @Range    | 标注值必须在指定的范围内         |
```


   ```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import org.hibernate.validator.constraints.Length;

/**
 * projectName: com.atguigu.pojo
 */
public class User {
    //age   1 <=  age < = 150
    @Min(10)
    private int age;

    //name 3 <= name.length <= 6
    @Length(min = 3,max = 10)
    private String name;

    //email 邮箱格式
    @Email
    private String email;

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

   ```

3. handler标记和绑定错误收集

   1. **@Validated进行校验**

   2. BindingResult，**接收校验结果**

      a. 在实体类参数和 BindingResult ==之间不能有任何其他参数,== BindingResult可以接受错误信息,避免信息抛出!

      b. result.hasErrors()  判断校验是否有错误，有为true，无：false；

   ```java
   @RestController
   @RequestMapping("user")
   public class UserController {
   
       /**
        * @Validated 代表应用校验注解! 必须添加!
        */
       @PostMapping("save")
       public Object save(@Validated @RequestBody User user,
                          //在实体类参数和 BindingResult 之间不能有任何其他参数, BindingResult可以接受错误信息,避免信息抛出!
                          BindingResult result){
          //判断是否有信息绑定错误! 有可以自行处理!
           if (result.hasErrors()){
               System.out.println("错误");
               String errorMsg = result.getFieldError().toString();
               return errorMsg;
           }
           //没有,正常处理业务即可
           System.out.println("正常");
           return user;
       }
   }
   ```

   

4. **易混总结**

   @NotNull、@NotEmpty、@NotBlank 都是用于在数据校验中检查字段值是否为空的注解，但是它们的用法和校验规则有所不同。

   1. @NotNull &#x20;

      @NotNull 注解是 JSR 303 规范中定义的注解，当被标注的字段值为 null 时，会认为校验失败而抛出异常。该注解不能用于字符串类型的校验，若要对字符串进行校验，应该使用 @NotBlank 或 @NotEmpty 注解。

   2. @NotEmpty &#x20;

      @NotEmpty 注解同样是 JSR 303 规范中定义的注解，对于 CharSequence、Collection、Map 或者数组对象类型的属性进行校验，校验时会检查该属性是否为 Null 或者 size()==0，如果是的话就会校验失败。但是对于其他类型的属性，该注解无效。需要注意的是只校验空格前后的字符串，如果该字符串中间只有空格，不会被认为是空字符串，校验不会失败。

   3. @NotBlank &#x20;

      @NotBlank 注解是 Hibernate Validator 附加的注解，对于字符串类型的属性进行校验，校验时会检查该属性是否为 Null 或 “” 或者只包含空格，如果是的话就会校验失败。需要注意的是，@NotBlank 注解只能用于字符串类型的校验。
      总之，这三种注解都是用于校验字段值是否为空的注解，但是其校验规则和用法有所不同。在进行数据校验时，需要根据具体情况选择合适的注解进行校验。


## 文件上传

1. 导入依赖

   ```xml
   <dependency>
       <groupId>commons-fileupload</groupId>
       <artifactId>commons-fileupload</artifactId>
       <version>1.3.1</version>
   </dependency>
   ```

2. Form表单

   1. 上传方式必须是post
   2. 请求体的编码方式必须是 multipart/form-data（通过 form 标签的 enctype 属性设置）
   3. 使用input，设置type为file，生成文件上传框

3. 在spring mvc配置中配置文件上传解析器

   ```xml
   <!--文件上传解析器-->
   <bean id="multipartResolver"
         class="org.springframework.web.multipart.support.StandardServletMultipartResolver">
   </bean>
   ```

4. 在`web.xml`中配置文件上传的配置

   ```xml
   <servlet>
       <servlet-name>yourAppServlet</servlet-name>
       <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
       <multipart-config>
           <!-- 定义文件上传时所需的最大值，单位为字节 -->
           <max-file-size>10485760</max-file-size>
           <!-- 定义单个上传文件的最大值，单位为字节 -->
           <max-request-size>20971520</max-request-size>
           <!-- 定义内存中存储文件的最大值，超过此大小的文件会写入到硬盘中 -->
           <file-size-threshold>5242880</file-size-threshold>
       </multipart-config>
       <load-on-startup>1</load-on-startup>
   </servlet>
   ```

5. 在控制器中获取文件

   ```java
   @PostMapping("/upload")
   public void upload(@RequestParam("file") MutipartFile file){
       
       file.getName();    // 表单项的name
       file.getOrginalFileName();   //文件的名字
       
       file.transferTo("path"/ File);  // 上传文件 ServeletContext.getRelpath  //web应用的部署路径
       // File.separator  操作系统的文件文件分隔符
           
   }
   ```

   例子：

   ```java
   @Override
       public String uploadImg(MultipartFile file) throws IOException {
           //获取文件名
           String originalFilename = file.getOriginalFilename();
           //获取文件类型
           String type = FileUtil.extName(originalFilename);
           //判断是不是图片
           if (!"jpg".equals(type) && !"png".equals(type) && !"jpeg".equals(type) && !"gif".equals(type)) {
               throw new ServiceException(Constants.CODE_NOT_LOGIN,"文件类型不正确");
           }
           //获取文件大小
           long size = file.getSize();
           //获取文件的父目录
           File upLoadParentFile = new File(uploadImg);
           //判断父目录是否存在
           if (!upLoadParentFile.exists()) {
               upLoadParentFile.mkdirs();
           }
           //定义一个文件的唯一的一个标识码
           String uuid = IdUtil.fastSimpleUUID();
           //文件的唯一标识码+文件的后缀
           String FileUuid = uuid + "." + type;
           //实际上传文件的路径
           File upLoadImg = new File(uploadImg + FileUuid);
           //获取文件的md5,用于判断文件是否存在
           String md5 = SecureUtil.md5(file.getInputStream());
           //文件的访问路径
           String Url;
           //判断文件是否存在,如果存在,则直接返回文件的访问路径
           QueryWrapper<Files> queryWrapper = new QueryWrapper<>();
           queryWrapper.eq("md5", md5);
           List<Files> filesList =this.list(queryWrapper);
           if (filesList.isEmpty()) {
               //将文件写入到指定的路径
               file.transferTo(upLoadImg);
               //文件的访问路径
               Url = serverIp + "/files/download/" + FileUuid;
           } else {
               return   filesList.get(0).getUrl();
           }
           //将文件信息保存到数据库中
           Files saveFile = new Files();
           saveFile.setName(originalFilename);
           saveFile.setType(type);
           saveFile.setSize(size / 1024);
           saveFile.setUrl(Url);
           saveFile.setMd5(md5);
           this.save(saveFile);
           return Url;
       }
   ```

   

## 文件下载

完整的报文信息

`ResponseEntity `

`ReqestEntity`

```java
public void ResponseEntity<响应体的类型 byte[]>(){
    new ResponseEntity<>();
    
    /**
    * 获取文件的字节数组。响应体
    
    * 新建响应头，new HttpHeaders()
    * 将响应头：设置为("Content-Disposition","attachment;filename=a.png")
    
    * 创建ResponseEntity对象 new ResponseEntity(byte[],响应头,HttpStatus.ok)
    
    * 返回
    **/
}
```

例子：

```java
public Result download(String fileUuid, HttpServletResponse response) throws IOException {

        System.out.println(fileUuid);
        //判断文件的类型
        //获取文件信息
        String url= serverIp + "/files/download/" + fileUuid;
        QueryWrapper<Files> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("url", url);
        Files one = this.getOne(queryWrapper);
        String type = FileUtil.extName(fileUuid);
        //获取文件的路径
        String filePath;
        if ("jpg".equals(type) || "png".equals(type) || "jpeg".equals(type) || "gif".equals(type)) {
            filePath = uploadImg + fileUuid;
        } else {
            filePath = uploadArticle + fileUuid;
        }
        //获取文件
        File file = new File(filePath);
       // 当为图片时
        if ("jpg".equals(type) || "png".equals(type) || "jpeg".equals(type) || "gif".equals(type)) {
            response.setContentType("image/jpeg");
        } else {

            // 设置响应内容类型为二进制流，以便下载文件
            response.setContentType("application/octet-stream");
            // 设置响应头，指定下载时的文件名，并使用UTF-8编码文件名以支持中文文件名
            response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(one.getName(), StandardCharsets.UTF_8));
        }

        //获取文件输入流
        InputStream inputStream = FileUtil.getInputStream(file);
        //获取输出流
        ServletOutputStream outputStream = response.getOutputStream();
        //将文件写入到输出流
        byte[] bytes = new byte[1024];
        int len;
        while ((len = inputStream.read(bytes)) != -1) {
            outputStream.write(bytes, 0, len);
        }
        //关闭流
        inputStream.close();
        outputStream.close();
        return Result.success();
    }

```

## Spring MVC 执行流程



```java
浏览器发送请求：客户端通过HTTP请求向服务器发起访问。
DispatcherServlet接收请求：Spring MVC的核心组件DispatcherServlet捕获到请求。
HandlerMapping寻找处理器：DispatcherServlet委托给HandlerMapping来决定应该由哪个控制器（Handler）处理这个请求。
如果没有找到合适的处理器，则会返回一个空的结果，此时可能会根据配置走向默认的servlet或其他错误处理机制。
HandlerAdapter适配处理器：如果找到合适的处理器，HandlerMapping将返回包含处理器及其适配器的信息。DispatcherServlet再选择一个HandlerAdapter来调用处理器方法。
拦截器（可选）：在调用处理器方法之前，如果有配置拦截器（Interceptor），则首先执行拦截器的preHandle()方法。
调用控制器方法：通过HandlerAdapter调用具体的控制器方法。
模型数据填充：控制器方法处理完后，通常会返回一个ModelAndView对象，其中包含视图名称以及模型数据。
拦截器（可选）：如果配置了拦截器，接下来执行拦截器的postHandle()方法。
视图解析：视图名称被传递给ViewResolver进行解析，得到实际的视图对象。
渲染视图：视图对象负责渲染页面，同时使用模型数据填充页面内容。
拦截器（可选）：最后，如果配置了拦截器，执行拦截器的afterCompletion()方法。
```

==Spring MVC框架中的请求处理流程==:

浏览器发送请求->DispatcherServelet接收请求->HandlerMapping通过控制器映射器查找控制器，->1. 若没有找到对应的控制器，->1.1 如果配置了默认的servelet，通过默认的servelet来处理请求，->1.2  如果没有配置默认的servelet，则返回404-> 2. 找到了对应的控制器-> 将控制器添加到处理器调用链中->通过控制器映射器得到处理器适配器HandlerAdapter->调用拦截器的preHandler方法->通过处理器适配器调对应的控制器方法，返回一个ModelAndView对象，包含视图名称及模型数据，->  拦截器调用Posthandler方法。->  调用视图解析和视图渲染->调用拦截器的afterCompletion方法。

---





  

