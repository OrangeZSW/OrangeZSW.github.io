# js定时任务

```js
const tasks = []

const scheduledTasks = () => {
    const add = (task, time) => {
        // 使用任务的字符串表示（或者任务的唯一标识符）来判断任务是否已存在
        if (tasks.some((t) => t.task.name === task.name)) {
            console.log("Task already added.");
            return;
        }
        const intervalId = setInterval(() => {
            task();
        }, time);
        tasks.push({task, intervalId});
        console.log("Tasks {}.", tasks)
    };

    const clear = () => {
        tasks.forEach(({intervalId}) => {
            clearInterval(intervalId);
        });
        tasks.length = 0; // 清空任务队列
    };

    return {add, clear, tasks};  // 返回 tasks，方便外部访问
};

export default scheduledTasks;

```

