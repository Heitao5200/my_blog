## 参考资料

[Mac 超详细Docker Desktop安装Elasticsearch（包括分词器插件）、Elasticsearch-head、Kibana](https://blog.csdn.net/qq_43875948/article/details/133357984)




启动Elasticsearch：
```
docker run  --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms512m -Xmx512m" -v /Users/heitao/es/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml -d elasticsearch:8.6.2

```


https://www.cnblogs.com/benjieqiang/p/17501293.html


mkdir /Users/heitao/es/config
mkdir /Users/heitao/es/data
mkdir /Users/heitao/es/plugins

echo "http.host: 0.0.0.0" >> /Users/heitao/es/elasticsearch.yml


docker run --name elasticsearch -p 9200:9200 -p 9300:9300 \
-e "discovery.type=single-node" \
-e ES_JAVA_OPTS="-Xms64m -Xmx512m" \
-v /Users/heitao/es/config:/usr/share/elasticsearch/config \
-v /Users/heitao/es/data:/usr/share/elasticsearch/data \
-v /Users/heitao/es/plugins:/usr/share/elasticsearch/plugins \
-d elasticsearch:7.16.2


chmod -R 777 software/elasticsearch/
