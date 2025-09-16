# swap

---

# 📚 Linux 创建 swap 详细指南

> ⚙ 适用系统：
>
> * CentOS / RHEL / Rocky / AlmaLinux
> * Ubuntu / Debian

---

## 1️⃣ 查看当前 swap 情况

```bash
# 查看 swap 总体使用情况
free -h

# 查看 swap 设备列表
swapon -s

# 查看详细
cat /proc/swaps
```

---

## 2️⃣ 创建 swap 文件

这里以 **创建 4G swap 文件** 为例。

### ➡️ 2.1 创建 swap 文件

```bash
# 在 /swapfile 创建大小为 4G 的 swap 文件
sudo fallocate -l 4G /swapfile

# 如果 fallocate 不可用，可使用 dd (更兼容)
# sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
```

### ➡️ 2.2 修改权限

```bash
sudo chmod 600 /swapfile
```

### ➡️ 2.3 设置为 swap 格式

```bash
sudo mkswap /swapfile
```

---

## 3️⃣ 启用 swap

```bash
sudo swapon /swapfile
```

验证是否生效：

```bash
swapon -s
free -h
```

---

## 4️⃣ 开机自动挂载

编辑 `/etc/fstab`，添加一行：

```bash
sudo nano /etc/fstab
```

在文件末尾添加：

```
/swapfile swap swap defaults 0 0
```

然后测试是否能正常挂载（避免下次重启失败）：

```bash
sudo mount -a
```

---

## 5️⃣ 调整 swap 使用频率（swappiness）

swappiness 表示系统使用 swap 的倾向：

* **0** 表示尽可能避免使用 swap（几乎用完物理内存才用）。
* **100** 表示尽量使用 swap。

通常设置为 **10-20** 性能较好。

### ➡️ 5.1 临时修改

```bash
sudo sysctl vm.swappiness=10
```

立即生效，但重启失效。

### ➡️ 5.2 永久修改

```bash
sudo nano /etc/sysctl.conf
```

添加一行：

```
vm.swappiness=10
```

然后执行：

```bash
sudo sysctl -p
```

---

## 6️⃣ 扩展 swap 大小

如果原 swap 不够，可以新增 swap 文件，或删除原文件重新创建。

### ➡️ 6.1 删除旧 swap（若需要）

```bash
sudo swapoff /swapfile
sudo rm -f /swapfile
```

然后重新按上面步骤再创建更大的 swap 文件。

---

## 7️⃣ 额外优化：设置 cache pressure

`vm.vfs_cache_pressure` 决定了内核多积极释放 inode/dentry 缓存。默认是 100。

可以适当调低到 50：

```bash
sudo sysctl vm.vfs_cache_pressure=50
```

永久：

```
sudo nano /etc/sysctl.conf
```

添加：

```
vm.vfs_cache_pressure=50
```

然后：

```bash
sudo sysctl -p
```

---

# ✅ 完整快速脚本示例

如果想一键执行，可用下面脚本（以 4G，swappiness=10 为例）：

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

# 🎯 小结：常用命令表

| 操作            | 命令                                                            |
| ------------- | ------------------------------------------------------------- |
| 查看 swap       | `free -h` / `swapon -s`                                       |
| 创建 swap 文件    | `fallocate -l 4G /swapfile`                                   |
| 权限、格式化、启用     | `chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
| 设置开机挂载        | `/etc/fstab` 中添加 `/swapfile swap swap defaults 0 0`           |
| 修改 swappiness | `sysctl vm.swappiness=10`                                     |
| 永久 swappiness | `/etc/sysctl.conf` 中添加 `vm.swappiness=10`                     |
| 移除 swap       | `swapoff /swapfile && rm /swapfile`                           |

---


# swap脚本

---

## 🚀 脚本增强功能

✅ **自动检测内存大小，决定 swap 大小**
✅ **自动检测根分区剩余空间，避免 swap 太大导致磁盘占满**
✅ **如需要，会拆分为多个 swap 文件以分摊 I/O**
✅ **所有输出写入 `/var/log/swap_setup.log`**
✅ **依然自动设置 swappiness 和 cache\_pressure，并开机自动挂载**

---

## 📜 完整脚本 `auto_swap.sh`

```bash
#!/bin/bash
# ===============================================
# 自动根据内存和磁盘空间配置 swap
# 支持多 swap 文件分摊 IO，并写日志到 /var/log/swap_setup.log
# ===============================================

log_file="/var/log/swap_setup.log"
exec > >(tee -a "$log_file") 2>&1

echo "====== $(date '+%F %T') Starting swap setup ======"

# ----------------------------
# 获取总内存(MB)
mem_total=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024)}')
echo "Detected memory: ${mem_total} MB"

