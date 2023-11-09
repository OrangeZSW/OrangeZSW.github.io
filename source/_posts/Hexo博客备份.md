---
title: Hexo博客备份
date: 2023-10-13 09:26:16
categories: Records
tags: Hexo
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/hexo%E5%A4%87%E4%BB%BD.png
---

## 准备

{%note danger no-icon%}
先备份！！！
{%endnote%}
将 github 发布 pages 的页面主分支改名为 Hexo，再创建一个分支 main。

然后在将 Hexo 博客发布在 main 分支下，改\_config.yml 下的配置，然后将发布 pages 的分支改为 main。

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231013093125128.png)

## 开始

1. 使用 vscode 将 youname.github.io 克隆下来,然后将里面的文件全删除，提交。
2. 将先备份的 hexo 文件夹中的`_config.yml`、`themes/`、`source`、`scaffolds`、`package.json`、`.gitignore`复制进去。
3. 将 theme 中你的主题的.git/删除,不然不能上传。
4. 执行：`npm install`和`npm install hexo-deployer-git`
5. 提交。

## 最后

每次改变 hexo 源文件的时候，就可以上传到 hexo 分支下。生成的静态文件不会。gitignoer 里面写了。

部署的静态文件就会在 main 分支下。
