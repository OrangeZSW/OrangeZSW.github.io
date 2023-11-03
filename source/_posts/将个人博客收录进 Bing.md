---
title: 将个人博客收录进 Bing
date: 2023-05-4
categories: Records
tags: Bing
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/%E5%B0%86%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%94%B6%E5%BD%95%E8%BF%9B%20Bing.png
---

# Bing 收录个人博客

## :gear:配置

​	:one:[登录必应网站管理](https://www.bing.com/webmasters/about)

​	:two:选择从 GSC 导入

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/%E5%B0%86%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%94%B6%E5%BD%95%E8%BF%9BBing/20230504222950.png)

​	:three: 将下载到的 xml 文件放入网站资源文件夹的根目录下，比如我的是 Hexo 的 source 文件夹下。

​	:four:然后三部曲将网站重新部署，hexo clean 、hexo g、hexo d

​	:five:重新部署之后就可以验证了，这样就可以搜索到网站了。

## :arrow_double_up:优化

### 添加网站地图

1. 生成网站地图。我的是 hexo 的，要下载一个工具。

2. 打开 hexo 目录执行以下命令，会自动生成 sitemap.xml

```sh
npm install hexo-generator-sitemap --save

# 部署

hexo clean
hexo g
hexo deploy
```

3. 提交网站地图

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/%E5%B0%86%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%94%B6%E5%BD%95%E8%BF%9BBing/20230504222912.png)

4. 提交成功之后几分钟就好了

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/posts/%E5%B0%86%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%94%B6%E5%BD%95%E8%BF%9BBing/20230504223031.png)

5. 提交成功后，想要去 bing 搜索自己网站上面的文章，可以去 search.xml 文件里面复制你自己写的一些文章段落，搜到的概率会大一点。
