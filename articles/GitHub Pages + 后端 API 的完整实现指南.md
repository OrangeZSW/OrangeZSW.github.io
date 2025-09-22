---
title: GitHub Pages + 后端 API 的完整实现指南
---
# 使用方案二：GitHub Pages + 后端 API 的完整实现指南

## 第一步：创建 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token"
3. 选择权限：
   - `repo` (完全控制仓库)
   - `workflow` (如果需要使用 Actions)
4. 生成并复制 token（重要：只显示一次）

## 第二步：准备项目结构

```
markdown-editor/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## 第三步：后端设置

### 创建后端目录和文件

```bash
mkdir -p markdown-editor/backend
cd markdown-editor/backend
npm init -y
```

### 安装后端依赖

```bash
npm install express cors @octokit/rest dotenv
```

### 创建 server.js

```javascript
const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('../frontend'));

// 初始化 Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Markdown Editor API is running' });
});

// 保存 Markdown 文件
app.post('/api/save-markdown', async (req, res) => {
  try {
    const { content, filename, message, folder = '' } = req.body;

    // 验证输入
    if (!content || !filename) {
      return res.status(400).json({
        success: false,
        error: '内容和文件名是必需的'
      });
    }

    // 构建文件路径
    const filePath = folder ? `${folder}/${filename}` : filename;

    // 检查文件是否已存在（获取 SHA）
    let sha = null;
    try {
      const existingFile = await octokit.repos.getContent({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        branch: process.env.GITHUB_BRANCH,
        path: filePath
      });
      sha = existingFile.data.sha;
    } catch (error) {
      // 文件不存在是正常的，继续创建新文件
      if (error.status !== 404) {
        throw error;
      }
    }

    // 创建或更新文件
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      branch: process.env.GITHUB_BRANCH,
      path: filePath,
      message: message || `Update ${filename}`,
      content: Buffer.from(content).toString('base64'),
      sha: sha, // 如果文件存在，需要提供 SHA
      committer: {
        name: process.env.COMMITTER_NAME || 'Markdown Editor',
        email: process.env.COMMITTER_EMAIL || 'editor@example.com'
      }
    });

    res.json({
      success: true,
      message: '文件上传成功',
      url: response.data.content.html_url,
      download_url: response.data.content.download_url
    });

  } catch (error) {
    console.error('Error saving markdown:', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存文件时发生错误'
    });
  }
});

