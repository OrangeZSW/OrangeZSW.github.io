---
title: Docker安装
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


## 更新yum源

### 步骤 1：备份现有的 YUM 源配置

首先，备份当前的 YUM 源配置文件，以防需要恢复：

``` language
  sudo mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
```

### 步骤 2：下载阿里云的 YUM 源配置文件

使用 wget 下载阿里云的 CentOS 7 YUM 源配置文件：

``` language
  sudo wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```


### 步骤 3：清除缓存并生成新的缓存

清除旧的 YUM 缓存并生成新的缓存：

``` language
  sudo yum clean all
sudo yum makecache
```


### 步骤 4：验证 YUM 源是否配置成功

运行以下命令查看可用的更新包，确保新源配置正确：

``` language
  sudo yum repolist
```

完成后的效果

你现在已经成功将 CentOS 7 的 YUM 源切换为阿里云镜像源。这将提高下载速度和软件包更新的效率，因为阿里云的镜像服务器通常比官方源更快，特别是在国内。

###  wegt不存在

#### 下载阿里云 YUM 仓库配置文件

由于你无法使用 yum 安装 wget，我们可以手动添加阿里云的 YUM 仓库配置文件。

进入 /etc/yum.repos.d/ 目录：

``` language
  cd /etc/yum.repos.d/
```


#### 使用 curl（通常是默认安装的）来下载阿里云的 YUM 配置文件：

``` language
  sudo curl -o CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```

#### 清除 YUM 缓存并生成新缓存

配置完 YUM 仓库后，运行以下命令清除旧缓存并生成新缓存：

``` language
  sudo yum clean all
sudo yum makecache
```

## 下载Docker

### 步骤 1：更新系统软件包

首先，确保你的系统软件包是最新的：

``` language
  sudo yum update -y
```


### 步骤 2：安装依赖包

安装一些必要的依赖包：

``` language
  sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```


### 步骤 3：添加 Docker 仓库

使用以下命令添加 Docker 阿里云仓库：

``` language
 yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```


### 步骤 4：安装 Docker

安装最新版本的 Docker：

``` language
  sudo yum install  docker-ce docker-ce-cli containerd.io  -y
```


### 步骤 5：启动 Docker 服务

安装完成后，启动 Docker 服务并设置为开机自启动：

``` language
  sudo systemctl start docker
sudo systemctl enable docker
```


### 步骤 6：验证 Docker 安装

你可以使用以下命令来验证 Docker 是否已正确安装并正在运行：

``` language
  docker --version
```

还可以运行一个测试容器来确认 Docker 正常工作：

``` language
  sudo docker run hello-world
```


### 其他注意事项

防火墙配置：如果你的防火墙启用了，确保 Docker 的网络通信端口是开放的，特别是如果你计划在这台机器上运行 Docker 服务并对外提供服务。

用户权限：如果你希望当前用户无需 sudo 权限就可以运行 Docker 命令，可以将该用户添加到 docker 用户组：
sudo usermod -aG docker $USER
然后退出并重新登录以应用更改。