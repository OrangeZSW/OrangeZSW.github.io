---
title: Echarts
date: 2023-11-01 16:48:10
categories: 学习
tags: Echarts
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231101170341911.png
---

# Echarts

[Echarts 官网](https://echarts.apache.org/zh/index.html)

## :book:安装

```sh
npm i echarts -S
```

## :link:引入

```js
import * as echarts from "echarts";
```

## 后端接口

```java
package online.zorange.springboot.controller;

import cn.hutool.core.collection.CollUtil;
import online.zorange.springboot.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/echarts")
public class EchartsController {
    @GetMapping("/get")
    public Result get(){
        Map<String,Object> map = new HashMap<>();
        map.put("x", CollUtil.newArrayList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"));
        map.put("y", CollUtil.newArrayList(820, 932, 901, 934, 1290, 1330, 1320));
        return Result.success(map);
    }
}
```

## 前端

```vue
<template>
  <div>
    <!--      el-col：-->
    <!--      el-col是element-ui中的栅格布局组件，用于将页面分割成24列，通过控制el-col的span属性来控制元素占据的列数-->
    <!--      例如：el-col :span="12"表示元素占据12列，占据一半的宽度-->
    <el-row>
      <el-col :span="12">
        <div id="main" style="width: 600px;height:600px;"></div>
      </el-col>
      <el-col :span="12">
        <div id="pie" style="width: 600px;height:600px;"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "Home",
  data() {
    return {};
  },
  mounted() {
    //页面元素渲染之后再触发
    const chartDom = document.getElementById("main");
    const myChart = echarts.init(chartDom);
    let option;
    option = {
      xAxis: {
        type: "category",
        data: [],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [],
          type: "line",
        },
        {
          data: [],
          type: "bar",
        },
      ],
    };
    this.request.get("/echarts/get").then((res) => {
      console.log(res.data.x);
      option.xAxis.data = res.data.x;
      option.series[0].data = res.data.y;
      option.series[1].data = res.data.y;
      // 数据更新后，需要刷新图表
      myChart.setOption(option);
    });

    //饼图
    const pieDom = document.getElementById("pie");
    const pieChar = echarts.init(pieDom);
    let peiOption = {
      legend: {
        top: "bottom",
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          name: "Nightingale Chart",
          type: "pie",
          radius: [50, 250],
          center: ["50%", "50%"],
          roseType: "area",
          itemStyle: {
            borderRadius: 8,
          },
          data: [
            { value: 40, name: "rose 1" },
            { value: 38, name: "rose 2" },
            { value: 32, name: "rose 3" },
            { value: 30, name: "rose 4" },
            { value: 28, name: "rose 5" },
            { value: 26, name: "rose 6" },
            { value: 22, name: "rose 7" },
            { value: 18, name: "rose 8" },
          ],
        },
      ],
    };
    pieChar.setOption(peiOption);
  },
};
</script>

<style scoped></style>
```
