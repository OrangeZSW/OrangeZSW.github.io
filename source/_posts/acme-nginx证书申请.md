---
title: acme+nginx证书申请
date: 2024-07-15 19:41:45
cover: https://orange-note-img.oss-cn-wuhan-lr.aliyuncs.com/guigu/wallhaven-5g8wq1_1920x1080.png
---

# acme.sh 网站申请证书（nginx）

## :one:安装 nginx(省略)

## :two:安装 acme

```bash
curl  https://get.acme.sh | sh -s email=zhaoolee@gmail.com
source ~/.bashrc
```

> :exclamation: 申请证书的域名在申请之前要部署(这样不用进行 dns 验证),不然下面申请证书就不能成功

## :three:网站申请证书

```bash
  acme.sh --issue  -d alist.zorange.online    --nginx /usr/local/nginx/conf/nginx.conf
```

`--nginx /usr/local/nginx/conf/nginx.conf`是你的 nginx.conf 路径
`alist.zorange.online` 是要申请的网站的域名

![image.png](https://server.blog.zorange.online/files/download/a6fe12cbcb6949a99ac3c47eca410e36.png)

## :four:拷贝证书

```bash
  acme.sh --install-cert -d alist.zorange.online \
--key-file       /usr/local/nginx/conf/ssl/alist.zorange.online/alist.zorange.online.key  \
--fullchain-file /usr/local/nginx/conf/ssl/alist.zorange.online/fullchain.cer \
--reloadcmd     "service nginx force-reload"
```

![Description](https://server.blog.zorange.online/files/download/eae53845b18e4be38e2abbc73f2624fc.png)

## 更新证书

```conf
acme.sh --renew -d docker.zorange.online --force
```

## :five:nginx 设置

```conf
   ssl_certificate "/etc/nginx/ssl/hk.v2fy.com/fullchain.cer";
    ssl_certificate_key "/etc/nginx/ssl/hk.v2fy.com/hk.v2fy.com.key";
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout  10m;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
		 #强制将http的URL重写成https
    rewrite ^(.*) https://$server_name$1 permanent;
```

## 自动更新脚本

如果你有多个证书要更新，可以将所有更新证书的命令放入一个脚本中，并使用`acme.sh`来自动更新所有这些证书。你只需确保`acme.sh`已经正确配置，并且你的脚本包含所有需要更新的证书。

1. **创建一个脚本来安装多个证书**：

首先，创建一个脚本文件，例如`/usr/local/bin/install_all_certs.sh`，并将所有`acme.sh --install-cert`命令放入该文件中：

```sh
#!/bin/bash

# 更新并安装 alist.zorange.online 的证书
/root/.acme.sh/acme.sh --install-cert -d alist.zorange.online \
--key-file /usr/local/nginx/conf/ssl/alist.zorange.online/alist.zorange.online.key \
--fullchain-file /usr/local/nginx/conf/ssl/alist.zorange.online/fullchain.cer \
--reloadcmd "service nginx force-reload"

# 更新并安装 docker.blog.zorange.online 的证书
/root/.acme.sh/acme.sh --install-cert -d docker.blog.zorange.online \
--key-file /usr/local/nginx/conf/ssl/docker.blog.zorange.online/docker.blog.zorange.online.key \
--fullchain-file /usr/local/nginx/conf/ssl/docker.blog.zorange.online/fullchain.cer \
--reloadcmd "service nginx force-reload"

# 你可以继续添加更多的证书更新命令...
```

确保脚本是可执行的：

```sh
chmod +x /usr/local/bin/install_all_certs.sh
```

2. **设置一个 cron 任务来自动运行脚本**：

编辑 cron 任务：

```sh
sudo crontab -e
```

然后添加以下行，这将每天午夜运行你的脚本：

```sh
0 0 * * * /usr/local/bin/install_all_certs.sh
```

这样，每天午夜`acme.sh`将检查并更新所有列出的证书，然后使用`service nginx force-reload`命令重新加载 Nginx，以应用新的证书。

3. **确保 acme.sh 自动更新证书**：

确保你的`acme.sh`配置正确，以便它能在证书快到期时自动更新。你可以通过运行以下命令来检查`acme.sh`的更新任务：

```sh
acme.sh --cron --home /path/to/.acme.sh
```
