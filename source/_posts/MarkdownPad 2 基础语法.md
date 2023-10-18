---
title: MarkdownPad 2 基础语法
date: 2022-9-28 00:16:34
categories: 学习
tags: Markdown
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/Markdown.png
---

# MarkdownPad 2 基础语法

前言：

这篇是我为了写自己博客在网上自己找的一篇教程下对着做的，作者教程:https://blog.csdn.net/a1b2c300/article/details/53891125 因为以后写博客需要使用 MarkdownPad 2，因为想练一下手

## 标题：

```markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```

标题除了可以通过 #来设置，还可以通过 ctrl + 数字键 1,2,3 来设置

## 列表:

## 无序列表

语法很简单，只需要在你的文字前面加上一共 - 或 \* 就行了.

```markdown
-我是第一行 \*我是第二行 -我是第三行
```

## 有序列表

在文字前加 1. 2. 3. 的符号

```markdown
1.我是第一行 2.我是第二行 3.我是第三行
```

注意：- \* 等符号要和文字之间加一共空格

## 引用：

只需要在文本在之前加入 > 这种尖括号

```markdown
> 我一直在使用引用
> 重开始到现在
```

## 图片和链接

```markdown
图片为:![]()
链接为:[]()
```

示例：

```markdown
[图片名称](http://b.hiphotos.baidu.com/image/pic/item/0823dd54564e925838c205c89982d158ccbf4e)
```

体与斜体
Markdown 的粗体和斜体也非常简单，用两个 _ 包含一段文本就是粗体的语法，用一个 _ 包含一段文本就是斜体的语法。
例如：这是**粗体**，这是*斜体*

## 表格

```markdown
| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
```

表格还可以这样

```markdown
<table>
  <tr>
    <td>hello somebody told me</td>
    <td>hello</td>
  </tr>
  <tr>
    <td>sss</td>
    <td>dsdf</td>
  </tr>
</table>
```

效果如下:

<table>
  <tr>
    <td>hello somebody told me</td>
    <td>hello</td>
  </tr>
  <tr>
    <td>sss</td>
    <td>dsdf</td>
  </tr>
</table>

## 代码框

连续三个反引号 `，就是按键 1 前面的那个符号再加代码类型.

`代码`

## 横线

分割线的语法只需要三个 \* 号。

```markdown
---
```

---

## 转义字符

```markdown
\\ 反斜杠
\` 反引号 \* 星号
\_ 下划线
\{} 大括号
\[] 中括号
\() 小括号
\# 井号
\+ 加号
\- 减号
\. 英文句号
\! 感叹号
```

## 快捷键

```markdown
ctrl+1 一级标题
ctrl+2 二级标题
····
ctrl+shift+o 有序列表
ctrl+u 无序列表
ctrl+g 插入图片
ctrl+l 插入超链接
Ctrl+B 　粗体
Ctrl+I 　斜体
Ctrl+Q 　引用
Ctrl+K 　代码块
Ctrl+Shift+I 插入图片（复制的链接）
```
