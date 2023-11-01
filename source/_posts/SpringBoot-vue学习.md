---
title: SpringBoot+vue学习
date: 2023-09-08 00:16:34
categories: 学习
tags: SpringBoot
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/wallhaven-jxyj3p_1920x1080.png
# cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img\wallhaven-o5jy67_1920x1080.png
---

# Spring Boot+Vue+element Ui

## Application.yml 配置

```yaml
server:
  port: 8181
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8
    username: root
    password: 421232
mybatis:
  mapper-locations: classpath:mapper/*.xml #calsspath代表resources目录
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  type-aliases-package: online.zorange.springboot.entity
```

## sql 语句写的位置

1. #### 注解

![image-20231001103758694](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231001103758694.png)

2. mybatis 的 xml 文件里面

![image-20231001103944233](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231001103944233.png)

## 跨域问题

```java
package online.zorange.springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


@Configuration
public class CorsConfig {
    //当前跨域最大有效时长。这里默认1天
    private static final long MAX_AGE = 24 * 60 * 60;

    @Bean
    public CorsFilter corsFilter() {
        //初始化cors配置对象
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        //配置跨域规则
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        //允许携带cookie
        corsConfiguration.addAllowedOriginPattern("http://localhost:8080");
        //允许所有请求头
        corsConfiguration.addAllowedHeader("*");
        //允许所有请求方法	
        corsConfiguration.addAllowedMethod("*");
        //配置跨域请求的域名
        corsConfiguration.setMaxAge(MAX_AGE);
        //添加映射路径，拦截一切请求
        source.registerCorsConfiguration("/**", corsConfiguration);
        //返回corsFilter实例，参数：cors配置源对象
        return new CorsFilter(source);
    }
}

```

## 忽略某个字段，不展示给前端

```java
@JsonIgnore
private String password;
```

![image-20231004145243587](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004145243587.png)

## Mybatis plus 实体类的注解

![image-20231004103440387](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004103440387.png)

## 后端分页（UserController.java）

### 使用 Mybatis-Plus

```java
 /***
     * 使用mybatis-plus的分页插件
     */
    @GetMapping("/page")
    public IPage<User> findByPage(
            @RequestParam Integer pageNum,
            @RequestParam Integer pageSize,
            @RequestParam(defaultValue = "") String userName,
            @RequestParam(defaultValue = "") String email,
            @RequestParam(defaultValue = "") String address){
        IPage<User> page= new Page<>(pageNum,pageSize);
        QueryWrapper<User> wrapper=new QueryWrapper<>();
        wrapper.like("username",userName);
        //这里用and是因为如果直接用like，可能框架拼接sql时没有加上and，导致查询结果不正确，但是mybatis-plus的wrapper对象提供了and方法，可以解决这个问题。
//        wrapper.and(w->w.like("email",email));
        wrapper.like("email",email);
        wrapper.like("address",address);
        return userService.page(page,wrapper);

    }
```

### Mapper.interface

```java
/**
 * 分页查询
 * 不使用mybatis-plus的分页插件
 */
//接口路径为/user/page?pageNum=1&pageSize=10
//@RequestParam注解用于获取请求参数的值,即将url中的pageNum和pageSize的值传递给这两个参数。
@GetMapping("/page")
public Map<String, Object> findByPage(
    @RequestParam Integer pageNum,
    @RequestParam Integer pageSize,
    @RequestParam String userName,
    @RequestParam String email,
    @RequestParam String address){
    //查询总条数
    Integer total=userMapper.selectTotal(userName,email,address);
    //查询第几页，每页几条数据
    pageNum=(pageNum-1)*pageSize;
    List<User> data=userMapper.selectPage(pageNum,pageSize,userName,email,address);

    //将数据封装成map
    Map<String, Object> res=new HashMap<>();
    res.put("data",data);
    res.put("total",total);
    return res;
}
```

