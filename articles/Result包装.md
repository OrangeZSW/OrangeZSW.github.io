## Result包装

### Result.java

```java
package online.orange.blog.common.base;


import lombok.Data;
import online.orange.blog.common.constants.ResponseCode;
@Data
public class Result<T> {
    private String code;
    private String msg;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResponseCode.SUCCESS);
        result.setMsg("success");
        result.setData(data);
        return result;
    }

    public static Result<Void> success() {
        return success(null);
    }

    public static <T> Result<T> error(String code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(message);
        return result;
    }

    public static <T> Result<T> error(String message) {
        return error(ResponseCode.FAIL, message);
    }

}


```

### Constant.java

```java
package zorange.online.blogserver.common;

/*
 * 用于存放常量
 * 常量接口
 */
public interface Constants {
    //操作成功
    String CODE_SUCCESS = "200";
    String MSG_SUCCESS = "操作成功";

    //系统错误
    String CODE_ERROR = "500";
    String MSG_ERROR = "系统错误";
    //参数错误
    String CODE_PARAM_ERROR = "400";
    String MSG_PARAM_ERROR = "参数错误";
    //其他业务异常
    String CODE_OTHER_ERROR = "501";
    String MSG_OTHER_ERROR = "其他业务异常";

    String CODE_NOT_LOGIN = "401";
    String MSG_NOT_LOGIN = "权限不足";

    String DICT_TYPE_ICON= "icon";

}
```