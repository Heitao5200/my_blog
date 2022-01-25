# 1. 单一参数空间

## 1.1 导入包


```python
import numpy as np 
import matplotlib.pyplot as plt
from hyperopt import fmin,tpe,hp,Trials,space_eval
import warnings
warnings.filterwarnings('ignore')
```

## 1.2 定义目标函数


```python
def loss(x):
    return (x-1)**2
```

## 1.3 定义超参数空间

* hp.chioce 离散值
* hp.uniform 均匀分布
* hp.normal 正态分布


```python
spaces= hp.uniform('x',-5.0,5.0)
```

## 1.4 执行搜索过程

* hyperopt 支持如下搜索算法
    * 随机搜索(hyperopt.rand.suggest)
    * 模拟退火(hyperopt.anneal.suggest)
    * TPE算法(hyperopt.tpe.suggest)贝叶斯优化算法


```python
trials = Trials()
best = fmin(fn = loss,
           space = spaces,
           algo = tpe.suggest,
           max_evals = 1000,
           trials = trials)
```

    100%|██████████| 1000/1000 [00:04<00:00, 204.24trial/s, best loss: 6.848909923212404e-07]


## 1.5 获取最优参数


```python
best_params = space_eval(spaces,best)
print(f'best_params:{best_params}')
```

    best_params:0.9991724185887049


## 1.6 绘制搜索过程


```python
import matplotlib as mpl

from matplotlib.font_manager import FontProperties
mpl.rcParams['font.sans-serif'] = ['SimSun']#显示中文
mpl.rcParams['font.serif'] = ['SimSun']
```


```python
losses = [x["result"]["loss"] for x in trials.trials]
minlosses = [np.min(losses[0:i+1]) for i in range(len(losses))] 
steps = range(len(losses))

fig,ax = plt.subplots(figsize=(6,3.7),dpi=144)
ax.scatter(x = steps, y = losses, alpha = 0.3)
ax.plot(steps,minlosses,color = "red",axes = ax)
plt.xlabel("step")
plt.ylabel("loss")
plt.yscale("log")
```


![png](./img/hyperopt超参数优化/output_15_0.png)
    


# 2. 网格参数空间

## 2.1 导入包


```python
import numpy as np
import matplotlib.pyplot as plt
from hyperopt import fmin,tpe,hp,anneal,Trials,space_eval
```

## 2.2 定义目标函数


```python
def loss(params):
    x,y = params['x'],params['y']
    return x**2 + y**2
```

## 2.3 定义超参数空间


```python
hspaces = {
    'x':hp.uniform('x',-1,1),
    'y':hp.uniform('7',-1,2)
}
```

## 2.4 执行搜索过程

* hyperopt 支持如下搜索算法
    * 随机搜索(hyperopt.rand.suggest)
    * 模拟退火(hyperopt.anneal.suggest)
    * TPE算法(hyperopt.tpe.suggest)贝叶斯优化算法


```python
trials = Trials()
best = fmin(
    fn = loss,
    space = hspaces,
    algo = anneal.suggest,
    max_evals = 1000,
    trials = trials
    
)
```

    100%|██████████| 1000/1000 [00:03<00:00, 291.45trial/s, best loss: 4.616182121455018e-07]


## 2.5 获取最优参数


```python
best_params = space_eval(hspaces,best)
print("best_params = ",best_params)
```

    best_params =  {'x': 0.0004362731465484687, 'y': 0.0005208492620194446}


## 2.6 绘制搜索过程


```python
losses = [x["result"]["loss"] for x in trials.trials]
minlosses = [np.min(losses[0:i+1]) for i in range(len(losses))] 
steps = range(len(losses))

fig,ax = plt.subplots(figsize=(6,3.7),dpi=144)
ax.scatter(x = steps, y = losses, alpha = 0.3)
ax.plot(steps,minlosses,color = "red",axes = ax)
plt.xlabel("step")
plt.ylabel("loss")
plt.yscale("log")
```


![png](img/hyperopt超参数优化/output_29_0-3016657.png)
    


# 3. 属性参数空间 

- 有时候，后面的参数依赖于之前一些参数的取值，可以用hyperopt.hp.choice表述成树形参数空间

## 3.1 导入包


```python
import math
from hyperopt import fmin,tpe,hp,Trials,space_eval
```

## 3.2 定义目标函数