## mybatisPlus 配置

### pom.xml 依赖

```xml
<!--        mybatis-plus依赖-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.1</version>
        </dependency>
```

### mybatisPlusConfig.java

```java
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("online.zorange.springboot.mapper")//扫描mapper文件夹
public class MybatisPlusConfig {
    /**
     * 添加分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));//如果配置多个插件,切记分页最后添加
        //interceptor.addInnerInterceptor(new PaginationInnerInterceptor()); 如果有多数据源可以不配具体类型 否则都建议配上具体的DbType
        return interceptor;
    }
}

```

## swagger3 配置

### SwaggerConfig.java

```java
package online.zorange.springboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.*;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.*;

@EnableWebMvc
@EnableSwagger2
@Configuration
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2).apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())

                .build()
                .securitySchemes(Collections.singletonList(apiKey()))
                .securityContexts(Collections.singletonList(securityContext()));
    }

    private static ApiKey apiKey() {
        return new ApiKey("token", "token", "header");
    }

    private SecurityContext securityContext() {
        return SecurityContext.builder()
                .securityReferences(Collections.singletonList(new SecurityReference("token", new AuthorizationScope[0])))
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .description("**项目管理平台")
                .title("**项目管理平台接口api").build();
    }



}
```

### pom.xml 依赖

```xml
<dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-boot-starter</artifactId>
            <version>3.0.0</version>
        </dependency>
```

访问地址：http://localhost:8181/swagger-ui/index.html

如果配置了拦截器，要放开以下路由

```
//swagger2
"/swagger-ui/**",
"/swagger-resources/**",
"/swagger-ui.html",
"/v2/api-docs",
"/webjars/**"
```

## axios

### 1. (npm i axios -S)

```sh
npm i axios -S
```

#### 封装代码

src/utils/request.js

```js
import axios from "axios";

const request = axios.create({
  baseURL: "/api", // 注意！！ 这里是全局统一加上了 '/api' 前缀，也就是说所有接口都会加上'/api'前缀在，页面里面写接口的时候就不要加 '/api'了，否则会出现2个'/api'，类似 '/api/api/user'这样的报错，切记！！！
  timeout: 5000,
});

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json;charset=utf-8";

    // config.headers['token'] = user.token;  // 设置请求头
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
  (response) => {
    let res = response.data;
    // 如果是返回的文件
    if (response.config.responseType === "blob") {
      return res;
    }
    // 兼容服务端返回的字符串数据
    if (typeof res === "string") {
      res = res ? JSON.parse(res) : res;
    }
    return res;
  },
  (error) => {
    console.log("err" + error); // for debug
    return Promise.reject(error);
  }
);

export default request;
```

#### main.js

![image-20231004154555901](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004154555901.png)

使用：

![image-20231005153840604](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231005153840604.png)

### 2. vue add axios

```shell
vue add axios
```

使用：

![image-20231004160946025](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004160946025.png)

返回的数据：

![image-20231004161101596](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004161101596.png)

## Mybatis-plus 代码生成器

### 安装

```xml
<!--mybatis代码生成器-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-generator</artifactId>
            <version>3.5.1</version>
        </dependency>

<!--velocity模板依赖-->
        <dependency>
            <groupId>org.apache.velocity</groupId>
            <artifactId>velocity</artifactId>
            <version>1.7</version>
        </dependency></version>
</dependency>
```

utils/CodeGenerator.java

