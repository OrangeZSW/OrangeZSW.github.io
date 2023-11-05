---
title: Echarts
date: 2023-11-01 16:48:10
categories: 学习
tags: Echarts
cover: https://cdn.jsdelivr.net/gh/OrangeZSW/blog_img/blog_img/image-20231101170341911.png
---

[Echarts 官网](https://echarts.apache.org/zh/index.html)																																									:star:

## :book:安装

```sh
npm i echarts -S
```

## :link:引入

```js
import * as echarts from "echarts";
```

## 例子：

### 后端接口

```java
package online.zorange.springboot.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.date.Quarter;
import online.zorange.springboot.common.Result;
import online.zorange.springboot.entity.User;
import online.zorange.springboot.service.IUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/echarts")
public class EchartsController {
    @Resource
    private IUserService userService;
    /**
     * 获取数据
     * @return Result
     */
    @GetMapping("/get")
    public Result get(){
        Map<String,Object> map = new HashMap<>();
        map.put("x", CollUtil.newArrayList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"));
        map.put("y", CollUtil.newArrayList(820, 932, 901, 934, 1290, 1330, 1320));
        return Result.success(map);
    }

    /**
     * 获取各季度新增用户数量
     * @return Result
     */
    @GetMapping("members")
    public Result members(){
        List<User> users=userService.list();
        int q1=0;
        int q2=0;
        int q3=0;
        int q4=0;
        for(User user : users){
            Date creatTime=user.getCreatTime();
            //获取季度
            Quarter quarter= DateUtil.quarterEnum(creatTime);
            switch (quarter){
                case Q1: q1++;break;
                case Q2: q2++;break;
                case Q3: q3++;break;
                case Q4: q4++;break;
            }
        }
        return Result.success(CollUtil.newArrayList(q1,q2,q3,q4));
    }
}

```

### 前端

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
import  * as  echarts from 'echarts';
export default {
  name: "Home",
  data(){
    return{

    }
  },
  mounted() { //页面元素渲染之后再触发
    //折线图
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);
    let option;
    option = {
      title:{
        text:'会员统计',
        subtext:'各季度会员统计',
        left:'center',
      },
      xAxis: {
        type: 'category',
        data: ['第一季度', '第二季度', '第三季度', '第四季度']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [],
          type: 'line'
        },
        {
          data: [],
          type: 'bar'
        }
      ]
    };

    //饼图
    const pieDom = document.getElementById('pie');
    const pieChar = echarts.init(pieDom);
    let peiOption = {
      title:{
        text:'会员统计',
        subtext:'比例图',
        left:'center',
      },
      legend: {
        top: 'bottom'
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      series: [
        {
          type: 'pie',
          radius: [50, 250],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 8
          },
          data: []
        }
      ]
    };

    //异步请求数据
    this.request.get("/echarts/members").then(res=>{
      console.log(res)
      option.series[0].data = res.data
      option.series[1].data = res.data
      // 数据更新后，需要刷新图表
      myChart.setOption(option);

      peiOption.series[0].data = [
        {name:'第一季度' ,value:res.data[0]},
        {name:'第二季度' ,value:res.data[1]},
        {name:'第三季度' ,value:res.data[2]},
        {name:'第四季度' ,value:res.data[3]},
      ]
      pieChar.setOption(peiOption);
    })
  }
}
</script>

<style scoped>

</style>
```