// 获取文件列表
app.get('/api/files', async (req, res) => {
  try {
    const { folder = '' } = req.query;

    const response = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      branch: process.env.GITHUB_BRANCH,
      path: folder
    });

    const files = response.data
      .filter(item => item.name.endsWith('.md'))
      .map(item => ({
        name: item.name,
        path: item.path,
        url: item.html_url,
        download_url: item.download_url
      }));

    res.json({ success: true, files });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取文件列表时发生错误'
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Markdown Editor API ready`);
});
```

### 创建 .env 文件

```env
# GitHub 配置
GITHUB_TOKEN=你的个人访问令牌
GITHUB_OWNER=你的GitHub用户名
GITHUB_REPO=你的仓库名
GITHUB_BRANCH=你的分支名

# 提交者信息
COMMITTER_NAME=Markdown Editor
COMMITTER_EMAIL=editor@example.com

# 服务器配置
PORT=3001
NODE_ENV=development
```

### 创建 package.json 脚本

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup": "npm install express cors @octokit/rest dotenv"
  }
}
```

## 第四步：前端实现

### 创建前端目录和文件

```bash
mkdir -p ../frontend
```

### 创建 index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown 编辑器</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-markdown"></i> Markdown 编辑器</h1>
            <p>在线编辑并保存到 GitHub 仓库</p>
        </header>

        <div class="editor-container">
            <div class="editor-section">
                <div class="section-header">
                    <h3><i class="fas fa-edit"></i> 编辑区</h3>
                    <div class="toolbar">
                        <button onclick="insertText('**粗体**')"><strong>B</strong></button>
                        <button onclick="insertText('*斜体*')"><em>I</em></button>
                        <button onclick="insertText('# 标题')">H1</button>
                        <button onclick="insertText('```\n代码块\n```')">代码</button>
                    </div>
                </div>
                <textarea id="markdown-input" placeholder="开始编写你的 Markdown 内容..."></textarea>
            </div>

            <div class="preview-section">
                <div class="section-header">
                    <h3><i class="fas fa-eye"></i> 预览区</h3>
                </div>
                <div id="markdown-preview"></div>
            </div>
        </div>

        <div class="controls">
            <div class="control-group">
                <label for="filename"><i class="fas fa-file"></i> 文件名：</label>
                <input type="text" id="filename" placeholder="example.md" value="document.md">
                
                <label for="folder"><i class="fas fa-folder"></i> 文件夹：</label>
                <input type="text" id="folder" placeholder="docs" value="markdown-docs">
                
                <label for="message"><i class="fas fa-comment"></i> 提交信息：</label>
                <input type="text" id="message" placeholder="添加新文档">
            </div>
            
            <div class="button-group">
                <button onclick="saveToGitHub()" class="btn-primary">
                    <i class="fas fa-cloud-upload-alt"></i> 保存到 GitHub
                </button>
                <button onclick="loadFileList()" class="btn-secondary">
                    <i class="fas fa-sync"></i> 刷新文件列表
                </button>
            </div>
        </div>

        <div class="file-list">
            <h3><i class="fas fa-files"></i> 仓库中的 Markdown 文件</h3>
            <div id="file-list-container"></div>
        </div>

        <div id="status-message" class="status-hidden"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 创建 style.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

header {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
}

header p {
    opacity: 0.9;
    font-size: 1.1em;
}

.editor-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px;
    height: 500px;
}

.editor-section, .preview-section {
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    border-radius: 10px;
    overflow: hidden;
}

.section-header {
    background: #e9ecef;
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-header h3 {
    color: #495057;
    font-size: 1.2em;
}

.toolbar {
    display: flex;
    gap: 5px;
}

.toolbar button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
}

.toolbar button:hover {
    background: #007bff;
    color: white;
}

#markdown-input {
    flex: 1;
    padding: 20px;
    border: none;
    resize: none;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    background: white;
}

#markdown-preview {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: white;
    line-height: 1.6;
}

#markdown-preview h1, #markdown-preview h2, #markdown-preview h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

#markdown-preview p {
    margin-bottom: 15px;
}

#markdown-preview code {
    background: #f4f4f4;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: monospace;
}

#markdown-preview pre {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
}

.controls {
    padding: 20px;
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

.control-group {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr auto 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
}

.control-group label {
    font-weight: bold;
    color: #495057;
}

.control-group input {
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    font-size: 14px;
}

.button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
}

button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
    transform: translateY(-2px);
}

.file-list {
    padding: 20px;
    border-top: 1px solid #dee2e6;
}

.file-list h3 {
    margin-bottom: 15px;
    color: #495057;
}

#file-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 10px;
}

.file-item {
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    transition: all 0.2s;
}

.file-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.file-item h4 {
    color: #007bff;
    margin-bottom: 8px;
}

.file-item p {
    color: #6c757d;
    font-size: 0.9em;
}

.file-actions {
    margin-top: 10px;
    display: flex;
    gap: 5px;
}

.file-actions button {
    padding: 5px 10px;
    font-size: 12px;
}

.status-hidden {
    display: none;
}

.status-show {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
}

.status-success {
    background: #28a745;
}

.status-error {
    background: #dc3545;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .editor-container {
        grid-template-columns: 1fr;
        height: auto;
    }
    
    .control-group {
        grid-template-columns: 1fr;
    }
}
```

### 创建 app.js

```javascript
// 初始化 Marked.js
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs) {
            return hljs.highlight(lang, code).value;
        }
        return code;
    },
    breaks: true,
    gfm: true
});

// 获取元素
const markdownInput = document.getElementById('markdown-input');
const markdownPreview = document.getElementById('markdown-preview');
const filenameInput = document.getElementById('filename');
const folderInput = document.getElementById('folder');
const messageInput = document.getElementById('message');
const fileListContainer = document.getElementById('file-list-container');
const statusMessage = document.getElementById('status-message');

// 示例内容
const defaultContent = `# 欢迎使用 Markdown 编辑器

这是一个在线 Markdown 编辑器，可以将内容保存到 GitHub 仓库。

## 功能特点

- 📝 实时预览
- 💾 保存到 GitHub
- 📁 文件管理
- 🎨 语法高亮

## 代码示例

