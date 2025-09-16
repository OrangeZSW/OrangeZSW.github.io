```java
package zorange.utils;

// 引入Druid数据源工厂类


import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

/**
 * JDBC工具类，用于简化数据库连接和关闭资源的操作。
 */
public class JDBCUtil {
    // 静态数据源成员变量，用于整个应用共享一个数据源实例
    static DataSource dataSource;

    // 静态初始化块，用于在类加载时初始化数据源
    static{
        // 通过当前类的类加载器获取jdbc.properties资源配置文件的输入流
        InputStream is = JDBCUtil.class.getClassLoader().getResourceAsStream("jdbc.properties");
        // 创建Properties对象，用于装载配置文件中的键值对
        Properties properties = new Properties();
        try {
            // 加载输入流中的配置信息到Properties对象中
            properties.load(is);
        } catch (IOException e) {
            // 如果加载配置文件失败，抛出运行时异常
            throw new RuntimeException(e);
        }
        try {
            // 使用DruidDataSourceFactory创建数据源实例
            dataSource = DruidDataSourceFactory.createDataSource(properties);
        } catch (Exception e) {
            // 如果创建数据源失败，抛出运行时异常
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取数据库连接的方法。
     * @return 数据库连接对象
     * @throws SQLException 如果获取连接失败，则抛出SQLException
     */
    public static Connection getConnection() throws SQLException {
        // 从数据源中获取数据库连接
        return  dataSource.getConnection();
    }

    /**
     * 关闭数据库连接、Statement和ResultSet的方法，确保资源被正确释放。
     * @param conn 数据库连接
     * @param sta Statement对象
     * @param res ResultSet对象
     * @throws SQLException 如果关闭资源时发生错误，则抛出SQLException
     */
    public static void close(Connection conn, Statement sta, ResultSet res) throws SQLException {
        // 按照先创建的后关闭的顺序关闭资源
        if(res != null){ // 关闭ResultSet
            res.close();
        }
        if(sta != null){ // 关闭Statement
            sta.close();
        }
        if(conn != null){ // 关闭Connection
            conn.close();
        }
    }
}
```

