

# Linux 脚本（Bash）基础教程

---

## 1. 什么是 Linux 脚本？

* Linux 脚本是用来自动化执行一系列命令的文本文件。
* 常用的脚本语言是 Bash（Bourne Again SHell）。
* 脚本通常以 `.sh` 结尾，但不强制。

---

## 2. 第一个脚本：Hello World

```bash
#!/bin/bash

echo "Hello, Linux scripting!"
```

* `#!/bin/bash` ：告诉系统用 bash 来执行脚本
* `echo` ：打印输出

保存为 `hello.sh`，然后运行：

```bash
chmod +x hello.sh   # 给执行权限
./hello.sh          # 执行脚本
```

---

## 3. 变量和基本运算

```bash
#!/bin/bash

name="orange"
echo "Hello, $name"

num1=10
num2=5
sum=$((num1 + num2))
echo "Sum: $sum"
```

* 变量赋值不能有空格。
* 使用 `$(( ))` 进行算术运算。
* 变量引用时前面加 `$`。

---

## 4. 条件判断

```bash
#!/bin/bash

num=5

if [ $num -gt 3 ]; then
    echo "$num is greater than 3"
else
    echo "$num is not greater than 3"
fi
```

常用条件：

| 表达式   | 说明   |
| ----- | ---- |
| `-eq` | 等于   |
| `-ne` | 不等于  |
| `-gt` | 大于   |
| `-lt` | 小于   |
| `-ge` | 大于等于 |
| `-le` | 小于等于 |

---

## 5. 循环语句

### for 循环

```bash
for i in 1 2 3 4 5
do
    echo "Loop $i"
done
```

### while 循环

```bash
count=1
while [ $count -le 5 ]
do
    echo "Count $count"
    ((count++))
done
```

---

## 6. 函数

```bash
#!/bin/bash

function greet() {
    echo "Hello, $1"
}

greet "orange"
```

* 函数定义用 `function` 或直接 `greet()`
* 通过 `$1`, `$2`...获取参数

---

## 7. 读取用户输入

```bash
#!/bin/bash

read -p "Enter your name: " name
echo "Hello, $name"
```

---

## 8. 脚本参数

脚本执行时可以带参数：

```bash
./script.sh arg1 arg2
```

在脚本里：

* `$0` 脚本名
* `$1` 第一个参数
* `$2` 第二个参数
* `$#` 参数个数
* `$@` 所有参数

---

## 9. 常用命令示例

* `ls` 列目录
* `cd` 切目录
* `cat` 显示文件内容
* `grep` 查找内容
* `awk` 处理文本
* `sed` 文本替换

---

## 10. 错误处理和调试

* 脚本开始加：

  ```bash
  set -euo pipefail
  ```

  * `-e` 遇错退出
  * `-u` 未定义变量报错
  * `-o pipefail` 管道错误检测

* 调试运行：

  ```bash
  bash -x script.sh
  ```

---

# 额外推荐学习资源

* 《The Linux Command Line》 — 免费电子书
* Bash 官方手册：[https://www.gnu.org/software/bash/manual/](https://www.gnu.org/software/bash/manual/)
* 在线教程：[https://ryanstutorials.net/bash-scripting-tutorial/](https://ryanstutorials.net/bash-scripting-tutorial/)

---
