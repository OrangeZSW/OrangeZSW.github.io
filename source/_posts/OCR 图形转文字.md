---
title: OCR 图形转文字
date: 2022-12-20 00:16:34
categories: Code
tags: OCR
cover: http://oss.zorange.online/blog/ORC.png
---

# OCR 图像转文字

## 涉及涉及软件：

### Snipaste

1. 功能：快捷截图
2. 优点：方便、快捷、小巧、、

### Tesseract-OCR

1. 功能：Tesseract-OCR 是一种开源的文本识别软件，可以将扫描的文档或者图片中的文本识别成电子文本。它可以识别多种语言，包括英语、法语、德语、西班牙语、意大利语和许多其他语言。

 Tesseract-OCR 使用神经网络技术来识别文本，并且可以在许多操作系统上运行，包括 Windows、Linux 和 MacOS。它可以被用于 自 动化文档处理、文本挖掘和其他应用程序中。

 Tesseract-OCR 还可以支持自定义字体，并且可以通过训练来提高识别精度。它提供了一组命令行工具，可以用来进行文本识别和处 理。

2. 优点：优点：开源、多语言支持、自定义字体、跨平台等。

### 具体思路:

用 Snipaste 来快捷截图，可以一次性将想要识别的图片分多次截取，Snipate 的图片名称和路径都是可以自定义的。那么在获取图片路径时是可以实现自动获取的

缺点：因为每个的 Snipaste 的设置可能个有不同，因此换用户时，需要修改程序的规制。

用 python 编程，获取图片路径，ORC 来识别图片文字。设计一个 GUI 来显示识别的文字，和交互按钮来供用户进行下一步的操作。

### 实现代码:

```python

import datetime
import pytesseract
from PIL import Image
import tkinter

# 定义 Tkinter 界面
root = tkinter.Tk()
root.title("OCR图片转文字")
# 获取屏幕宽度和高度
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()

# 计算窗口的位置
x = (screen_width - 500) // 2
y = (screen_height - 300) // 2

# 设置窗口的位置和大小
root.geometry("500x300+{}+{}".format(x, y))

# 定义文本区域
text = tkinter.Text(root, font=("微软雅黑", 10, 'bold'))
text.place(x=0, y=0, width=350, height=300)
text.config(fg="black")
text.insert("end", "hello")

# 定义标签1
lab_one = tkinter.Label(root, text='URL:', font=("Arial", 16, 'bold'))
lab_one.place(x=360, y=30)

# 定义文本区域
entry_id = tkinter.Entry(root, font=('Arial', 12, 'bold'))
entry_id.place(x=410, y=30)
entry_id.insert("end","-1")

# 定义标签2
lab_now = tkinter.Label(root, text='0', font=('Arial', 20, 'bold'))
lab_now.place(x=450, y=70)

# 定义获取日期函数
def data():
    y = '_' + str(datetime.datetime.now().year)
    m = '-' + str(datetime.datetime.now().month) + '-'
    d = str(datetime.datetime.now().day) + "_"
    return y + m + d

# 定义按钮点击函数
def button_click():
    url=entry_id.get()
    if(url=='-1'):
        url=str(int(lab_now.cget("text"))+1)
        lab_now.config(text=url)
    elif(int(url)>int(lab_now.cget("text"))):
        lab_now.config(text=url)
    image_url='E:\\截图\\Orange'+data()+url+".png"
    print(image_url)
    try:
        image=Image.open(image_url)
    except:
        lab_now.config(text=str(int(url)-1))
    # 使用中文和英文的 OCR 识别，使用单列模式进行OCR识别
    out = pytesseract.image_to_string(image, lang="chi_sim+eng", config="--psm 6")

    text.delete("1.0","end")
    text.insert("1.0",out)

button1=tkinter.Button(root,text="获取",font=("Arial",16,'bold'),command=button_click)
button1.place(x=360,y=70)

# 点击next按钮事件
def click_next():
    entry_id.delete(0,"end")
    entry_id.insert(0,"-1")
    # print(entry_id.get())
    button_click()

# 自动向前按钮
button_go=tkinter.Button(root,text="max_next",font=("微软雅黑",10,'bold'),command=click_next)
button_go.place(x=360,y=120)



if __name__ == '__main__':
    root.mainloop()

```
