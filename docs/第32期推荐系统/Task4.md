# Task4 推荐系统前后端交互

 

## 前端框架Vant UI

### 项目目录

```
.
├── package.json  项目配置文件
├── package-lock.json
├── README.md  项目介绍
├── src
│   ├── App.vue  根组件
│   ├── assets  资源目录，这里的资源会被wabpack构建
│   │   ├── css  样式文件
│   │   │   ├── sign.css  登录注册页的样式
│   │   │   └── test.css  顶部导航样式
│   │   └── js  功能文件
│   │       └── cookie.js  定义cookie的相关操作
│   ├── components  组件
│   │   ├── bottomBar.vue  底部导航
│   │   ├── common.vue  存放全局变量
│   │   ├── hotLists.vue  热门页
│   │   ├── Myself.vue  个人中心
│   │   ├── NewsInfo.vue  新闻详情页
│   │   ├── recLists.vue  推荐页
│   │   ├── signIn.vue  登录
│   │   └── signUp.vue  注册
│   ├── index.html  首页入口文件
│   ├── main.js  入口js文件
│   ├── router.js   配置路由页面跳转
│   └── store.js  应用级数据（state）
├── vue.config.js  vue项目的配置文件，专用于vue项目
└── webpack.config.js  webpack的配置文件，所有使用webpack作为打包工具的项目都可以使用
```

### 页面功能

- 用户登录页面：输入用户名和密码，登录系统
- 用户注册页面：输入用户名、密码、验证密码、年龄，勾选性别和城市，进行用户注册，注册成功之后，将跳转到推荐页
- 推荐页面：展示用户推荐新闻列表，一次10条，上滑更新
- 热门页面：展示用户热门新闻列表，一次10条，上滑更新
- 新闻详情页面：展示新闻内容，收集用户点赞、收藏行为
- 个人中心页面：展示用户头像和用户名称，提供用户退出功能



## 后端框架Flask

### Flask介绍

Flask是一个轻量级的可定制web框架，具有很强的扩展性和兼容性，较其他同类型框架更为灵活、轻便、安全且容易上手。它可以很好地结合MVC模式进行开发，开发人员分工合作，小型团队在短时间内就可以完成功能丰富的中小型网站或Web服务的实现。

## Flask路由

路由是指用户请求的*URL*与*视图函数*之间的映射。Flask通过利用路由表将URL映射到对应的视图函数，根据视图函数的执行结果返回给WSGI服务器。路由表的内容是由开发者进行填充，主要有一下两个方式。

- **route装饰器**：使用Flask应用实例的*route*装饰器将一个URL规则绑定到 一个视图函数上

  ```
  @app.route('/test') # URL路径
  def test(): # 识图函数
    return 'this is response of test function.'
  ```

- **add_url_rule()** ：该方法直接会在路由表中注册映射关系。其实*route*装饰器内部也是通过调用*add_url_rule()*方法实现的路由注册。

  ```
  @app.route('/user', methods = ['POST', 'GET'])
  def get_users():
    if request.method == 'GET':
      return ... # 返回用户列表
    else:
      return ... # 创建新用户 
  ```

### 指定HTTP方法

Flask的路由支持HTTP的*GET*与*POST*请求，可以同时指定多种HTTP方法

```
@app.route('/user', methods = ['POST', 'GET'])
def get_users():
  if request.method == 'GET':
    return ... # 返回用户列表
  else:
    return ... # 创建新用户 
```

### URL构建方法

在一个实用的视图中需要指向其他视图的连接，为了防止路径出现问题，我们可以让Flask框架帮我们计算链接URL。简单地给url_for()函数传入一个访问点，它返回将是一个可靠的URL地址

```
@app.route('/')
def hello():
    return 'Hello world!'

@app.route('/user/<uname>')
def get_userInfo(uname=None):
    if uname: return '%s\'s Informations' % uname
    else: return 'this is all informations of users'
@app.route('/test')
def test_url_for():
    print(url_for('hello'))  # 输出：/
    
@app.route('/test')
def test_url_for():# 添加URL变量 
    print(url_for('get_userInfo', uname='zhangsan'))  # 输出：/user/zhangsan
    print(url_for('test_url_for', num=2))  # 输出：/test?num=2
```

## 请求，响应及会话

对于一个完整的HTTP请求，包括了来自客户端的请求对象(Request)，服务器端的响应对象(Respose)和会话对象(Session)等

### 请求对象 request

属性：**Form**，**args** ，**Cookies** ，**files**

- **Form** 是一个字典对象，包含表单当中所有参数及其值的键和值对
- **args** 是解析查询字符串的内容，它是问号之后的URL的一部分，当使用get请求时，通过URL传递参数时可以通过**args**属性获取
- **Cookies** 是用来保存Cookie名称和值的字典对象
- **files** 属性和上传文件有关的数据。



### 响应对象 response

如果视图函数想向前端返回数据，必须是`Response`的对象

**视图函数 return 多个值**

```
@app.route("/user_one")
def user_one():
    return "userInfo.html", "200 Ok", {"name": "zhangsan"; "age":"20"}
```



**使用Response创建**

```
from flask import Response

@app.route("/user_one")
def user_one():
    response = Response("user_one")
    response.status_code = 200
    response.status = "200 ok"
    response.data = {"name": "zhangsan"; "age":"20"}
    return response
```

**使用make_response函数**

```
@app.route("/user_one")
def user_one():
    response = make_response('user_one', 200, {"name": "zhangsan"; "age":"20"})
    return response
```





## 后端交互

- 用户注册请求：使用POST方式从前端接收数据，查询用户名是否存在以及年龄是否合法，否则返回错误
- 用户登录请求：查询数据库中的用户名或者密码是否存在以及密码是否正确，否则返回错误
- 推荐页请求：根据用户的id年龄性别,获得推荐的10条新闻
- 热门页请求：根据用户id,获得10条热门新闻
- 新闻详情页请求：根据用户的点击详情页行为，获得新闻的详细信息
- 用户行为请求：根据用户行为（是否点赞、收藏），对用户的行为数据进行保存和删除

