``` java
  package com.atguigu.jxc.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;

/**
 * @author orange
 * @since 2024/11/17
 */
public class JSONUtil {
    static final ObjectMapper objectMapper = new ObjectMapper();

    public static <T> T StringToObject(String str, Class<T> objectClass) {
        try {
            return objectMapper.readValue(str, objectClass);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static String ObjectToString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }


    public static <T> List<T> StrToArrayObject(String str, Class<T> arrayObjectClass) {
        try {
            // 使用 TypeReference 来指定转换为 List 或数组的类型
            return objectMapper.readValue(str, new TypeReference<T>() {
            });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


}

```

