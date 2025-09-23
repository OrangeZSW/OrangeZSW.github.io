---
title: Python3初始化工作空间
date: 
categories: 
tags: 
cover:
---
# Python3初始化工作空间


```
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install requests pandas numpy  # 示例包
pip freeze > requirements.txt
```