# ----------------------------
# 根据内存大小决定 swap 大小
if [ "$mem_total" -lt 2048 ]; then
    swap_target=2048
elif [ "$mem_total" -lt 8192 ]; then
    swap_target=$mem_total
else
    swap_target=4096
fi
echo "Initial calculated swap target: ${swap_target} MB"

# ----------------------------
# 检查根挂载点剩余空间
root_avail=$(df --output=avail / | tail -1 | awk '{print int($1/1024)}')
echo "Available disk space on / : ${root_avail} MB"

# 如果 swap 大于剩余空间的80%，调整
max_swap=$((root_avail * 80 / 100))
if [ "$swap_target" -gt "$max_swap" ]; then
    swap_target=$max_swap
    echo "Adjusted swap to ${swap_target} MB to fit disk capacity (80%)."
fi

# ----------------------------
# 如果还有老 swapfile，先移除
if swapon --summary | grep -q '/swapfile'; then
    echo "Existing /swapfile found, turning off swap."
    sudo swapoff /swapfile
    sudo rm -f /swapfile
fi
# 删除多 swap 文件
for i in {1..4}; do
    if [ -f "/swapfile$i" ]; then
        sudo swapoff "/swapfile$i"
        sudo rm -f "/swapfile$i"
    fi
done

# ----------------------------
# 多 swap 文件分摊 IO
# 比如 如果 swap_target > 2GB，则分 2 个 swap 文件
files=1
if [ "$swap_target" -gt 2048 ]; then
    files=2
fi
per_file=$((swap_target / files))

echo "Will create $files swap files, each ~${per_file} MB"

for i in $(seq 1 $files); do
    swapfile="/swapfile$i"
    echo "Creating $swapfile of size ${per_file} MB"
    sudo fallocate -l ${per_file}M "$swapfile" || sudo dd if=/dev/zero of="$swapfile" bs=1M count=$per_file
    sudo chmod 600 "$swapfile"
    sudo mkswap "$swapfile"
    sudo swapon "$swapfile"
    
    if ! grep -q "$swapfile" /etc/fstab; then
        echo "$swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab
    fi
done

# 如果只有 1 个文件，命名为 /swapfile
if [ "$files" -eq 1 ]; then
    mv "/swapfile1" "/swapfile"
    sed -i 's|/swapfile1|/swapfile|g' /etc/fstab
fi

# ----------------------------
# 调整 swappiness 和 cache pressure
sudo sysctl vm.swappiness=10
sudo sysctl vm.vfs_cache_pressure=50
grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
grep -q 'vm.vfs_cache_pressure' /etc/sysctl.conf || echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# ----------------------------
# 最终结果
echo "====== Swap setup complete ======"
free -h
swapon --show

echo "====== $(date '+%F %T') Swap setup done ======"
```

---

## 🚀 使用方式

### 1️⃣ 保存脚本

```bash
nano auto_swap.sh
```

粘贴上面的脚本，保存退出。

---

### 2️⃣ 授权执行

```bash
chmod +x auto_swap.sh
```

---

### 3️⃣ 运行脚本

```bash
sudo ./auto_swap.sh
```

执行过程和所有日志都会写入：

```
/var/log/swap_setup.log
```

你可以随时查看：

```bash
cat /var/log/swap_setup.log
```

---

## ✅ 它的优点

* **安全**：永远不会占用超过根分区剩余的 80%，避免导致系统无法写入。
* **智能**：自动决定 swap 大小。
* **分散 I/O**：大于 2GB 就拆成多个 swap 文件。
* **自动挂载**：写入 `/etc/fstab`。
* **优化参数**：设置 `swappiness=10`，`cache_pressure=50`。
* **可追溯**：所有过程和结果都写到 `/var/log/swap_setup.log`。

---

太棒了！你这个需求非常“专业级”，我们就来搞个 **顶配级自动 swap 管理方案**
👇 我会详细拆解成三个部分，并给出完整可执行脚本示例。

---

# 🚀 功能一：基于磁盘 I/O 性能自动决定 swap 文件数

一般 swap 文件越多，可以分摊到不同磁盘/不同 inode，提高并行 IO 性能（虽不如 RAID）。
我们可以：

* 用 `dd` 或 `fio` 简单跑个写入测试。
* 根据 MB/s 速度决定 swap 文件数量。

举个简单规则示例：

* IOPS < 50 MB/s，创建 1 个 swap 文件（避免过多碎片）。
* IOPS 50\~150 MB/s，创建 2 个 swap 文件。
* IOPS > 150 MB/s，创建 3 个 swap 文件。

---

## 🚀 功能二：结合 zram 压缩 swap（基于内存）

zram 类似在内存里开一个压缩块设备，性能比真实磁盘 swap 高很多（通常 4\~10x）。
适合：

* CPU 比较空闲，内存吃紧时。
* 做内存“过度承载”，同时减少物理 swap 触发。

---

## 🚀 功能三：cron 定期检查 swap + 磁盘

自动每天或每小时检测 swap 使用率、I/O load、磁盘可用空间，自动写入日志，并可发邮件或推送。

---

# ✅ 现在整合为超完整的方案

---

## 📜 完整增强脚本 `smart_swap_setup.sh`

### 🔥 自动：

* 检测内存
* 跑 `dd` 测 I/O
* 根据速度分配 swap 文件数
* 启用 zram 压缩 swap
* 配置 swappiness
* 写 `/etc/fstab`
* 输出到 `/var/log/swap_manager.log`

```bash
#!/bin/bash
# ================================================
# 智能 swap 管理脚本 (内存+磁盘I/O自动化, 多文件, zram 自动检测)
# 日志输出到 /var/log/swap_manager.log
# ================================================

