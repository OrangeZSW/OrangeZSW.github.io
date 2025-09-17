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