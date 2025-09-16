---
title: MD5Util
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


```java

@Slf4j
public class Md5Util {


    /**
     * 根据文件生成md5
     */
    public static String getFileMD5(MultipartFile file) {
        try {
           return DigestUtils.md5Hex(file.getInputStream());
        } catch (Exception e) {
            log.error("getFileMD5 error",e);
        }
        log.info("使用文件name");
        return file.getOriginalFilename();

    }
    /**
     * 根据文件流生成md5
     */
    public static String getFileMD5(byte[] bytes) {
        try {
            return DigestUtils.md5Hex(bytes);
        } catch (Exception e) {
            log.error("getFileMD5 error",e);
        }
        return null;
    }
}
```