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