```java
package online.zorange.springboot.utils;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

import java.util.Collections;


/**
 * 代码生成器
 * Created by macro on 2018/4/26.
 * Modified by zorange on 2020/4/26.
 * @Author zorange
 * @Date 2020/4/26 22:40
 * @Version 1.0
 */
public class CodeGenerator {
    public static void main(String[] args) {
        generate();
    }
    private static void generate() {
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8",
                        "root",
                        "421232")
                .globalConfig(builder -> {
                    builder.author("zorange")
                            .fileOverride()
                            .outputDir("C:\\Users\\15629\\Desktop\\前后端分离开发\\springboot\\src\\main\\java")
                            .enableSwagger();
                })
                .packageConfig(builder -> {
                    builder.parent("online.zorange.springboot") // 设置父包名
                            .moduleName(null)//模块名
                            .pathInfo(Collections.singletonMap(OutputFile.mapperXml, "C:\\Users\\15629\\Desktop\\前后端分离开发\\springboot\\src\\main\\resources\\mapper\\")); // 设置mapper.xml生成路径
                })
                .strategyConfig(builder -> {
                    builder.entityBuilder().enableLombok();  // 为实体类添加lombok注解
                    builder.controllerBuilder().enableRestStyle(); // 为控制器添加@RestController注解
                    builder.mapperBuilder().enableMapperAnnotation().build(); // 为mapper添加@Mapper注解
                    builder.addInclude("user")
                            .addTablePrefix("t_");
                })
//                .templateEngine(new FreemarkerTemplateEngine()) // 指定模板引擎，默认是VelocityTemplateEngine ，需要引入相关引擎依赖
                .execute();
    }
}

```

### 使用：

1. **使用之前备份代码！！！**
2. 直接运行

### 规则：

1. controller.java.vm

```v
package ${package.Controller};


import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import ${package.Entity}.${entity};
import ${package.Service}.${table.serviceName};

#if(${restControllerStyle})
import org.springframework.web.bind.annotation.RestController;
#else
import org.springframework.stereotype.Controller;
#end
#if(${superControllerClassPackage})
import ${superControllerClassPackage};
#end

/**
 * <p>
 * $!{table.comment} 前端控制器
 * </p>
 *
 * @author ${author}
 * @since ${date}
 */
#if(${restControllerStyle})
@RestController
#else
@Controller
#end
@RequestMapping("#if(${package.ModuleName})/${package.ModuleName}#end/#if(${controllerMappingHyphenStyle})${controllerMappingHyphen}#else${table.entityPath}#end")
#if(${kotlin})
class ${table.controllerName}#if(${superControllerClass}) : ${superControllerClass}()#end

#else
#if(${superControllerClass})
public class ${table.controllerName} extends ${superControllerClass} {
#else
public class ${table.controllerName} {
#end

    @Resource
    private ${table.serviceName} ${table.entityPath}Service;

    //新增和修改
    @PostMapping
    //RequestBody注解用于接收前端传递给后端的json字符串中的数据的(请求体中的数据的)；将json转为java对象。
    public boolean save(@RequestBody ${entity} ${table.entityPath}) {
        return ${table.entityPath}Service.saveOrUpdate(${table.entityPath});
    }

    //删除
    @DeleteMapping("/{id}")
    //@PathVariable注解用于获取url中的数据,即id,这里的id是参数名，#{id}取的是参数的值。
    public boolean deleteById(@PathVariable Integer id) {
        return ${table.entityPath}Service.removeById(id);
    }

    //查询所有
    @GetMapping
    public List<${entity}> findAll() {
    //return userMapper.findAll();  //自己写的方法
        return ${table.entityPath}Service.list();  //mybatis-plus提供的方法
    }

    //根据id查询
    @GetMapping("/{id}")
    public ${entity} findById(@PathVariable Integer id) {
        return ${table.entityPath}Service.getById(id);
    }

    //分页查询
    @GetMapping("/page")
    public Page<${entity}> findPage(@RequestParam Integer pageNum, @RequestParam Integer pageSize) {
        QueryWrapper<User> wrapper=new QueryWrapper<>();
        return ${table.entityPath}Service.page(new Page<>(pageNum, pageSize), wrapper);
    }

    //批量删除用户
    @DeleteMapping("del/batch")
    public boolean deleteBatchById(@RequestBody List<Integer> ids) {
        return ${table.entityPath}Service.removeBatchByIds(ids);
    }


}

#end
```

