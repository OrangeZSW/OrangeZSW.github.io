

# Linux 安装 Git + 生成 SSH 公钥 + 配置公钥 + 自定义 SSH 名称连接服务器教程


## 1. 安装 Git

大部分 Linux 发行版默认自带 Git，如果没有，执行下面命令安装：

### Debian/Ubuntu 系统：

```bash
sudo apt update
sudo apt install git -y
```

### CentOS/RHEL 系统：

```bash
sudo yum install git -y
```

### Fedora 系统：

```bash
sudo dnf install git -y
```

安装完成后，验证：

```bash
git --version
```

---

## 2. 生成 SSH 公钥和私钥

执行以下命令，生成 SSH 密钥对：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

* `-t rsa` 表示使用 RSA 算法
* `-b 4096` 表示密钥长度 4096 位（更安全）
* `-C` 添加注释，一般填写邮箱

过程示例：

```text
Generating public/private rsa key pair.
Enter file in which to save the key (/home/youruser/.ssh/id_rsa):  # 直接回车即可使用默认路径，或者自定义路径
Enter passphrase (empty for no passphrase):  # 建议设置密码，增加安全性，也可以直接回车跳过
Enter same passphrase again:
Your identification has been saved in /home/youruser/.ssh/id_rsa.
Your public key has been saved in /home/youruser/.ssh/id_rsa.pub.
```

---

## 3. 将公钥内容添加到服务器

### 3.1 查看公钥内容

```bash
cat ~/.ssh/id_rsa.pub
```

复制输出的内容（以 `ssh-rsa` 开头，末尾带注释）。

---

### 3.2 登录目标服务器（比如通过密码登录）

```bash
ssh user@server_ip
```

---

### 3.3 添加公钥到服务器

执行以下命令：

```bash
mkdir -p ~/.ssh
echo "复制的公钥内容" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

这样就授权了本地机器的公钥登录服务器。

---

## 4. 配置 SSH 客户端的自定义连接名称（别名）

编辑本地机器的 SSH 配置文件：

```bash
vim ~/.ssh/config
```

添加如下内容：

```text
Host myserver
    HostName server_ip_or_domain
    User your_server_username
    IdentityFile ~/.ssh/id_rsa
    Port 22  # 如果服务器 SSH 端口不是22，请改成对应端口
```

保存退出。

---

## 5. 使用自定义名称连接服务器

```bash
ssh myserver
```

这时 SSH 会自动使用配置的用户名、IP、密钥和端口连接。

---

## 6. 测试 SSH 连接是否成功

```bash
ssh -T git@github.com
```

如果你是为了使用 Git 连接 GitHub，也可以测试：

* 如果提示 `You've successfully authenticated`，说明 SSH 配置成功。

---

# 总结

| 步骤     | 命令示例或说明                                 |
| ------ | --------------------------------------- |
| 安装 Git | `sudo apt install git -y`               |
| 生成密钥   | `ssh-keygen -t rsa -b 4096 -C "email"`  |
| 查看公钥   | `cat ~/.ssh/id_rsa.pub`                 |
| 登录服务器  | `ssh user@server_ip`                    |
| 添加公钥   | `echo "公钥内容" >> ~/.ssh/authorized_keys` |
| 配置别名   | 编辑 `~/.ssh/config` 文件                   |
| 用别名连接  | `ssh myserver`                          |

---

# 自动化脚本

* 检查并安装 Git（适配 Debian/Ubuntu）
* 生成 SSH 密钥（默认路径，带注释邮箱）
* 显示公钥内容，方便复制
* 提示你手动登录服务器，把公钥加到服务器 `~/.ssh/authorized_keys`
* 帮你配置本地 `~/.ssh/config` 里的 SSH 连接别名

---

# 自动化脚本（假设你用的是 Debian/Ubuntu）

```bash
#!/bin/bash

# 配置参数：修改成你自己的邮箱，服务器IP，用户名，SSH端口和别名
EMAIL="your_email@example.com"
SERVER_IP="your.server.ip"
SERVER_USER="youruser"
SSH_PORT=22
SSH_ALIAS="myserver"
KEY_PATH="$HOME/.ssh/id_rsa"

# 1. 安装 git
echo "检查 Git 是否安装..."
if ! command -v git &> /dev/null
then
    echo "Git 未安装，开始安装 Git..."
    sudo apt update
    sudo apt install git -y
else
    echo "Git 已安装，版本：$(git --version)"
fi

# 2. 生成 SSH 密钥
if [ -f "$KEY_PATH" ]; then
    echo "检测到已有 SSH 密钥：$KEY_PATH"
else
    echo "生成新的 SSH 密钥..."
    ssh-keygen -t rsa -b 4096 -C "$EMAIL" -f "$KEY_PATH" -N ""
    echo "SSH 密钥生成成功。"
fi

# 3. 显示公钥，提醒复制
echo "请复制下面的公钥内容："
cat "${KEY_PATH}.pub"

echo
echo "请使用你的密码登录服务器，把上面公钥内容追加到 ~/.ssh/authorized_keys 文件里。"
echo "示例："
echo "ssh $SERVER_USER@$SERVER_IP"
echo "mkdir -p ~/.ssh && echo '你的公钥内容' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
echo

# 4. 配置 SSH 别名
CONFIG_FILE="$HOME/.ssh/config"

echo "开始配置 SSH 别名：$SSH_ALIAS 到 $CONFIG_FILE ..."

# 判断 config 文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    touch "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
fi

# 检查别名是否已存在
if grep -q "Host $SSH_ALIAS" "$CONFIG_FILE"; then
    echo "SSH 别名 $SSH_ALIAS 已存在，跳过写入。"
else
    cat >> "$CONFIG_FILE" <<EOL

Host $SSH_ALIAS
    HostName $SERVER_IP
    User $SERVER_USER
    Port $SSH_PORT
    IdentityFile $KEY_PATH
EOL
    echo "SSH 别名配置完成。"
fi

echo
echo "你可以用下面命令测试连接："
echo "ssh $SSH_ALIAS"

```

---

# 使用步骤

1. 将上面脚本保存为 `setup_ssh_git.sh`

2. 修改脚本顶部的参数：

```bash
EMAIL="你的邮箱"
SERVER_IP="服务器IP"
SERVER_USER="服务器用户名"
SSH_PORT=22 # 如果不是22，改成你的端口
SSH_ALIAS="你想起的别名"
```

3. 给予执行权限并运行：

```bash
chmod +x setup_ssh_git.sh
./setup_ssh_git.sh
```

4. 根据脚本提示，复制公钥内容，登录服务器，追加到 `~/.ssh/authorized_keys`

5. 用命令 `ssh myserver`（或者你配置的别名）连接服务器

---
