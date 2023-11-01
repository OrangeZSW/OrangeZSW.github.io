---
title: Swagger
date: 2023-11-01 16:55:45
categories: 学习
tags: Swagger
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/swagger.png
---

## swagger3 配置

[swagger官网](https://swagger.io/)

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
