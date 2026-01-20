---
title: Alist 搭建个人网盘挂载本地文件
date: 2023-05-25
categories: Records
tags: Alist
cover: http://orange-note-img.oss-cn-wuhan-lr.aliyuncs.com/blog/alist.jpg
---

# windows 版本部署 ALis

## :arrow_down:下载：

{%note info no-icon%}下载地址：https://github.com/alist-org/alist/releases{%endnote%}

![image-20260121011229023](http://120.26.79.238:9000/blog/img/image-20260121011229023.png)

下载之后解压打开

![image-20260121011311789](http://120.26.79.238:9000/blog/img/image-20260121011311789.png)

## :running:运行

1. 在解压之后的那个目录下面打开 cmd，输入：.\alist.exe server 运行程序

```sh
.\alist.exe server
```

2. 查看用户名和密码：

```sh
.\alist.exe admin
```

![image-20260121011350310](http://120.26.79.238:9000/blog/img/image-20260121011350310.png)

3. 再次运行 alist：在 alist 目录下打开 cmd 运行

```sh
#再次启动alist
alist start
```

![image-20260121011409219](http://120.26.79.238:9000/blog/img/image-20260121011409219.png)

4. 打开浏览器输入：127.0.0.1:5244

```sh
127.0.0.1:5244
```

![image-20260121011550827](http://120.26.79.238:9000/blog/img/image-20260121011550827.png)

5. 修改密码：点击页面下面的管理

![image-20260121011613960](http://120.26.79.238:9000/blog/img/image-20260121011613960.png)

## 挂载本地文件

1. 添加存储

![image-20260121011638646](http://120.26.79.238:9000/blog/img/image-20260121011638646.png)

2. 设置你要挂载本地文件的路径：比如我要挂载 D:\IDM\ 下载

![image-20260121011658440](http://120.26.79.238:9000/blog/img/image-20260121011658440.png)

3. 提交即可，如图即挂载成功

![image-20260121011711749](http://120.26.79.238:9000/blog/img/image-20260121011711749.png)

4. 挂载成功

![image-20260121011725399](http://120.26.79.238:9000/blog/img/image-20260121011725399.png)

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