\`\`\`javascript
function helloWorld() {
    console.log('Hello, World!');
    return 'This is Markdown!';
}
\`\`\`

## 列表

- 项目 1
- 项目 2
- 项目 3

## 链接

[GitHub](https://github.com) | [Markdown 指南](https://www.markdownguide.org/)
`;

// 设置默认内容
markdownInput.value = defaultContent;
updatePreview();

// 实时预览
markdownInput.addEventListener('input', updatePreview);

function updatePreview() {
    const content = markdownInput.value;
    markdownPreview.innerHTML = marked.parse(content);
}

// 插入文本工具函数
function insertText(text) {
    const start = markdownInput.selectionStart;
    const end = markdownInput.selectionEnd;
    const selectedText = markdownInput.value.substring(start, end);
    
    markdownInput.value = markdownInput.value.substring(0, start) + 
                         text + 
                         markdownInput.value.substring(end);
    
    // 重新聚焦并设置光标位置
    markdownInput.focus();
    markdownInput.selectionStart = start + text.length;
    markdownInput.selectionEnd = start + text.length;
    
    updatePreview();
}

// 显示状态消息
function showStatus(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.className = isSuccess ? 'status-show status-success' : 'status-show status-error';
    
    setTimeout(() => {
        statusMessage.className = 'status-hidden';
    }, 3000);
}

// 保存到 GitHub
async function saveToGitHub() {
    const content = markdownInput.value;
    const filename = filenameInput.value || 'untitled.md';
    const folder = folderInput.value;
    const message = messageInput.value || `Update ${filename}`;

    if (!content.trim()) {
        showStatus('错误：内容不能为空', false);
        return;
    }

    if (!filename.endsWith('.md')) {
        showStatus('错误：文件名必须以 .md 结尾', false);
        return;
    }

    try {
        showStatus('正在保存...', true);
        
        const response = await fetch('/api/save-markdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                filename,
                message,
                folder
            }),
        });

        const result = await response.json();

        if (result.success) {
            showStatus('✅ 文件保存成功！');
            loadFileList(); // 刷新文件列表
        } else {
            showStatus('❌ 保存失败: ' + result.error, false);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ 网络错误，请检查后端服务', false);
    }
}

// 加载文件列表
async function loadFileList() {
    try {
        const folder = folderInput.value;
        const response = await fetch(`/api/files?folder=${encodeURIComponent(folder)}`);
        const result = await response.json();

        if (result.success) {
            displayFiles(result.files);
        } else {
            console.error('Error loading files:', result.error);
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// 显示文件列表
function displayFiles(files) {
    if (files.length === 0) {
        fileListContainer.innerHTML = '<p>暂无文件</p>';
        return;
    }

    fileListContainer.innerHTML = files.map(file => `
        <div class="file-item">
            <h4>${file.name}</h4>
            <p>路径: ${file.path}</p>
            <div class="file-actions">
                <button onclick="window.open('${file.url}', '_blank')">查看</button>
                <button onclick="window.open('${file.download_url}', '_blank')">下载</button>
            </div>
        </div>
    `).join('');
}

// 页面加载时获取文件列表
document.addEventListener('DOMContentLoaded', function() {
    loadFileList();
    // 设置定时刷新文件列表
    setInterval(loadFileList, 30000); // 每30秒刷新一次
});
```

## 第五步：运行项目

### 启动后端服务

```bash
cd backend
npm install
npm start
```

### 访问前端页面

打开浏览器访问：`http://localhost:3001`

## 第六步：环境变量配置

1. 在 `backend/.env` 文件中填写你的配置：
   - `GITHUB_TOKEN`: 你的 GitHub Personal Access Token
   - `GITHUB_OWNER`: 你的 GitHub 用户名
   - `GITHUB_REPO`: 你的仓库名称
   - `GITHUB_BRANCH`: 目标分支名称（默认为 main）

## 安全注意事项

1. **不要将 .env 文件提交到版本控制**
2. **使用 .gitignore 忽略敏感文件**
3. **在生产环境中使用环境变量而不是文件**
4. **限制 GitHub Token 的权限范围**

## 故障排除

1. **CORS 错误**: 确保后端服务正在运行
2. **401 错误**: 检查 GitHub Token 是否正确
3. **404 错误**: 确认仓库、分支和路径存在

这个方案提供了一个完整的、可扩展的 Markdown 编辑器，可以直接将内容保存到你的 GitHub 仓库。