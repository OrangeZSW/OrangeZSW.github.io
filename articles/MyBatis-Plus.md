---
title: MyBatis-Plus
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# MyBatis-Plus

## 逻辑删除

**逻辑删除功能**

由于数据库中所有表均采用逻辑删除策略，所以查询数据时均需要增加过滤条件is_deleted=0。

上述操作虽不难实现，但是每个查询接口都要考虑到，也显得有些繁琐。为简化上述操作，可以使用Mybatis-Plus提供的逻辑删除功能，它可以自动为查询操作增加is_deleted=0过滤条件，并将删除操作转为更新语句。具体配置如下，详细信息可参考官方文档。

### 方法一

在application.yml中增加如下内容

``` yml
  mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: is_deleted # 全局逻辑删除的实体字段名(配置后可以忽略不配置步骤二)
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)
```

### 方法二

在实体类中的删除标识字段上增加@TableLogic注解

``` java
  @Data
public class BaseEntity {

    @Schema(description = "主键")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "创建时间")
    @JsonIgnore
    private Date createTime;

    @Schema(description = "更新时间")
    @JsonIgnore
    private Date updateTime;

    @Schema(description = "逻辑删除")
    @JsonIgnore
    @TableLogic
    @TableField("is_deleted")
    private Byte isDeleted;

}
```

## 忽略特定字段

通常情况下接口响应的Json对象中并不需要create_time、update_time、is_deleted等字段，这时只需在实体类中的相应字段添加@JsonIgnore注解，该字段就会在序列化时被忽略。

具体配置如下，详细信息可参考Jackson官方文档。

```java
@Data
public class BaseEntity {

    @Schema(description = "主键")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "创建时间")
    @JsonIgnore
    @TableField(value = "create_time")
    private Date createTime;

    @Schema(description = "更新时间")
    @JsonIgnore
    @TableField(value = "update_time")
    private Date updateTime;

    @Schema(description = "逻辑删除")
    @JsonIgnore
    @TableField("is_deleted")
    private Byte isDeleted;

}
```

## 配置自动填充

创建一个配置类`MybatisMetaObjectHandler`

```java
@Component
public class MybatisMetaObjectHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", Date.class, new Date());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", Date.class, new Date());
    }
}
```

