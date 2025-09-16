---
title: canal的使用
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# canal的使用

>由于canal的starter只支持spring 2.x
>建议重新建个模块

### 1.依赖

```xml
<dependency>
	<groupId>top.javatool</groupId>
	<artifactId>canal-spring-boot-starter</artifactId>
	<version>1.2.1-RELEASE</version>
</dependency>
<dependency>
	<groupId>javax.persistence</groupId>
	<artifactId>persistence-api</artifactId>
	<version>1.0</version>
</dependency>
```

### 2.配置文件

```yml
server:
  port: 7080
#canal配置
canal:
  destination: tingshuTopic   # 部署canal时指定的话题
  server: 192.168.1.129:11111
```


### 3.监听的实体类

> 指定监听的列

```java
package com.atguigu.tingshu.cdc.entity;

import lombok.Data;

import javax.persistence.Column;

/**
 * @author orange
 * @since 2024/11/3
 */
@Data
public class AlbumInfoCDC {
    @Column(name = "id")
    private Long id;
}

```

### 3.监听处理器

> @CanalTable("album_info") 指定监听 的表

```java
package com.atguigu.tingshu.cdc.Handler;

import com.atguigu.tingshu.cdc.constants.RedisConstant;
import com.atguigu.tingshu.cdc.entity.AlbumInfoCDC;
import lombok.extern.slf4j.Slf4j;
import online.zorange.cache.constants.CacheConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import top.javatool.canal.client.annotation.CanalTable;
import top.javatool.canal.client.handler.EntryHandler;

/**
 * @author orange
 * @since 2024/11/3
 */
@Component
@CanalTable("album_info")
@Slf4j
public class AlbumInfoHandler implements EntryHandler<AlbumInfoCDC> {
    @Autowired
    StringRedisTemplate redisTemplate;


    @Override
    public void insert(AlbumInfoCDC albumInfoCDC) {
        log.info("监听到表albumInfo新增数据:{}", albumInfoCDC.getId());
        //1. 直接操作redis
        redisTemplate.delete(CacheConstants.REDIS_CACHE + ":" + RedisConstant.ALBUM_INFO_PREFIX + albumInfoCDC.getId());

        //1.1 延迟删除...
        //2. 发生消息
    }

    @Override
    public void update(AlbumInfoCDC before, AlbumInfoCDC after) {

        Boolean delete = redisTemplate.delete(CacheConstants.REDIS_CACHE + ":" + RedisConstant.ALBUM_INFO_PREFIX + after.getId());
        log.info("监听到表albumInfo更新数据:{}-->{}", before.getId(), after.getId());
        System.out.println("CacheConstants.REDIS_CACHE + \":\" + RedisConstant.ALBUM_INFO_PREFIX + after.getId() = " + CacheConstants.REDIS_CACHE + ":" + RedisConstant.ALBUM_INFO_PREFIX + after.getId());

    }

    @Override
    public void delete(AlbumInfoCDC albumInfoCDC) {
        redisTemplate.delete(CacheConstants.REDIS_CACHE + ":" + RedisConstant.ALBUM_INFO_PREFIX + albumInfoCDC.getId());

        log.info("监听到表albumInfo删除数据:{}", albumInfoCDC.getId());
    }
}

```













