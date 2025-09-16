---
title: find_in_set
date: 2025-09-16
categories: 技术
tags: 
cover: 
---


- find_in_set可以查询以逗号分隔中是否存在某一个数据

```sql
 select count(*)
        from sys_template
        where read_user_id is null or not find_in_set(#{id},read_user_id)
```