```python
def loss(params):
    f = params[0]
    if f == 'sin':
        x = params[1]['x']
        return math.sin(x)**2
    elif f == 'cos':
        x = params[1]['x']
        y = params[1]['y']
        return math.cos(x)**2+y**2
    elif f =='sinh':
        x = params[1]['x']
        return math.sinh(x)**2
    else:
        assert f == 'cosh'
        x = params[1]['x']
        y = params[1]['y']
        return math.cosh(x)**2+y**2
```

## 3.3 定义超参数空间


```python
spaces = hp.choice('f',
                  [('sin',{"x":hp.uniform("x1",-math.pi/2,math.pi)}),
                   ("cos",{"x":hp.uniform("x2",-math.pi/2,math.pi),"y":hp.uniform("y2",-1,1)}),
                   ("sinh",{"x":hp.uniform("x3",-5,5)}),
                    ("cosh",{"x":hp.uniform("x4",-5,5),"y":hp.uniform("y4",-1,1)})
                  ])
```

## 3.4 执行搜索过程


* hyperopt支持如下搜索算法
    * 随机搜索(hyperopt.rand.suggest)
    * 模拟退火(hyperopt.anneal.suggest)
    * TPE算法（hyperopt.tpe.suggest，贝叶斯优化

```python
trials = Trials()
best = fmin(fn=loss, space=spaces, algo=tpe.suggest, max_evals=1000,trials=trials)
```



## 3.5 获取最优参数


```python
best_params = space_eval(spaces,best)
print("best_params = ",best_params)
```

    best_params =  ('sin', {'x': 3.141561172069962})


## 3.6 绘制搜索过程


```python
losses = [x["result"]["loss"] for x in trials.trials]
minlosses = [np.min(losses[0:i+1]) for i in range(len(losses))] 
steps = range(len(losses))

fig,ax = plt.subplots(figsize=(6,3.7),dpi=144)
ax.scatter(x = steps, y = losses, alpha = 0.3)
ax.plot(steps,minlosses,color = "red",axes = ax)
plt.xlabel("step")
plt.ylabel("loss")
plt.yscale("log")

```


![png](./img/hyperopt超参数优化/output_44_0.png)
    


# 4. LightGBM自动化调参

## 4.1 导入包


```python
import datetime
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score,f1_score
import matplotlib.pyplot as plt 
from hyperopt import fmin,hp,Trials,space_eval,rand,tpe,anneal
import warnings 
warnings.filterwarnings('ignore')
```


```python
def printlog(info):
    nowtime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print("\n"+"=========="*8 + "%s"%nowtime)
    print(info+'...\n\n')

```

## 4.2 读取数据 


```python
printlog("step1: reading data...")

# 读取dftrain,dftest
breast = datasets.load_breast_cancer()
df = pd.DataFrame(breast.data,columns = [x.replace(' ','_') for x in breast.feature_names])
df['label'] = breast.target
df['mean_radius'] = df['mean_radius'].apply(lambda x:int(x))
df['mean_texture'] = df['mean_texture'].apply(lambda x:int(x))
dftrain,dftest = train_test_split(df)

categorical_features = ['mean_radius','mean_texture']
lgb_train = lgb.Dataset(dftrain.drop(['label'],axis = 1),label=dftrain['label'],
                        categorical_feature = categorical_features,free_raw_data=False)

lgb_valid = lgb.Dataset(dftest.drop(['label'],axis = 1),label=dftest['label'],
                        categorical_feature = categorical_features,
                        reference=lgb_train,free_raw_data=False)
```


    ================================================================================2022-01-24 16:55:52
    step1: reading data......


​    


## 4.3 搜索超参数


```python
printlog("step2: searching parameters...")

boost_round = 1000                   
early_stop_rounds = 50

params = {
    'learning_rate': 0.1,
    'boosting_type': 'gbdt',#'dart','rf'  
    'objective':'binary',
    'metric': ['auc'],
    'num_leaves': 31,
    'max_depth':  6,
    'min_data_in_leaf': 5,  
    'min_gain_to_split': 0,
    'reg_alpha':0,
    'reg_lambda':0,
    'feature_fraction': 0.9,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'feature_pre_filter':False,
    'verbose': -1
}

```


    ================================================================================2022-01-24 16:57:08
    step2: searching parameters......


​    


## 4.4 定义目标函数


```python
def loss(config):
    params.update(config)
    gbm = lgb.train(params,
                    lgb_train,
                    num_boost_round= boost_round,
                    valid_sets=(lgb_valid, lgb_train),
                    valid_names=('validate','train'),
                    early_stopping_rounds = early_stop_rounds,
                    verbose_eval = False)
    y_pred_test = gbm.predict(dftest.drop('label',axis = 1), num_iteration=gbm.best_iteration)
    val_score = f1_score(dftest['label'],y_pred_test>0.5)

    return -val_score
```

