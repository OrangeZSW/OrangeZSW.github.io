---
title: Hexo博客备份
date: 2023-10-13 09:26:16
type: Records
tags:Hexo
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/hexo%E5%A4%87%E4%BB%BD.png
---

## 准备

先备份！！！

将github发布pages的页面主分支改名为Hexo，再创建一个分支main。

然后在将Hexo博客发布在main分支下，改_config.yml下的配置，然后将发布pages的分支改为main。

![image-20231013093125128](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231013093125128.png)

## 开始

1. 使用vscode将youname.github.io克隆下来,然后将里面的文件全删除，提交。
2. 将先备份的hexo文件夹中的`_config.yml`、`themes/`、`source`、`scaffolds`、`package.json`、`.gitignore`复制进去。
3. 将theme中你的主题的.git/删除,不然不能上传。
4. 执行：`npm install`和`npm install hexo-deployer-git`
5.  提交。

## 最后

每次改变hexo源文件的时候，就可以上传到hexo分支下。生成的静态文件不会。gitignoer里面写了。

部署的静态文件就会在main分支下。





