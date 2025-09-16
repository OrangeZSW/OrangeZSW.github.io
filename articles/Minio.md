---
title: Minio
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# MinioConfig
minio操作：1.上传  2.生命周期等

```java
package online.orange.blog.web.config;

import io.minio.*;
import io.minio.messages.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import online.orange.blog.common.constants.FilePath;
import online.orange.blog.common.dto.MinioUploadDto;
import online.orange.blog.util.ByteUtil;
import online.orange.blog.util.HttpUtil;
import online.orange.blog.util.SecurityContextHolder;
import online.orange.blog.util.StringUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;

@Slf4j
@Configuration
@Data
@ConfigurationProperties(prefix = "minio")
public class MinioConfig {
    @Value("${minio.endpoint}")
    private String endpoint;
    @Value("${minio.accessKey}")
    private String accessKey;
    @Value("${minio.secretKey}")
    private String secretKey;
    @Value("${minio.bucketName}")
    private String bucketName;
    @Value("${minio.baseUrl}")
    private String baseUrl;

    public final static String AUTO_DELETE_TAG_KEY = "auto-delete";
    //自动删除规则
    public final static LifecycleRule autoDeleteRule = new LifecycleRule(
            Status.ENABLED,
            null,
            new Expiration(
                    (ResponseDate) null,
                    7,
                    (Boolean) null
            ),
            new RuleFilter(new Tag(AUTO_DELETE_TAG_KEY, "true")),
            null,
            null,
            null,
            null
     );

    @Bean
    public MinioClient getMinioClient(){
        List<LifecycleRule> rules = new LinkedList<>();
        rules.add(autoDeleteRule);
        LifecycleConfiguration lifecycleConfiguration = new LifecycleConfiguration(rules);
        log.info("初始化minio");
        MinioClient build = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
        LifecycleConfiguration lifecycle = getLifecycle(build);
        if (lifecycle == null){
            setLifecycle(lifecycleConfiguration,build);
        }
        visualizeLifecycle(lifecycle);
        return build;
    }

    public String upload(MinioUploadDto uploadDto) {
        MinioClient minioClient = this.getMinioClient();
        InputStream inputStream = null;
        MultipartFile file = null;
        try {
            file=replaceUrl(uploadDto.getFile());
            byte[] bytes = file.getBytes();
            String originalFilename = file.getOriginalFilename();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(this.getBucketName())
                    .object(String.join("/",uploadDto.getPath()))
                    .stream(new ByteArrayInputStream(bytes), bytes.length, -1)
                    .headers(getHeaders(originalFilename))
                    .tags(uploadDto.getTags())
                    .build());
        } catch (Exception e) {
            log.error("上传文件失败", e);
        }
        return String.join("/", this.getBaseUrl(),this.getBucketName(), uploadDto.getPath());
    }

    /**
     * 根据文件类型返回头信息
     */
    public Map<String, String> getHeaders(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        Map<String, String> headers = new HashMap<>();

        // 1. 设置 Content-Type
        switch (extension) {
            case "png":
                headers.put("Content-Type", "image/png");
                break;
            case "jpg":
            case "jpeg":
                headers.put("Content-Type", "image/jpeg");
                break;
            case "gif":
                headers.put("Content-Type", "image/gif");
                break;
            case "md":
                headers.put("Content-Type", "text/markdown"); // 明确标记 markdown 类型
                break;
            default:
                headers.put("Content-Type", "application/octet-stream");
        }

        // 2. 非图片类文件强制下载
        if (!extension.matches("png|jpg|jpeg|gif|bmp")) {
            headers.put("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        }

        return headers;
    }

    /**
     * 移除对象的所有标签
     */
    public void removeAllTags(String url) {
        String domain = StringUtil.getDomain(url);
        if (!domain.equals(baseUrl)){
            log.info("非本站域名图片");
            return;
        }
        setTags(url, new HashMap<>());
    }

    /**
     * 获取对象标签
     */
    public Map<String, String> getTags(String url) {
        String path= getObjectPath(url);
        MinioClient minioClient = getMinioClient();
        try {
            Tags objectTags = minioClient.getObjectTags(
                    GetObjectTagsArgs.builder()
                            .bucket(getBucketName())
                            .object(path)
                            .build());
            return objectTags.get();
        } catch (Exception e) {
            log.error("获取对象标签失败", e);
        }
        return null;
    }

    /**
     * 根据url获取路径
     */

    public String getObjectPath(String url) {
        // 获取路径
        return url.substring(url.indexOf(bucketName)+bucketName.length()+1);
    }
    /**
     * setTags
     */
    public void setTags(String url, Map<String, String> tags) {
        MinioClient minioClient = getMinioClient();
        try {
            SetObjectTagsArgs build = SetObjectTagsArgs.builder()
                    .bucket(getBucketName())
                    .object(getObjectPath(url))
                    .tags(tags)
                    .build();
            minioClient.setObjectTags(build);
        } catch (Exception e) {
            log.error("设置对象标签失败", e);
        }
    }

    /**
     * 获取生命周期
     */
    public LifecycleConfiguration getLifecycle(MinioClient minioClient) {
        try {
            return minioClient.getBucketLifecycle(
                    GetBucketLifecycleArgs.builder()
                            .bucket(bucketName)
                            .build());
        } catch (Exception e) {
            log.error("获取生命周期失败", e);
        }
        return null;
    }
    /**
     * 设置生命周期
     */
    public void setLifecycle(LifecycleConfiguration lifecycle,MinioClient minioClient) {
        try {
            minioClient.setBucketLifecycle(
                    SetBucketLifecycleArgs.builder()
                            .bucket(bucketName)
                            .config(lifecycle)
                            .build());
        } catch (Exception e) {
            log.error("设置生命周期失败", e);
        }
    }
    /**
     * 清除生命周期
     */
    public void clearLifecycle() {
        MinioClient minioClient = getMinioClient();
        try {
            minioClient.deleteBucketLifecycle(
                    DeleteBucketLifecycleArgs.builder()
                            .bucket(bucketName)
                            .build());
        } catch (Exception e) {
            log.error("清除生命周期失败", e);
        }

    }
    /**
     * 可视化生命周期
     */
    public void visualizeLifecycle(LifecycleConfiguration lifecycle) {
        if (lifecycle == null) {
            System.out.println("该存储桶未设置生命周期规则");
            return;
        }
        List<LifecycleRule> rules = lifecycle.rules();
        System.out.printf("=== 发现 %d 条生命周期规则 ===%n%n", rules.size());
        for (int i = 0; i < rules.size(); i++) {
            LifecycleRule rule = rules.get(i);

            // 规则基本信息
            System.out.printf("┌────── 规则 #%d ───────%n", i + 1);
            System.out.printf("│ ID: %s%n", rule.id() != null ? rule.id() : "(未指定)");
            System.out.printf("│ 状态: %s%n", rule.status());

            // 过滤条件
            System.out.print("│ 适用范围: ");
            if (rule.filter() != null) {
                if (rule.filter().prefix() != null) {
                    System.out.print("前缀[" + rule.filter().prefix() + "] ");
                }
                if (rule.filter().tag() != null) {
                    System.out.print("标签[" + rule.filter().tag().key() + "="
                            + rule.filter().tag().value() + "] ");
                }
            } else {
                System.out.print("全部对象");
            }
            System.out.println();

            // 过期设置
            System.out.print("│ 对象过期: ");
            if (rule.expiration() != null) {
                if (rule.expiration().days() != null) {
                    System.out.println(rule.expiration().days() + "天后删除");
                } else if (rule.expiration().date() != null) {
                    System.out.println("在 " + rule.expiration().date() + " (GMT午夜) 删除");
                } else if (rule.expiration().expiredObjectDeleteMarker() != null) {
                    System.out.println("删除标记: " + rule.expiration().expiredObjectDeleteMarker());
                }
            } else {
                System.out.println("未设置");
            }

            // 分段上传设置
            System.out.print("│ 分段上传: ");
            if (rule.abortIncompleteMultipartUpload() != null) {
                System.out.println(rule.abortIncompleteMultipartUpload().daysAfterInitiation()
                        + "天后中止未完成的上传");
            } else {
                System.out.println("不自动中止");
            }

            // 非当前版本设置
            System.out.print("│ 非当前版本: ");
            if (rule.noncurrentVersionExpiration() != null) {
                System.out.print(rule.noncurrentVersionExpiration().noncurrentDays() + "天后删除");
                if (rule.noncurrentVersionTransition() != null) {
                    System.out.print("，"+ rule.noncurrentVersionTransition().noncurrentDays()
                            + "天后转为" + rule.noncurrentVersionTransition().storageClass());
                }
            } else if (rule.noncurrentVersionTransition() != null) {
                System.out.print(rule.noncurrentVersionTransition().noncurrentDays()
                        + "天后转为" + rule.noncurrentVersionTransition().storageClass());
            } else {
                System.out.print("无设置");
            }
            System.out.println();

            // 存储类型转换
            System.out.print("│ 存储转换: ");
            if (rule.transition() != null) {
                System.out.println(rule.transition().days() + "天后转为"
                        + rule.transition().storageClass());
            } else {
                System.out.println("无设置");
            }

            System.out.println("└─────────────────────%n");
        }
    }
    /**
     * 获取所有带有 AUTO_DELETE_TAG_KEY 标签的 对象的url
     */
    public List<String> getObjectByTag(String key) {
        MinioClient minioClient = getMinioClient();
        List<String> urls = new ArrayList<>();

        try {
            // 1. 列出所有对象
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucketName)
                            .recursive(true)  // 递归列出所有子目录
                            .build());

            // 2. 遍历并检查标签
            for (Result<Item> result : results) {
                Item item = null;
                try {
                    item = result.get();
                    String objectName = item.objectName();

                    // 获取对象标签
                    Tags tags = minioClient.getObjectTags(
                            GetObjectTagsArgs.builder()
                                    .bucket(bucketName)
                                    .object(objectName)
                                    .build());

                    // 检查是否包含目标标签
                    if (tags != null && tags.get().containsKey(key)) {
                        String url = baseUrl + "/" + bucketName + "/" + objectName;
                        urls.add(url);
                    }
                } catch (Exception e) {
                    log.warn("处理对象 {} 时出错: {}", item.objectName(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("获取带 {} 标签的对象列表失败", key, e);
            throw new RuntimeException("查询失败", e);
        }

        return urls;
    }
    /**
     * 删除对象
     */
    public void removeObject(String url) {
        MinioClient minioClient = getMinioClient();
        try {
            String objectName = getObjectPath(url);
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            log.error("删除对象 {} 失败", url, e);
            throw new RuntimeException("删除失败", e);
        }
    }
    /**
     * 获取对象文件
     */
    public byte[] getObjectByte(String url) {
        MinioClient minioClient = getMinioClient();
        try {
            String objectName = getObjectPath(url);
            GetObjectArgs args = GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build();
            try (GetObjectResponse response = minioClient.getObject(args)) {
                return response.readAllBytes();
            }
        } catch (Exception e) {
            log.error("获取对象 {} 失败", url, e);
            throw new RuntimeException("获取失败", e);
        }
    }
    /**
     * 获取对象文件
     */
    public String getObjectString(String url) {
        MinioClient minioClient = getMinioClient();
        try {
            String objectName = getObjectPath(url);
            GetObjectArgs args = GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build();
            try (GetObjectResponse response = minioClient.getObject(args)) {
                return new String(response.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("获取对象 {} 失败", url, e);
            throw new RuntimeException("获取失败", e);
        }
    }

    /**
     * 替换文件中所有非本站图片地址
     */
    public MultipartFile replaceUrl(MultipartFile file) {
        if (!file.getOriginalFilename().endsWith(".md")) {
            return file;
        }
        try {
            String modifiedContent = new String(file.getBytes(), StandardCharsets.UTF_8);

            List<String> urls = ByteUtil.getUrls(file.getBytes());
            for (String url : urls) {
                try {
                    if (!isLocalImage(url)) {
                        InputStream inputStream = HttpUtil.getInputStream(url);
                        MinioUploadDto build = MinioUploadDto.builder().build();
                        build.setFile(inputStream, getUrlOriginalFilename(url));
                        build.setPath(String.format(FilePath.ARTICLE_IMAGE_PATH,
                                SecurityContextHolder.getUserAccount().getId()));
                        String newUrl = upload(build);
                        log.info("替换图片地址：{}->{}", url, newUrl);
                        modifiedContent = modifiedContent.replace(url, newUrl);
                    }
                } catch (IOException e) {
                    log.warn("获取图片 {} 失败", url, e);
                }
            }

            byte[] newBytes = modifiedContent.getBytes(StandardCharsets.UTF_8);
            return new CustomMultipartFile(
                    file.getName(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    newBytes
            );
        } catch (IOException e) {
            throw new RuntimeException("处理文件失败", e);
        }
    }

    public String getUrlByObjectPath(String objectPath) {
        return String.join("/", baseUrl,bucketName, objectPath);
    }

    // Helper class to create a new MultipartFile
    static class CustomMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        public CustomMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content;
        }

        @Override
        public String getName() { return name; }

        @Override
        public String getOriginalFilename() { return originalFilename; }

        @Override
        public String getContentType() { return contentType; }

        @Override
        public boolean isEmpty() { return content == null || content.length == 0; }

        @Override
        public long getSize() { return content.length; }

        @Override
        public byte[] getBytes() { return content; }

        @Override
        public InputStream getInputStream() { return new ByteArrayInputStream(content); }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            Files.write(dest.toPath(), content);
        }
    }

    /**
     * 判断是否为本站图片
     */
    public boolean isLocalImage(String url) {
        String domain = StringUtil.getDomain(url);
        return domain.equals(baseUrl);
    }
    /**
     * 获取url中文件文件名包括后缀
     * https://server.blog.zorange.online/files/2d1407371ac5449c993b53caeabdcb65.md
     * return 2d1407371ac5449c993b53caeabdcb65.md
     */
    public String getUrlOriginalFilename(String url) {
        return url.substring(url.lastIndexOf("/") + 1);
    }
}

```