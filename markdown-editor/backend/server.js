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

        // 明确指定分支参数
        const requestOptions = {
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: folder
        };

        // 只有在提供了分支时才添加 branch 参数
        if (process.env.GITHUB_BRANCH) {
            requestOptions.ref = process.env.GITHUB_BRANCH; // 使用 ref 而不是 branch
        }

        const response = await octokit.repos.getContent(requestOptions);

        const files = response.data
            .filter(item => item.type === 'file' && item.name.endsWith('.md'))
            .map(item => ({
                name: item.name,
                path: item.path,
                url: item.html_url,
                download_url: item.download_url,
                sha: item.sha,
                size: item.size
            }));

        res.json({ success: true, files });

    } catch (error) {
        console.error('Error fetching files:', error);

        // 提供更详细的错误信息
        if (error.status === 404) {
            res.status(404).json({
                success: false,
                error: '文件夹不存在或仓库路径错误'
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message || '获取文件列表时发生错误'
            });
        }
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

// 删除文件
app.delete('/api/delete-file', async (req, res) => {
    try {
        const { filename, message, folder = '' } = req.body;

        // 验证输入
        if (!filename) {
            return res.status(400).json({
                success: false,
                error: '文件名是必需的'
            });
        }

        // 构建文件路径
        const filePath = folder ? `${folder}/${filename}` : filename;

        console.log('Deleting file:', {
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH,
            path: filePath
        });

        // 首先获取文件信息（包括 SHA）
        let sha;
        try {
            const existingFile = await octokit.repos.getContent({
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                ref: process.env.GITHUB_BRANCH,
                path: filePath
            });
            sha = existingFile.data.sha;
            console.log('File SHA:', sha);
        } catch (error) {
            if (error.status === 404) {
                return res.status(404).json({
                    success: false,
                    error: '文件不存在'
                });
            }
            throw error;
        }

        // 删除文件
        const response = await octokit.repos.deleteFile({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH,
            path: filePath,
            message: message || `Delete ${filename}`,
            sha: sha,
            committer: {
                name: process.env.COMMITTER_NAME || 'Markdown Editor',
                email: process.env.COMMITTER_EMAIL || 'editor@example.com'
            }
        });

        console.log('File deleted successfully:', filename);

        res.json({
            success: true,
            message: '文件删除成功',
            deleted_file: filename,
            commit: response.data.commit
        });

    } catch (error) {
        console.error('Error deleting file:', error);
        console.error('Error details:', error.response?.data || error.message);

        let errorMessage = '删除文件时发生错误';
        let statusCode = 500;

        if (error.status === 403) {
            errorMessage = '权限不足，无法删除文件';
            statusCode = 403;
        } else if (error.status === 404) {
            errorMessage = '文件不存在';
            statusCode = 404;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.response?.data || error.message
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Markdown Editor API ready`);
});