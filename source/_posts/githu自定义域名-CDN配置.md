---
title: githu自定义域名&CDN配置
date: 2023-10-11 11:02:41
tags:
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/cdn.png
---

# github 自定义域名

1. ## DNS 配置

   ![image-20231011110553135](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231011110553135.png)

Github的自定义域名：[官方文档](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

如果想自定义自己的根域名，那么就要添加A记录，记录为@

如果只是子域名，那就只需要CNAME记录就行了

```sh
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

A 记录的 IP 地址可以通过 Ping YOUNAME.github.io 得到

2. ## CNAME

在 github 项目的根目录下新建文件 CNAME，里面填写自己的域名就行了

![image-20231011111121147](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231011111121147.png)

3. SAVE

在 github 的项目 setting->Pages 下面，在里面填入自己的域名，然后 Save 就行了。

下面有个 Enforce HTTPS，自动申请，可以打开也可以不打开（如果要配置 CDN 好像不能打开，但是我打开了也配置了 CDN 没出现问题）

![image-20231011111313458](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231011111313458.png)

# CDN 配置

## 注意

因为配置cdn需要一条CNAME，且记录为@。当你设置自定义的域名为根域名时，那么你的dns解析里面肯定有一条A记录，记录为@（详情看上面自定义域名配置）

此时就会冲突，因此如果想加速根域名，不会。

不过有一种平替的方法，加速子域名www.根域名，当你访问根域名时，github会重定向到www.根域名。这样根域名也可以访问。

[官方文档：](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

![image-20231012194245918](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231012194245918.png)

## dns解析

![image-20231012194820619](./githu%E8%87%AA%E5%AE%9A%E4%B9%89%E5%9F%9F%E5%90%8D-CDN%E9%85%8D%E7%BD%AE_image/image-20231012194820619.png)

## cdn的配置：

##### 源站ip：

```bash
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

端口：

自定义域名时勾选了HTTPS就选443，没有勾就填80

![image-20231012195018683](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231012195018683.png)

回源HOST：

填自己的加速域名就行了

![image-20231012195228129](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231012195228129.png)