## 4.5 定义超参空间



```python
#可以根据需要，注释掉偏后的一些不太重要的超参
spaces = {"learning_rate":hp.loguniform("learning_rate",np.log(0.001),np.log(0.5)),
          "boosting_type":hp.choice("boosting_type",['gbdt','dart','rf']),
          "num_leaves":hp.choice("num_leaves",range(15,128)),
          #"max_depth":hp.choice("max_depth",range(3,11)),
          #"min_data_in_leaf":hp.choice("min_data_in_leaf",range(1,50)),
          #"min_gain_to_split":hp.uniform("min_gain_to_split",0.0,1.0),
          #"reg_alpha": hp.uniform("reg_alpha", 0, 2),
          #"reg_lambda": hp.uniform("reg_lambda", 0, 2),
          #"feature_fraction":hp.uniform("feature_fraction",0.5,1.0),
          #"bagging_fraction":hp.uniform("bagging_fraction",0.5,1.0),
          #"bagging_freq":hp.choice("bagging_freq",range(1,20))
          }
```

## 4.6 执行超参搜索


* hyperopt支持如下搜索算法
    * 随机搜索(hyperopt.rand.suggest)
    * 模拟退火(hyperopt.anneal.suggest)
    * TPE算法（hyperopt.tpe.suggest，贝叶斯优化


```python
trials = Trials()
best = fmin(fn=loss, space=spaces, algo= tpe.suggest, max_evals=100, trials=trials)
   
```

    100%|██████████| 100/100 [01:21<00:00,  1.23trial/s, best loss: -1.0]              


## 4.7 获取最优参数


```python
best_params = space_eval(spaces,best)
print("best_params = ",best_params)
```

    best_params =  {'boosting_type': 'dart', 'learning_rate': 0.49200214060610525, 'num_leaves': 27}


## 4.8 绘制搜索过程


```python
losses = [x["result"]["loss"] for x in trials.trials]
minlosses = [np.min(losses[0:i+1]) for i in range(len(losses))] 
steps = range(len(losses))

fig,ax = plt.subplots(figsize=(6,3.7),dpi=144)
ax.scatter(x = steps, y = losses, alpha = 0.3)
ax.plot(steps,minlosses,color = "red",axes = ax)
plt.xlabel("step")
plt.ylabel("loss")
# plt.yscale("log")
```




    Text(0, 0.5, 'loss')




![png](./img/hyperopt超参数优化/output_63_1.png)
​    


## 4.9 训练模型


```python
printlog("step3: training model...")

params.update(best_params)
results = {}
gbm = lgb.train(params,
                lgb_train,
                num_boost_round= boost_round,
                valid_sets=(lgb_valid, lgb_train),
                valid_names=('validate','train'),
                early_stopping_rounds = early_stop_rounds,
                evals_result= results,
                verbose_eval = True)
```


    ================================================================================2022-01-24 17:02:43
    step3: training model......


​    

## 4.10 评估模型


```python
printlog("step4: evaluating model ...")

y_pred_train = gbm.predict(dftrain.drop('label',axis = 1), num_iteration=gbm.best_iteration)
y_pred_test = gbm.predict(dftest.drop('label',axis = 1), num_iteration=gbm.best_iteration)

train_score = f1_score(dftrain['label'],y_pred_train>0.5)
val_score = f1_score(dftest['label'],y_pred_test>0.5)

print('train f1_score: {:.5} '.format(train_score))
print('valid f1_score: {:.5} \n'.format(val_score))

fig2,ax2 = plt.subplots(figsize=(6,3.7),dpi=144)
fig3,ax3 = plt.subplots(figsize=(6,3.7),dpi=144)
lgb.plot_metric(results,ax = ax2)
lgb.plot_importance(gbm,importance_type = "gain",ax=ax3)

```


    ================================================================================2022-01-24 17:03:04
    step4: evaluating model ......
        train f1_score: 1.0 
        valid f1_score: 1.0 


 ![png](./img/hyperopt超参数优化/output_67_3.png)
    




![png](./img/hyperopt超参数优化/output_67_4.png)
    


## 4.11 保存模型



```python
printlog("step5: saving model ...")


model_dir = "gbm.model"
print("model_dir: %s"%model_dir)
gbm.save_model("gbm.model",num_iteration=gbm.best_iteration)
printlog("task end...")
```


    ================================================================================2022-01-24 17:03:29
    step5: saving model ......
    model_dir: gbm.model
    ================================================================================2022-01-24 17:03:29
    task end......


​    


