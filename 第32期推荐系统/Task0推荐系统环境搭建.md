

## 项目环境

操作系统：macos10.14

MySQL: 8.0.16

Redis：5.0.14

Mongodb：5.0.5

Python 3.8

后端：PyCharm 2021

前端：WebStorm 

数据库连接：Nivacate for mysql



## 数据库安装

MySQL安装： https://www.jianshu.com/p/199492627ccc

redis安装：https://www.cnblogs.com/zhouxihi/p/14432125.html （需要brew）

mongodb :https://www.cnblogs.com/bluealine/p/8508867.html



## 前端项目运行

1. 安装依赖：cnpm install

2. 修改前端访问IP和端口

   1. 修改package.json文件49行

   ```
   "scripts": {
     "test": "echo \"Error: no test specified\" && exit 1",
     "dev": "webpack-dev-server --open --port 8686 --contentBase src --hot --host 127.0.0.1",
     "start": "nodemon src/main.js"
   },
   
   ```

3. 修改访问后端API接口的IP和端口

   1. 修改main.js

      ```
      // Vue.prototype.$http = axios
      Vue.use(VueAxios, axios);
      // axios公共基路径，以后所有的请求都会在前面加上这个路径
      // axios.defaults.baseURL = "http://10.170.4.60:3000";
      // axios.defaults.baseURL = "http://47.108.56.188:3000";
      axios.defaults.baseURL = "http://127.0.0.1:5000"
      ```

4. 运行前端项目

   ```
   npm run dev
   ```

   



## 后端项目运行

1. 安装anaconda3

2. 导入项目

3. 安装依赖(pycharm可自动安装)

   ```
   pip install -r requirements.txt
   ```

4. 修改后端项目的IP和端口

   1. server.py  233行

      ```
      if __name__ == '__main__':
          # 允许服务器被公开访问
          # app.run(debug=True, host='0.0.0.0', port=3000, threaded=True)
          # 只能被自己的机子访问
          app.run(debug=True, host='127.0.0.1', port=5000, threaded=True)
      
      ```

5. 修改项目路径配置文件proj_path.py

   ```
   # home_path = os.environ['HOME']
   # proj_path = home_path + "/fun-rec/codes/news_recsys/news_rec_server/"
   proj_path = os.path.join(sys.path[1], '')
   
   ```

6. 核对数据库配置文件dao_config.py

   ```
   # 数据库相关的配置文件
   user_info_db_name = "userinfo" # 用户数据相关的数据库
   register_user_table_name = "register_user" # 注册用户数据表
   user_likes_table_name = "user_likes" # 用户喜欢数据表
   user_collections_table_name = "user_collections" # 用户收藏数据表
   user_read_table_name = "user_read"   # 用户阅读数据表
   exposure_table_name_prefix = "exposure" # 用户曝光数据表的前缀
   
   # log数据，每天都会落一个盘，并由时间信息进行命名
   loginfo_db_name = "loginfo" # log数据库
   loginfo_table_name_prefix = "log" # log数据表的前缀
   
   # 默认配置
   mysql_username = "heitao"
   mysql_passwd = "520011"
   mysql_hostname = "localhost"
   mysql_port = "3306"
   
   # MongoDB
   mongo_hostname = "127.0.0.1"
   mongo_port = 27017
   # Sina原始数据
   sina_db_name= "SinaNews"
   sina_collection_name_prefix= "news"
   # 物料池db name 
   material_db_name = "NewsRecSys"
   ```

7. 启动雪花算法服务

   ```
   snowflake_start_server --address=127.0.0.1 --port=8910 --dc=1 --worker=1
   ```

8. 启动后端项目

   ```
   python server.py
   ```

**注意：这里会卡住，主要是因为电脑内存不足**

## 项目整体运行与调试

1. 注册用户

2. 爬取新浪新闻

   运行/materials/news_scrapy/sinanews/run.py  添加参数 —pages=30

3. 更新物料画像

   运行代码materials/process_material.py 

4. 更新用户画像

   运行代码materials/process_user.py

5. 清除前一天redis中的数据，更新最新今天最新的数据

   运行代码 materials/update_redis.py

6. 离线将推荐列表和热门列表存入redis

   运行代码 recprocess/offline.py

7. 重新登录用户查看新闻
