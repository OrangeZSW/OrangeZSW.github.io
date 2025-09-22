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

// 获取文件内容 - 简化版
app.get('/api/get-file', async (req, res) => {
    try {
        const { filename, folder = '' } = req.query;

        if (!filename) {
            return res.status(400).json({
                success: false,
                error: '文件名是必需的'
            });
        }

        const filePath = folder ? `${folder}/${filename}` : filename;

        const response = await octokit.repos.getContent({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            ref: process.env.GITHUB_BRANCH,
            path: filePath
        });

        const content = Buffer.from(response.data.content, 'base64').toString('utf8');

        res.json({
            success: true,
            filename: filename,
            content: content,
            // 不再返回SHA给前端，因为不需要了
            path: response.data.path,
            html_url: response.data.html_url
        });

    } catch (error) {
        if (error.status === 404) {
            res.status(404).json({
                success: false,
                error: '文件不存在'
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

app.post('/api/save-markdown', async (req, res) => {
    try {
        const { content, filename, message, folder = '' } = req.body;

        // 基本验证
        if (!content || !filename) {
            return res.status(400).json({
                success: false,
                error: '内容和文件名是必需的'
            });
        }

        const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
        const filePath = folder ? `${folder}/${finalFilename}` : finalFilename;
        const branch = process.env.GITHUB_BRANCH || 'main';

        console.log('保存文件:', { filePath, contentLength: content.length, branch });

        // 直接使用 fetch API 而不是 Octokit
        const githubApiUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${encodeURIComponent(filePath)}`;

        try {
            // 1. 首先检查文件是否存在以获取 SHA
            let sha = null;
            const getResponse = await fetch(`${githubApiUrl}?ref=${branch}`, {
                method: 'GET',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'User-Agent': 'Markdown-Editor-App',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (getResponse.ok) {
                const fileData = await getResponse.json();
                if (fileData && fileData.sha) {
                    sha = fileData.sha;
                    console.log('找到现有文件，SHA:', sha);
                }
            } else if (getResponse.status !== 404) {
                // 如果不是404错误，抛出异常
                const errorData = await getResponse.json();
                throw new Error(`获取文件信息失败: ${getResponse.status} - ${errorData.message}`);
            }

            // 2. 准备请求体
            const requestBody = {
                message: message || `更新 ${finalFilename}`,
                content: Buffer.from(content).toString('base64'),
                branch: branch,
                committer: {
                    name: 'Markdown Editor',
                    email: 'editor@example.com'
                }
            };

            // 3. 只有在文件已存在时才添加 SHA
            if (sha) {
                requestBody.sha = sha;
            }

            console.log('请求体 SHA:', requestBody.sha);

            // 4. 创建或更新文件
            const putResponse = await fetch(githubApiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Markdown-Editor-App',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await putResponse.json();

            if (putResponse.ok) {
                res.json({
                    success: true,
                    message: '文件保存成功',
                    data: {
                        sha: result.content?.sha,
                        url: result.content?.html_url,
                        download_url: result.content?.download_url,
                        commit: result.commit
                    }
                });
            } else {
                let errorMessage = result.message || '保存文件时发生错误';

                if (putResponse.status === 409) {
                    errorMessage = '文件已被修改，请刷新后重试';
                } else if (putResponse.status === 403) {
                    errorMessage = '权限不足，请检查GitHub token权限';
                } else if (putResponse.status === 401) {
                    errorMessage = '认证失败，请检查GitHub token';
                } else if (putResponse.status === 422) {
                    errorMessage = '请求无效: ' + result.message;
                }

                res.status(putResponse.status).json({
                    success: false,
                    error: errorMessage,
                    details: result
                });
            }

        } catch (error) {
            console.error('GitHub API 错误:', error.message);
            res.status(500).json({
                success: false,
                error: 'GitHub API 错误: ' + error.message
            });
        }

    } catch (error) {
        console.error('服务器内部错误:', error.message);
        res.status(500).json({
            success: false,
            error: '服务器内部错误: ' + error.message
        });
    }
});
// 添加调试端点
app.get('/api/debug-save', async (req, res) => {
    try {
        const testContent = '# Test File\n\nThis is a test file.';
        const testFilename = `test-debug-${Date.now()}.md`;

        // 测试创建新文件（不传递SHA）
        const createResponse = await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH,
            path: testFilename,
            message: 'Test create file',
            content: Buffer.from(testContent).toString('base64'),
            committer: {
                name: process.env.COMMITTER_NAME,
                email: process.env.COMMITTER_EMAIL
            }
        });

        const sha = createResponse.data.content.sha;

        // 测试更新文件（传递SHA）
        const updateResponse = await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH,
            path: testFilename,
            message: 'Test update file',
            content: Buffer.from(testContent + '\n\nUpdated content').toString('base64'),
            sha: sha,
            committer: {
                name: process.env.COMMITTER_NAME,
                email: process.env.COMMITTER_EMAIL
            }
        });

        // 清理测试文件
        await octokit.repos.deleteFile({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            branch: process.env.GITHUB_BRANCH,
            path: testFilename,
            message: 'Cleanup test file',
            sha: updateResponse.data.content.sha
        });

        res.json({
            success: true,
            test: 'API连接正常',
            create: createResponse.data,
            update: updateResponse.data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data
        });
    }
});

// 添加调试端点来检查SHA处理
app.post('/api/debug-sha', async (req, res) => {
    try {
        const { content, filename, message, folder = '', sha } = req.body;

        console.log('调试SHA - 原始请求:', {
            filename,
            sha: sha,
            shaType: typeof sha,
            shaLength: sha ? sha.length : 0,
            hasSha: !!sha
        });

        // 检查SHA格式
        if (sha) {
            const isValidSha = /^[a-f0-9]{40}$/.test(sha);
            console.log('SHA验证:', { isValidSha, sha });
        }

        res.json({
            success: true,
            received: {
                sha: sha,
                sha_type: typeof sha,
                sha_length: sha ? sha.length : 0,
                is_valid_sha: sha ? /^[a-f0-9]{40}$/.test(sha) : false
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 添加调试端点
app.get('/api/debug-request', async (req, res) => {
    console.log('=== 完整请求分析 ===');
    console.log('请求头:', req.headers);
    console.log('请求体原始数据:', req.body);
    console.log('JSON解析:', JSON.stringify(req.body, null, 2));

    // 检查SHA值的每个字符
    if (req.body.sha) {
        console.log('SHA字符分析:');
        const sha = req.body.sha;
        for (let i = 0; i < sha.length; i++) {
            console.log(`位置 ${i}: '${sha[i]}' (ASCII: ${sha.charCodeAt(i)})`);
        }
    }

    res.json({ received: req.body });
});

// 添加原始HTTP测试端点
app.get('/api/test-raw-request', async (req, res) => {
    try {
        const { content, filename, sha } = req.body;

        // 使用node-fetch直接调用GitHub API
        const response = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Markdown-Editor'
                },
                body: JSON.stringify({
                    message: 'Test direct API call',
                    content: Buffer.from(content).toString('base64'),
                    ...(sha && { sha: sha })
                })
            }
        );

        const result = await response.json();

        res.json({
            success: response.ok,
            status: response.status,
            data: result
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 在路由前添加中间件调试
app.use((req, res, next) => {
    if (req.path === '/api/save-markdown' && req.method === 'POST') {
        console.log('中间件 - 请求体类型:', typeof req.body);
        console.log('中间件 - 请求体键名:', Object.keys(req.body));
        if (req.body.sha !== undefined) {
            console.log('中间件 - SHA存在:', req.body.sha);
        }
    }
    next();
});

// 确保body解析器正确配置
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            console.log('JSON解析错误:', e.message);
        }
    }
}));


// 测试原始GitHub API调用
app.post('/api/test-github-api', async (req, res) => {
    try {
        const testContent = '# Test Content\n\nThis is a test file.';
        const testFilename = `test-${Date.now()}.md`;
        const testMessage = 'Test API call';

        const githubApiUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${testFilename}`;

        const requestBody = {
            message: testMessage,
            content: Buffer.from(testContent).toString('base64'),
            branch: process.env.GITHUB_BRANCH
        };

        console.log('测试请求:', {
            url: githubApiUrl,
            body: requestBody
        });

        const response = await fetch(githubApiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Markdown-Editor-Test',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        // 清理测试文件
        if (response.ok && result.content && result.content.sha) {
            await fetch(githubApiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Markdown-Editor-Test'
                },
                body: JSON.stringify({
                    message: 'Cleanup test file',
                    sha: result.content.sha,
                    branch: process.env.GITHUB_BRANCH
                })
            });
        }

        res.json({
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            response: result,
            request: {
                url: githubApiUrl,
                headers: {
                    Authorization: 'token ***', // 隐藏token
                    'Content-Type': 'application/json',
                    'User-Agent': 'Markdown-Editor-Test'
                },
                body: {
                    message: testMessage,
                    content: '[BASE64_CONTENT]',
                    branch: process.env.GITHUB_BRANCH
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Markdown Editor API ready`);
});