## Vue 路由

### 子路由

```vue
children: [ { 子路由一 }, { 子路由二 } ]
```

![image-20231009185211177](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231009185211177.png)

1. 创建一个 components.vue
2. 将需要的组件复制过来
3. 定义自定义的值

![image-20231009191648584](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231009191648584.png)

4. 导入 components

![image-20231009191925407](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231009191925407.png)

5. 引用+传值

![image-20231009192355327](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231009192355327.png)

## Excel 导出

[hutool](https://loolly_admin.oschina.io/hutool-site/docs/#/poi/Excel%E7%94%9F%E6%88%90-ExcelWriter)

### 安装依赖

```xml
<!--        hutool依赖-->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.7.20</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>4.1.2</version>
        </dependency>

```

### 别名

在导入和导出时，使用别名，

在`entity`对象加个`hutool`的`Alias`注解

```java
import cn.hutool.core.annotation.Alias;

//hu-tool的注解,解决导入时字段为中文时识别不了的问题
      @Alias("用户名")
      @ApiModelProperty("用户名")
      private String username;

      @Alias("密码")
      @ApiModelProperty("密码")
      private String password;
```

用了注解之后下面代码里面起别名就可以去掉了。

### 导出

```java
    //导出excel
    @GetMapping("/export")
    public void export(HttpServletResponse response) throws Exception {
//        从数据库中查询出所有的数据
          List<User> list = userService.list();
//        导出    1.创建writer对象    2.设置excel表头    3.写出数据
        ExcelWriter writer = ExcelUtil.getWriter(true);

//        别名，也可以用注解来设置
        writer.addHeaderAlias("id","编号");
        writer.addHeaderAlias("username","用户名");
        writer.addHeaderAlias("password","密码");
        writer.addHeaderAlias("nickname","昵称");
        writer.addHeaderAlias("email","邮箱");
        writer.addHeaderAlias("phone","电话");
        writer.addHeaderAlias("address","地址");
        writer.addHeaderAlias("creatTime","创建时间");
//        将list对象写出到writer中
        writer.write(list);


//设置浏览器响应格式
        response.setContentType("application/vnd.ms-excel;charset=utf-8");
//        设置响应头信息
        String fileName = URLEncoder.encode("用户列表", "UTF-8");
//        设置响应头
        response.setHeader("Content-Disposition", "attachment;filename="+fileName+".xls");

//        将writer中的数据写出到浏览器
        ServletOutputStream out = response.getOutputStream();
        writer.flush(out,true);
        out.close();
        writer.close();
    }
```

### 导入

后端

```java
    //导入excel
    @PostMapping("/import")
    public boolean importUser(MultipartFile file) throws Exception {
        //获取上传的文件流
        InputStream in = file.getInputStream();
        //读取excel
        ExcelReader reader = ExcelUtil.getReader(in);
        //读取第二行开始的数据
        List<User> list = reader.readAll(User.class);
        //批量保存到数据库中
        System.out.println(list);
        return userService.saveBatch(list);
    }
```

前端

element 的组件

```vue
<el-upload
  action="http://localhost:8181/user/import"
  style="display: inline-block"
  :show-file-list="false"
  :accept="xlsx"
  :on-success="handleExcelSuccess"
>
        <el-button style="margin: 5px" type="primary" >导入<i class="el-icon-download"></i></el-button>
      </el-upload>
```

## 日志打印：

```java
//Slf4j注解是lombok提供的，用于打印日志
@Slf4j
```

## Spring Boot 层

![image-20231017151940841](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231017151940841.png)

common 统一包装

config 过滤层

controller 控制

entity 实体类

 		Dao 数据包装类

exception 自定义异常

mapper 接口

service 服务

utils 工具

### common 统一包装

`constants.java`

定义常量

```java
package online.zorange.springboot.common;

/*
 * 用于存放常量
 * 常量接口
 */
public interface Constants {
    //操作成功
    String CODE_SUCCESS = "200";
    String MSG_SUCCESS = "操作成功";

    //系统错误
    String CODE_ERROR = "500";
    String MSG_ERROR = "系统错误";
    //参数错误
    String CODE_PARAM_ERROR = "400";
    String MSG_PARAM_ERROR = "参数错误";
    //其他业务异常
    String CODE_OTHER_ERROR = "501";
    String MSG_OTHER_ERROR = "其他业务异常";

    String CODE_NOT_LOGIN = "401";
    String MSG_NOT_LOGIN = "权限不足";

}
```

`Result.java`

接口，统一返回包装类

```java
package online.zorange.springboot.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
* 接口，统一返回包装类
 */
@Data
//无参构造
@NoArgsConstructor
//有参构造
@AllArgsConstructor
public class Result {
    private String code;
    private String msg;
    //泛型，可以是任意类型
    private Object data;
    //成功的方法，没有返回数据
    public static Result success(){
        return new Result(Constants.CODE_SUCCESS,Constants.MSG_SUCCESS,null);
    }
    //成功的方法，有返回数据
    public static Result success(Object data){
        return new Result(Constants.CODE_SUCCESS,Constants.MSG_SUCCESS,data);
    }
    //失败的方法，没有返回数据
    public static Result error(){
        return new Result(Constants.CODE_ERROR,Constants.MSG_ERROR,null);
    }
    //失败的方法，有返回的信息
    public static Result error(String msg){
        return new Result(Constants.CODE_ERROR,msg,null);
    }
    //失败的方法，有自定义的错误码和错误信息
    public static Result error(String code,String msg){
        return new Result(code,msg,null);
    }
}

```

### exception 自定义异常处理

`GlobalExceptionHandler.java`

全局异常处理

```java
package online.zorange.springboot.exception;

import online.zorange.springboot.common.Result;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 处理ServiceException异常,如果抛出ServiceException异常，就会被该方法捕获，然后运行该方法
     * 继承了RuntimeException，所以不需要在方法上抛出异常
    * @param e 业务异常
    * @return Result
    */
    @ExceptionHandler(ServiceException.class)
    @ResponseBody
    public Result handle(ServiceException e){
        return Result.error(e.getCode(),e.getMessage());
    }
}

```

`ServiceException.java`

自定义服务类异常处理

```java
package online.zorange.springboot.exception;

import lombok.Getter;

@Getter
public class ServiceException extends RuntimeException{
    private final String code;
    public ServiceException(String code, String msg){
        //调用父类的构造方法
        super(msg);
        this.code=code;
    }
}
```

## JWT登录

### 依赖

```xml
<!--        jwt依赖-->
        <dependency>
            <groupId>com.auth0</groupId>
            <artifactId>java-jwt</artifactId>
            <version>3.10.3</version>
        </dependency>
```

### 生成token

utils.tokenUtil.java

```java
package online.zorange.springboot.utils;

import cn.hutool.core.date.DateUtil;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import online.zorange.springboot.entity.User;

import java.util.Date;

/***
 * 生成token
 */
public class TokenUtil {
    public static String genToken(User user){
        return JWT.create().withAudience(String.valueOf(user.getId()))   //将user id保存在token里面，作为载荷
                .withExpiresAt(DateUtil.offsetHour(new Date(),2))  //2小时token失效
                .sign(Algorithm.HMAC256(user.getPassword()));  //将password  作为token密钥
    }
}

```

### 前端放开请求头	

```js
    let user=localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : '';
    if(user){
        config.headers['token'] = user.token;  // 设置请求头
    }
```

### 创建拦截器

`config.interceptor.JWTinterceptor.java`

```java
package online.zorange.springboot.config.interceptor;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import online.zorange.springboot.common.Constants;
import online.zorange.springboot.entity.User;
import online.zorange.springboot.exception.ServiceException;
import online.zorange.springboot.service.IUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class JwtInterceptor implements HandlerInterceptor {
    private IUserService userService;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token= request.getHeader("token");
        //如果不是映射到方法就直接通过
        if(!(handler instanceof HandlerMethod)){
            return true;
        }
        //执行认证
        if(token.equals("")){
            throw  new ServiceException(Constants.CODE_NOT_LOGIN,"无token");
        }
        //获取token中的用户id
        String userId;
        try{
            userId=JWT.decode(token).getAudience().get(0);
        }catch (JWTDecodeException j){
            throw new ServiceException(Constants.CODE_NOT_LOGIN,"token验证失败");
        }
        //验证
        User user=userService.getById(userId);
        if(user==null){
            throw  new ServiceException(Constants.CODE_NOT_LOGIN,"用户不存在，请重新登录");
        }
        //验证token,用户密码加签
        JWTVerifier jwtVerifier=JWT.require(Algorithm.HMAC256(user.getPassword())).build();
        try{
            jwtVerifier.verify(token);
        }catch (JWTVerificationException j){
            throw new ServiceException(Constants.CODE_NOT_LOGIN,"token验证失败,请重新登录");
        }

        return HandlerInterceptor.super.preHandle(request, response, handler);

    }

}

```

### 注册拦截器

`config.interceptorCongif.java`

```java
package online.zorange.springboot.config;

import online.zorange.springboot.config.interceptor.JwtInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class interceptorConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        WebMvcConfigurer.super.addInterceptors(registry);
        registry.addInterceptor(jwtInterceptor())
                .addPathPatterns("/**")  //拦截所有请求，通过判断token是否合法来确定是否登录
                .excludePathPatterns("/user/login","user/register","**/export","**/import"); //放开登录，注册，导入，导出
    }
    //注册对象
    @Bean
    public JwtInterceptor jwtInterceptor(){
        return new JwtInterceptor();
    }
}

```

## 文件操作

### 创建数据库表

```sql
CREATE TABLE `file` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文件名称',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文件类型',
  `size` bigint(20) DEFAULT NULL COMMENT '文件大小',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '链接',
  `is_delete` tinyint(1) unsigned zerofill DEFAULT '0' COMMENT ' 是否删除',
  `enable` tinyint(1) unsigned zerofill DEFAULT '1' COMMENT '是否禁用',
  `md5` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文件md5',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 实体类entity层

```java
package online.zorange.springboot.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("file")
public class File {
    @TableId(value = "id",type = IdType.AUTO)
    private String id;
    private String name;
    private String type;
    private Long size;
    private String url;
    private boolean is_delete;
    private boolean enable;
}
```

### 文件controller层

`controller.FileController.java`

```java
package online.zorange.springboot.controller;

import online.zorange.springboot.common.Result;
import online.zorange.springboot.service.IFileService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/***
 * 文件上传相关接口
 */
@RestController
@RequestMapping("/file")
public class FileController {
    @Resource
    private IFileService fileService;

    /**
     * 上传文件
   
     * @param file 前端传递过来的文件
     * @return String
     */
    @PostMapping("/upload")
    public String upload(@RequestParam MultipartFile file) throws IOException {
        return fileService.upload(file);
    }

    /*
      下载文件
      @return String
     */
    @GetMapping("/download/{fileUuid}")
    public Result download(@PathVariable String fileUuid, HttpServletResponse response) throws IOException {
        return fileService.download(fileUuid, response);
    }

}

```

先保存在磁盘里面

![image-20231024170047504](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231024170047504.png)

### 文件Srevice层

`FileServiceImpl.java`

```java
package online.zorange.springboot.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import online.zorange.springboot.common.Result;
import online.zorange.springboot.entity.Files;
import online.zorange.springboot.mapper.FileMapper;
import online.zorange.springboot.service.IFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;

@Service
public class FileServiceImpl extends ServiceImpl<FileMapper, Files> implements IFileService {

    @Value("${files.upload.path}")
    private String uploadPath;
    /**
     上传文件
     @return String 文件的访问路径
     @throws IOException IO异常
     */
    @Override
    public String upload(MultipartFile file) throws IOException {
        //获取文件名
        String originalFilename = file.getOriginalFilename();
        //获取文件后缀
        String type = FileUtil.extName(originalFilename);
        //获取文件大小
        long size = file.getSize();
        //获取文件的父目录
        File upLoadParentFile = new File(uploadPath);
        //判断父目录是否存在
        if (!upLoadParentFile.exists()) {
            upLoadParentFile.mkdirs();
        }

        //定义一个文件的唯一的一个标识码
        String uuid = IdUtil.fastSimpleUUID();
        //文件的唯一标识码+文件的后缀
        String FileUuid = uuid + "." + type;

        //实际上传文件的路径
        File upLoadFile = new File(uploadPath + FileUuid);
        //获取文件的md5,用于判断文件是否存在
        String md5 = SecureUtil.md5(file.getInputStream());
        //文件的访问路径
        String Url;
        //判断文件是否存在,如果存在,则直接返回文件的访问路径
        Files one = getFilesMd5(md5);
        if (one != null) {
            return one.getUrl();
        } else {
            //将文件写入到指定的路径
            file.transferTo(upLoadFile);
            Url = "http://localhost:8181/file/download/" + FileUuid;
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

    /**
        下载文件
        @param fileUuid 文件的唯一标识码
        @param response 响应对象
        @return String 文件的唯一标识码
     */
    @Override
    public Result download(String fileUuid, HttpServletResponse response) throws IOException {
        //根据文件的唯一标识码查询文件信息
        File file = new File(uploadPath + fileUuid);
        //设置响应头,告诉浏览器下载文件
        ServletOutputStream os = response.getOutputStream();
        //将文件写入到响应流中
        response.setHeader("content-disposition", "attachment;filename=" + URLEncoder.encode(fileUuid, "UTF-8"));
        //设置响应类型
        response.setContentType("application/octet-stream");
        //读取上传的文件,写入到响应流中
        os.write(FileUtil.readBytes(file));
        //刷新流
        os.flush();
        //关闭流
        os.close();
        return Result.success("下载成功");
    }
    /**
    查询文件的md5
    @return Files
     */
    private Files getFilesMd5(String md5){
        QueryWrapper<Files> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("md5", md5);
        Files one = this.getOne(queryWrapper);
        if (one != null) {
            return one;
        } else {
            return null;
        }
    }
}

```

 创建对应的`Mapper,Mapper.xml,IService，ServiceImpl`

## element-ui的upload添加header

1. 添加：header属性

```vue
<el-upload
    class="avatar-uploader"
    action="http://localhost:8181/file/upload"
    :headers="headersO"
    :show-file-list="false"
    :on-success="handleAvatarSuccess">
  <img v-if="form.avatar" :src="form.avatar" class="avatar">
  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
</el-upload>
```

2. 设置headersO

```js
computed:{
  headersO(){
    const token = this.user.token
    return {
      token: token
    }
  }
},
```



# 问题：

## mybatis-plus

### 1

#### 描述：

改用 mybatis-plus 之后，改用 updateOrSave 或者 updateById 都会

报错：can not execute. because can not find cache of TableInfo for entity!

@TableName 和@TableId 都加了也不行

#### 解决：

降低 springboot 的版本

## 2 request 未定义

### 描述：

定义 request.js , 使用 Vue.prototype.request = request;引入

使用 request 报错：未定义![image-20231004164521605](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004164521605.png)

解决：

1. import request from '@/utils/request.js'
2. 使用时加 this![image-20231004164721465](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231004164721465.png)
