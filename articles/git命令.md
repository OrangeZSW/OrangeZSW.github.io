# git命令

## 撤销已提交的更改
在 Git 中，还原提交（撤销已提交的更改）有几种不同的方法，具体取决于你想达到的效果：

---

### 1. **撤销提交但保留更改（回到工作区）**
```bash
git reset --soft HEAD~1
```
- **效果**：撤销最后一次提交，但保留所有更改在 **暂存区**（`git add` 状态）
- **适用场景**：想重新修改提交信息或拆分提交

---

### 2. **撤销提交并取消暂存（更改保留在工作目录）**
```bash
git reset HEAD~1
# 或等价于
git reset --mixed HEAD~1  # --mixed 是默认选项
```
- **效果**：撤销提交，并将更改移出暂存区（需重新 `git add`）
- **适用场景**：想重新选择部分文件提交

---

### 3. **彻底丢弃提交和所有更改（慎用！）**
```bash
git reset --hard HEAD~1
```
- **效果**：彻底丢弃最后一次提交 **和所有工作目录的更改**（不可逆！）
- **适用场景**：完全放弃最近的提交

---

### 4. **撤销特定提交（生成反向提交）**
```bash
git revert <commit-hash>
```
- **效果**：生成一个新的提交来抵消指定提交的更改（保留提交历史）
- **适用场景**：需要撤销公共仓库的提交（不重写历史）

---

### 5. **回退到某个旧提交（强制覆盖远程）**
```bash
git reset --hard <commit-hash>
git push --force  # 强制覆盖远程（仅限个人分支使用！）
```
- **危险操作**：会重写历史，仅限未共享的提交使用

---

### 关键区别总结：
| 操作                | 修改历史？ | 保留更改？ | 适用场景               |
|---------------------|------------|------------|-----------------------|
| `git reset --soft`  | 是         | 是（暂存） | 重新提交               |
| `git reset --mixed` | 是         | 是（工作区）| 重新选择文件提交       |
| `git reset --hard`  | 是         | 否         | 彻底放弃提交           |
| `git revert`        | 否         | -          | 安全撤销公共提交       |

---

### 操作后恢复方法：
如果误操作 `--hard` 重置，可通过以下命令尝试恢复：
```bash
git reflog                  # 查看所有操作记录
git checkout <丢失的提交ID>  # 找回数据
``` 

根据你的需求选择合适的方法，对公共分支尽量使用 `git revert` 避免历史冲突。




## git大文件解决办法
### **1. 使用 Git LFS（Git 大文件存储）**
GitHub 推荐使用 **Git LFS (Large File Storage)** 来管理大文件。

#### **步骤：**
1. **安装 Git LFS**  
   - 下载并安装 Git LFS：[https://git-lfs.github.com/](https://git-lfs.github.com/)
   - 安装后运行：
     ```bash
     git lfs install
     ```

2. **跟踪大文件**  
   在项目根目录运行：
   ```bash
   git lfs track "mysql/binlog.000066"
   ```
   这会生成/修改 `.gitattributes` 文件。

3. **重新提交并推送**
   ```bash
   git add .gitattributes
   git add mysql/binlog.000066
   git commit -m "使用 Git LFS 跟踪大文件"
   git push origin master
   ```

---

### **2. 从 Git 历史中删除大文件**
如果不需要 `binlog.000066` 文件，可以从 Git 历史中彻底删除它：

#### **步骤：**
1. **使用 `git filter-branch` 或 `BFG Repo-Cleaner` 删除大文件**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch mysql/binlog.000066" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **强制推送（会覆盖远程历史）**
   ```bash
   git push origin master --force
   ```
   ⚠️ **注意**：这会修改提交历史，如果其他人也在协作，可能会影响他们的仓库。

---

### **3. 使用 `.gitignore` 忽略大文件**
如果 `binlog.000066` 是临时文件（如日志文件），可以：
1. 在 `.gitignore` 中添加：
   ```plaintext
   mysql/binlog.*
   ```
2. 删除已提交的文件：
   ```bash
   git rm --cached mysql/binlog.000066
   git commit -m "移除大文件"
   git push origin master
   ```

---

## **如何避免类似问题？**
- **不要提交日志、二进制文件、数据库备份等大文件**，使用 `.gitignore` 过滤它们。
- 如果必须管理大文件，使用 **Git LFS**。
- 检查现有仓库是否有大文件：
  ```bash
  git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"
  ```

---

## **总结**
| 方法 | 适用场景 | 命令示例 |
|------|---------|----------|
| **Git LFS** | 需要保留大文件 | `git lfs track "大文件"` |
| **`filter-branch`** | 从历史中彻底删除 | `git filter-branch --force ...` |
| **`.gitignore`** | 忽略临时大文件 | `git rm --cached 大文件` |

选择合适的方法后，重新推送即可解决 `GH001: Large files detected` 错误。🚀

