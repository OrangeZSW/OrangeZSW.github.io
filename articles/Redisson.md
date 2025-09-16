---
title: Redisson
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


# Redisson实现

## 1.导入依赖

```xml
<!-- redisson -->
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
</dependency>
```

## 2. 配置类

```java
@Data
@Configuration
@ConfigurationProperties("spring.data.redis")
public class RedissonConfig {

    private String host;

    private String password;

    private String port;

    private int timeout = 3000;
    private static String ADDRESS_PREFIX = "redis://";

    /**
     * 自动装配
     *
     */
    @Bean
    RedissonClient redissonSingle() {
        Config config = new Config();

        if(StringUtils.isEmpty(host)){
            throw new RuntimeException("host is  empty");
        }
        //  redis://192.168.6.133:6379
        SingleServerConfig serverConfig = config.useSingleServer()
                .setAddress(ADDRESS_PREFIX + this.host + ":" + port)
                .setTimeout(this.timeout);

        if(!StringUtils.isEmpty(this.password)) {
            serverConfig.setPassword(this.password);
        }
        return Redisson.create(config);
    }
}
```

## 3. 锁使用

```java
@Override
public void getAlbumInfoById(Long id) {
    //............
    //创建锁
    String lockKey = ":lock";
    RLock lock = redissonClient.getLock(lockKey);
    boolean ifAbsent = lock.tryLock(3, 10, TimeUnit.SECONDS);
    if(ifAbsent) { //加锁成功
        try {
            //..............
        } finally {
            //解锁，释放锁
            lock.unlock();
        }
    }
}
```

## 4. 布隆过滤器的使用

```java
  //初始化布隆过滤器
        RBloomFilter<Object> bloomFilter = redissonClient.getBloomFilter("sku:bloom:filter");
        //设置数据规模 误判率 预计统计元素数量为100000，期望误差率为0.01
        bloomFilter.tryInit(100000, 0.01);

        //测试使用，快速自动加入
        List<ProductSku> productSkuList = productSkuMapper.selectList(null);
        productSkuList.forEach(item -> {
            bloomFilter.add(item.getId());
        });
				
				
				----------------------------------------------------------------------------------------------------------
				
				//远程调用商品微服务接口之前 提前知道用户访问商品SKUID是否存在与布隆过滤器
    RBloomFilter<Object> bloomFilter = redissonClient.getBloomFilter("sku:bloom:filter");
    if (!bloomFilter.contains(skuId)) {
        log.error("用户查询商品sku不存在：{}", skuId);
        //查询数据不存在直接返回空对象
        throw new ServiceException("用户查询商品sku不存在");
    }
```