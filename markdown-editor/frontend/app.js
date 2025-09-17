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
const defaultContent = `

---
title: 
date: 
categories: 
tags: 
cover:
---
# 欢迎使用 Markdown 编辑器

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

// 更新Markdown预览
function updatePreview() {
    const markdownPreview = document.getElementById('markdown-preview');
    if (markdownPreview && window.marked) {
        markdownPreview.innerHTML = window.marked.parse(markdownInput.value);
    }
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


// 页面加载时获取文件列表
document.addEventListener('DOMContentLoaded', function() {
    loadFileList();
    // 设置定时刷新文件列表
    setInterval(loadFileList, 30000); // 每30秒刷新一次
});


// 删除文件函数
async function deleteFile(filename) {
    if (!confirm(`确定要删除文件 "${filename}" 吗？此操作不可撤销。`)) {
        return;
    }

    const folder = document.getElementById('folder').value;

    try {
        showStatus('正在删除文件...', true);

        const response = await fetch('/api/delete-file', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                folder
                // 不再需要传递 message 参数
            }),
        });

        const result = await response.json();

        if (result.success) {
            showStatus('✅ 文件删除成功！');
            loadFileList(); // 刷新文件列表
        } else {
            showStatus('❌ 删除失败: ' + result.error, false);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ 删除过程中出现错误', false);
    }
}

// 批量删除文件
async function deleteFiles(filenames) {
    if (!confirm(`确定要删除选中的 ${filenames.length} 个文件吗？此操作不可撤销。`)) {
        return;
    }

    const folder = document.getElementById('folder').value;

    try {
        showStatus(`正在删除 ${filenames.length} 个文件...`, true);

        const response = await fetch('/api/delete-files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filenames,
                folder
                // 不再需要传递 message 参数
            }),
        });

        const result = await response.json();

        if (result.success) {
            showStatus(`✅ 成功删除 ${result.deleted_count} 个文件！`);
            loadFileList(); // 刷新文件列表
        } else {
            showStatus(`❌ 删除完成，成功 ${result.deleted_count} 个，失败 ${result.failed_count} 个`, false);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ 删除过程中出现错误', false);
    }
}



let currentFileSha = null;
let currentEditingFile = null;

// 新建文件
function newFile() {
    if (currentFile.isEditing && !confirm('确定要放弃当前编辑的内容吗？')) {
        return;
    }

    markdownInput.value = '# 新文档\n\n开始编写你的内容...';
    filenameInput.value = `document-${Date.now()}.md`;
    document.getElementById('message').value = '';

    // 重置文件状态
    currentFile = {
        name: null,
        sha: null,
        isEditing: false
    };

    updateSaveButton();
    updatePreview();
    showStatus('✅ 已创建新文档');
}
// 取消编辑
function cancelEdit() {
    currentFileSha = null;
    currentEditingFile = null;
    updateSaveButton();
    showStatus('✅ 已取消编辑模式');
}

// 保存到 GitHub（新建文件）
async function saveToGitHub() {
    const content = markdownInput.value;
    const filename = filenameInput.value;
    const folder = document.getElementById('folder').value;
    const message = document.getElementById('message').value;

    if (!content.trim()) {
        showStatus('错误：内容不能为空', false);
        return;
    }

    if (!filename.endsWith('.md')) {
        showStatus('错误：文件名必须以 .md 结尾', false);
        return;
    }

    try {
        showStatus('正在保存文件...', true);

        const requestBody = {
            content,
            filename,
            message: message || `添加${filename}`,
            folder
        };

        // 只有在编辑现有文件时才传递SHA
        if (currentEditingFile && currentFileSha) {
            requestBody.sha = currentFileSha;
        }

        const response = await fetch('/api/save-markdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (result.success) {
            // 更新SHA和当前编辑状态
            currentFileSha = result.sha;
            if (!currentEditingFile) {
                currentEditingFile = filename;
                updateSaveButton();
            }

            showStatus('✅ 文件保存成功！');
            loadFileList(); // 刷新文件列表
        } else {
            showStatus('❌ 保存失败: ' + result.error, false);

            // 如果是并发冲突，重新加载文件
            if (result.error.includes('文件已被修改')) {
                setTimeout(() => {
                    if (currentEditingFile) {
                        loadFileForEditing(currentEditingFile);
                    }
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ 保存过程中出现错误', false);
    }
}


// 保存文件函数
async function saveFile() {
    const content = document.getElementById('markdown-input').value;
    const filename = document.getElementById('filename').value;
    const folder = document.getElementById('folder').value;
    const message = document.getElementById('message').value;

    if (!content.trim()) {
        alert('错误：内容不能为空');
        return;
    }

    if (!filename.endsWith('.md')) {
        alert('错误：文件名必须以 .md 结尾');
        return;
    }

    try {
        // 显示加载状态
        const saveButton = document.querySelector('.btn-primary');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...';
        saveButton.disabled = true;

        const response = await fetch('/api/save-markdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                filename,
                message: message || `更新${filename}`,
                folder
            }),
        });

        const result = await response.json();

        // 恢复按钮状态
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;

        if (result.success) {
            alert('✅ 文件保存成功！');
            // 刷新文件列表
            loadFileList();
        } else {
            alert('❌ 保存失败: ' + result.error);
            console.error('保存错误详情:', result);
        }
    } catch (error) {
        console.error('网络错误:', error);
        alert('❌ 网络错误，请检查连接');

        // 恢复按钮状态
        const saveButton = document.querySelector('.btn-primary');
        saveButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 保存文件';
        saveButton.disabled = false;
    }
}

// 加载文件列表
async function loadFileList() {
    try {
        const folder = document.getElementById('folder').value;
        const response = await fetch(`/api/files?folder=${encodeURIComponent(folder)}`);
        const result = await response.json();

        if (result.success) {
            displayFiles(result.files);
        } else {
            console.error('加载文件列表错误:', result.error);
        }
    } catch (error) {
        console.error('加载文件列表错误:', error);
    }
}

// 显示状态消息
function showStatus(message, isSuccess = true) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = isSuccess ? 'status-show status-success' : 'status-show status-error';

        setTimeout(() => {
            statusElement.className = 'status-hidden';
        }, 3000);
    }
}


// 更新保存按钮状态
function updateSaveButton() {
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.querySelector('.btn-cancel');
    const editStatus = document.getElementById('edit-status');
    const currentFileName = document.getElementById('current-file-name');

    if (!saveButton) return;

    if (currentFile.isEditing) {
        saveButton.innerHTML = '<i class="fas fa-sync-alt"></i> 更新文件';
        saveButton.onclick = saveFile;
        if (cancelButton) cancelButton.style.display = 'inline-block';
        if (editStatus) editStatus.className = 'edit-status-show';
        if (currentFileName) currentFileName.textContent = `正在编辑: ${currentFile.name}`;
    } else {
        saveButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 保存文件';
        saveButton.onclick = saveFile;
        if (cancelButton) cancelButton.style.display = 'none';
        if (editStatus) editStatus.className = 'edit-status-hidden';
    }

    console.log('按钮状态更新:', currentFile);
}

// 调试功能
function toggleDebug() {
    const debugInfo = document.querySelector('.debug-info');
    debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
}

// 更新调试信息
function updateDebugInfo() {
    document.getElementById('debug-current-file').textContent = currentEditingFile || '无';
    document.getElementById('debug-current-sha').textContent = currentFileSha ? currentFileSha.substring(0, 8) + '...' : '无';
}


// 加载文件内容用于编辑
async function loadFileForEditing(filename) {
    try {
        showStatus('正在加载文件...', true);

        const folder = document.getElementById('folder').value;
        const response = await fetch(`/api/get-file?filename=${encodeURIComponent(filename)}&folder=${encodeURIComponent(folder)}`);
        const result = await response.json();

        if (result.success) {
            document.getElementById('markdown-input').value = result.content;
            document.getElementById('filename').value = result.filename;

            // 不需要管理SHA状态了
            showStatus('✅ 文件加载成功！');

            // 更新预览
            if (window.marked) {
                document.getElementById('markdown-preview').innerHTML = window.marked.parse(result.content);
            }
        } else {
            showStatus('❌ 加载失败: ' + result.error, false);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ 加载过程中出现错误', false);
    }
}


// 显示文件列表
function displayFiles(files) {
    if (!fileListContainer) return;

    if (files.length === 0) {
        fileListContainer.innerHTML = '<p>暂无文件</p>';
        return;
    }

    fileListContainer.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-header">
                <h4>${file.name}</h4>
            </div>
            <p>路径: ${file.path}</p>
            <p>大小: ${formatFileSize(file.size)}</p>
            <div class="file-actions">
                <button onclick="loadFileForEditing('${file.name}')" class="btn-edit">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button onclick="window.open('${file.url}', '_blank')" class="btn-view">
                    <i class="fas fa-eye"></i> 查看
                </button>
                <button onclick="window.open('${file.download_url}', '_blank')" class="btn-download">
                    <i class="fas fa-download"></i> 下载
                </button>
                <button onclick="deleteFile('${file.name}')" class="btn-delete">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
    `).join('');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 测试SHA功能
async function testShaHandling() {
    const testSha = 'efd331ef1e18c177897360e4784ea1298c2b60b1';

    try {
        const response = await fetch('/api/debug-sha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: 'test',
                filename: 'test.md',
                message: 'test',
                sha: testSha
            }),
        });

        const result = await response.json();
        console.log('SHA测试结果:', result);
        return result;
    } catch (error) {
        console.error('SHA测试错误:', error);
    }
}

// 在控制台运行测试
console.log('运行SHA测试: testShaHandling()');


// 全局变量定义
let currentFile = {
    name: null,
    sha: null,
    isEditing: false
};


// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，初始化编辑器...');

    // 设置默认内容
    if (markdownInput) {
        markdownInput.value = '# 欢迎使用 Markdown 编辑器\n\n开始编写你的内容...';
        updatePreview();
    }

    // 添加输入监听器
    if (markdownInput) {
        markdownInput.addEventListener('input', updatePreview);
    }

    // 加载文件列表
    loadFileList();

    // 设置定时刷新文件列表
    setInterval(loadFileList, 30000);

    console.log('编辑器初始化完成');
});


