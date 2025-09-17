FROM node:22-alpine
LABEL authors="orange"

WORKDIR /app/markdown-editor/backend

# 先只复制 package.json 和锁文件
COPY ./markdown-editor/backend/package*.json ./
COPY ./markdown-editor/backend/package-lock.json* ./

# 安装依赖
RUN npm ci --only=production  # 使用 ci 命令而不是 install

# 然后复制源代码
COPY ./markdown-editor/backend/ ./

EXPOSE 3000
CMD ["npm", "start"]