log_file="/var/log/swap_manager.log"
exec > >(tee -a "$log_file") 2>&1

echo "====== $(date '+%F %T') Starting smart swap setup ======"

# ----------------------------
# 检测内存
mem_total=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024)}')
echo "Detected memory: ${mem_total} MB"

# ----------------------------
# 强制英文运行 dd 测试，避免中文环境匹配失败
echo "Running IO test with dd..."
speed=$(LANG=C dd if=/dev/zero of=test_io.tmp bs=1M count=256 conv=fdatasync 2>&1 | \
    grep -Eo '[0-9\.]+ (MB/s|MB/秒)' | awk '{print int($1)}')
rm -f test_io.tmp

if [ -z "$speed" ]; then
    echo "IO speed detection failed, defaulting to 1 swap file."
    swap_files=1
elif [ "$speed" -lt 50 ]; then
    swap_files=1
elif [ "$speed" -lt 150 ]; then
    swap_files=2
else
    swap_files=3
fi
echo "Measured disk speed: ${speed:-N/A} MB/s"
echo "Will create ${swap_files} swap file(s)."

# ----------------------------
# 根据内存决定 swap 总大小
if [ "$mem_total" -lt 2048 ]; then
    swap_target=2048
elif [ "$mem_total" -lt 8192 ]; then
    swap_target=$mem_total
else
    swap_target=4096
fi
echo "Total swap target: ${swap_target} MB"

# ----------------------------
# 清理旧 swap
echo "Cleaning old swap configurations..."
sudo swapoff -a
sudo sed -i '/swapfile/d' /etc/fstab
for i in {1..5}; do
    [ -f "/swapfile$i" ] && sudo rm -f "/swapfile$i"
done

# ----------------------------
# 分配 swap 文件
per_swap=$((swap_target / swap_files))
for i in $(seq 1 $swap_files); do
    file="/swapfile$i"
    echo "Creating $file of size ${per_swap} MB"
    sudo fallocate -l ${per_swap}M "$file" || sudo dd if=/dev/zero of="$file" bs=1M count=$per_swap
    sudo chmod 600 "$file"
    sudo mkswap "$file"
    sudo swapon "$file"
    echo "$file swap swap defaults 0 0" | sudo tee -a /etc/fstab
done

# ----------------------------
# 启用 zram 并检测设备数量
echo "Installing zram (if needed)..."
if ! command -v zramctl >/dev/null 2>&1; then
    sudo apt install -y zram-tools || sudo yum install -y zram
fi

echo "Loading zram kernel module..."
sudo modprobe zram

# 计算当前系统支持的 zram 数量
available_zrams=$(ls /sys/block/ | grep zram | wc -l)
if [ "$available_zrams" -eq 0 ]; then
    echo "No zram device detected, skipping zram setup."
else
    echo "Detected $available_zrams zram device(s)"
    for i in $(seq 0 $((available_zrams-1))); do
        echo "${mem_total}M" | sudo tee /sys/block/zram${i}/disksize
        sudo mkswap /dev/zram${i}
        sudo swapon /dev/zram${i}
    done
fi

# ----------------------------
# 系统内核优化参数
echo "Setting vm.swappiness=10 and vm.vfs_cache_pressure=50"
sudo sysctl -w vm.swappiness=10
sudo sysctl -w vm.vfs_cache_pressure=50
grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
grep -q 'vm.vfs_cache_pressure' /etc/sysctl.conf || echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf

# ----------------------------
# 最终结果展示
echo "====== Smart swap setup complete ======"
free -h
swapon --show


