---
title: 类型转换器（Converter）
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# 类型转换器（Converter）

>在前端传进后端的是一个字符串类型时，但是后端获取的是一个枚举类，此时后端获取不到对应枚举类对象
>
>此时就需要使用Coverter 来将String转换为枚举类对象

## 自定义转换器方法

- 枚举类`ItemType`

  ```JAVA
  public enum ItemType {
  
      APARTMENT(1, "公寓"),
      ROOM(2, "房间");
  
      @Jsonvalue
      private Integer code;
      private String name;
  
      ItemType(Integer code, String name) {
          this.code = code;
          this.name = name;
      }
  }
  ```

1. 定义转换器方法`StringToItemTypeConverter`

   ```java
   @Component
   public class StringToItemTypeConverter implements Converter<String, ItemType> {
       @Override
       public ItemType convert(String code) {
   
           for (ItemType value : ItemType.values()) {
               if (value.getCode().equals(Integer.valueOf(code))) {
                   return value;
               }
           }
           throw new IllegalArgumentException("code非法");
       }
   }
   ```

2. 将转换器方法注册到webMvcConfiguration中，

   ```java
   @Configuration
   public class WebMvcConfiguration implements WebMvcConfigurer {
   
       @Autowired
       private StringToItemTypeConverter stringToItemTypeConverter;
   
       @Override
       public void addFormatters(FormatterRegistry registry) {
           registry.addConverter(this.stringToItemTypeConverter);
       }
   }
   ```



## 自定义转换器工厂

> 当多个枚举类要进行转换时，可以使用工厂统一转换

1. 要求：继承同一个枚举类`BaseEnum`

   ```java
   public interface BaseEnum {
       Integer getCode();
       String getName();
   }
   ```

2. 定义枚举类工厂

   ```java
   @Component
   public class StringToBaseEnumConverterFactory implements ConverterFactory<String, BaseEnum> {
       
       @Override
       public <T extends BaseEnum> Converter<String, T> getConverter(Class<T> targetType) {
           return new Converter<String, T>() {
               @Override
               public T convert(String source) {
   				//Class.getEnumConstants() 方法是 Java 反射 API 中的一个方法，用于获取表示枚举类型的 Class 对象中所有枚举常量的数组
                   for (T enumConstant : targetType.getEnumConstants()) {
                       if (enumConstant.getCode().equals(Integer.valueOf(source))) {
                           return enumConstant;
                       }
                   }
                   throw new IllegalArgumentException("非法的枚举值:" + source);
               }
           };
       }
   }
   ```

3. 注册枚举类工厂

   ```java
   @Configuration
   public class WebMvcConfiguration implements WebMvcConfigurer {
   
       @Autowired
       private StringToBaseEnumConverterFactory stringToBaseEnumConverterFactory;
   
       @Override
       public void addFormatters(FormatterRegistry registry) {
           registry.addConverterFactory(this.stringToBaseEnumConverterFactory);
       }
   }
   ```

##  HTTPMessageConverter枚举类型转换

`HttpMessageConverter`依赖于Json序列化框架（默认使用Jackson）。其对枚举类型的默认处理规则也是枚举对象实例（ItemType.APARTMENT）和实例名称（"APARTMENT"）相互映射。不过其提供了一个注解`@JsonValue`，同样只需在`ItemType`枚举类的`code`属性上增加一个注解`@JsonValue`，Jackson便可完成从`ItemType`对象到`code`属性之间的互相映射。具体配置如下，详细信息可参考Jackson[官方文档](https://fasterxml.github.io/jackson-annotations/javadoc/2.8/com/fasterxml/jackson/annotation/JsonValue.html)。

> 当将枚举类发送给前端时，使用@Jsonvalue可以，指定返回枚举对象中的字段

# TypeHandler（类型处理器）

> 从持久层到数据库，当数据库存储的是一个String 或其他 字面量，持久层穿入的是枚举类，此时也需要进行类型处理，使用的是TypeHandler，MybatisPlus提供的



MybatisPlus提供了一个@EnumValue注解，将枚举类转换为字面量。