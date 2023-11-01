---
title: Alist 搭建个人网盘挂载本地文件
date: 2023-05-25
categories: Records
tags: Alist
cover:https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/alist.jpg
---

# windows 版本部署 ALis

## :arrow_down:下载：

下载地址：https://github.com/alist-org/alist/releases

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525212652.png)

下载之后解压打开

![image_2](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525212801.png)

## 运行

1. 在解压之后的那个目录下面打开 cmd，输入：.\alist.exe server 运行程序

```sh
.\alist.exe server
```

2. 查看用户名和密码：

```sh
.\alist.exe admin
```

![iamge_3](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525213431.png)

3. 再次运行 alist：在 alist 目录下打开 cmd 运行

```sh
#再次启动alist
alist start
```

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525213842.png)

4. 打开浏览器输入：127.0.0.1:5244

```sh
127.0.0.1:5244
```

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525214336.png)

5. 修改密码：点击页面下面的管理

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525214426.png)

## 挂载本地文件

1. 添加存储

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525215146.png)

2. 设置你要挂载本地文件的路径：比如我要挂载 D:\IDM\ 下载

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525215434.png)

3. 提交即可，如图即挂载成功

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525215727.png)

4. 挂载成功

![](https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/20230525215813.png)

## 为 AList 添加快捷启动和暂停

在 alist 目录下建两个文本，后缀改为 vbs，发送快捷方式到桌面即可。

start.vbs

```vbscript
#快捷运行

Dim ws
Set ws = Wscript.CreateObject("Wscript.Shell")
ws.run "alist.exe server",vbhide
Wscript.quit
```

stop.vbs

```vbscript
#快捷暂停

Dim ws
Set ws = Wscript.CreateObject("Wscript.Shell")
ws.run "taskkill /f /im alist.exe",0
Wscript.quit

```

## 挂载阿里云盘

官方文档地址：[阿里云盘 Open | AList 文档 (nn.ci)](https://alist.nn.ci/zh/guide/drivers/aliyundrive_open.html)

## 外网访问

如果没有云服务器，可以通过内网穿透的方式达到外网访问

樱花穿透：[SakuraFrp (natfrp.com)]([SakuraFrp (natfrp.com)](https://www.natfrp.com/user/))