```

---

## ⚙️ 使用方式

```bash
nano smart_swap_setup.sh
# 粘贴脚本
chmod +x smart_swap_setup.sh
sudo ./smart_swap_setup.sh
```

执行后：

* 自动跑 dd 测试
* 决定 swap 文件数
* 开启 zram
* 写 `/etc/fstab`
* 调整参数
* 输出到 `/var/log/swap_manager.log`

---

## 🚀 定期 cron 监控 swap + 磁盘

例如每 1 小时检查，并记录使用情况。

### `swap_check.sh`

```bash
#!/bin/bash
log_file="/var/log/swap_health.log"
echo "====== $(date '+%F %T') ======" >> "$log_file"
echo "Disk usage:" >> "$log_file"
df -h >> "$log_file"
echo "Swap usage:" >> "$log_file"
free -h >> "$log_file"
echo "IO stat:" >> "$log_file"
iostat -xz 1 3 >> "$log_file"
echo "------------------------------------" >> "$log_file"
```

> 安装 `sysstat` 获取 `iostat`：

```bash
sudo apt install sysstat
# 或
sudo yum install sysstat
```

---

### 加入 cron

```bash
crontab -e
```

添加：

```
0 * * * * /bin/bash /path/to/swap_check.sh
```

---

# 🔥 结论：

✅ **基于磁盘 IO 智能分配 swap 文件数**
✅ **结合 zram 高速压缩 swap**
✅ **定期 swap & disk 健康检测**

---

# swap预警脚本
---

# 🚀 `swap_health.sh` 支持邮件 & 微信报警

```bash
#!/bin/bash
# ================================================
# swap_health.sh
# 定时检测系统 swap、内存、磁盘使用情况
# 记录日志到 /var/log/swap_health.log
# swap 使用率超过阈值时，自动发送邮件和微信报警
# ================================================

log_file="/var/log/swap_health.log"
threshold_swap_used_percent=70

# --- 配置你的邮箱和微信推送相关信息 ---
EMAIL="your_email@example.com"

# 微信推送 URL（企业微信/Server酱等均可）
# 这里示例用 Server酱 https://sct.ftqq.com/ 的推送地址
WECHAT_PUSH_URL="https://sctapi.ftqq.com/你的SCKEY.send"

now=$(date '+%F %T')
echo "===== $now =====" >> "$log_file"

# ----------------------------
# 检查内存 & swap 使用情况
echo "[MEMORY]" >> "$log_file"
free -h >> "$log_file"

swap_total=$(free | awk '/Swap:/ {print $2}')
swap_used=$(free | awk '/Swap:/ {print $3}')

if [ "$swap_total" -gt 0 ]; then
    swap_used_percent=$(( 100 * swap_used / swap_total ))
else
    swap_used_percent=0
fi

echo "[SWAP] Total: $swap_total KB, Used: $swap_used KB, Used%: $swap_used_percent%" >> "$log_file"

# ----------------------------
# 检查磁盘
echo "[DISK]" >> "$log_file"
df -h >> "$log_file"

# ----------------------------
# 判断是否发送报警
if [ "$swap_used_percent" -gt "$threshold_swap_used_percent" ]; then
    alert_msg="⚠️ Swap 使用率警告！当前使用率为 ${swap_used_percent}% (阈值 ${threshold_swap_used_percent}%)"
    echo "[ALERT] $alert_msg" >> "$log_file"

    # 发送邮件报警（需要系统支持 mail 命令）
    echo "$alert_msg" | mail -s "Swap 使用率警告" "$EMAIL"

    # 发送微信推送报警
    curl -s --get --data-urlencode "title=Swap 使用率警告" --data-urlencode "desp=$alert_msg" "$WECHAT_PUSH_URL" > /dev/null
fi

echo "" >> "$log_file"
```

---

# 🔧 使用说明

1. 修改脚本中：

```bash
EMAIL="your_email@example.com"
WECHAT_PUSH_URL="https://sctapi.ftqq.com/你的SCKEY.send"
```

替换成你的邮箱地址和微信推送 URL。

2. 确保系统已安装并配置好 `mail` 命令（如 `mailutils` 或 `mailx`）。

3. 保存脚本（如 `/usr/local/bin/swap_health.sh`），赋权限：

```bash
chmod +x /usr/local/bin/swap_health.sh
```

4. 手动运行测试：

```bash
/usr/local/bin/swap_health.sh
```

5. 查看日志：

```bash
tail -f /var/log/swap_health.log
```

6. 添加定时任务（如每10分钟）：

```bash
crontab -e
```

添加：

```cron
*/10 * * * * /usr/local/bin/swap_health.sh
```

---

# 📢 关于微信推送

* 上面示例使用 [Server酱](https://sct.ftqq.com/) 服务，简单易用
* 注册后获取 `SCKEY`，拼成推送 URL
* 也可以用企业微信机器人或者其他微信推送工具，调整 `curl` 部分即可

---
