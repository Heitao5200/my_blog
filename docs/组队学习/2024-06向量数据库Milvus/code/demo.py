import random
import numpy as np
import pymilvus
from pymilvus_orm import Collection
# from pymilvus_orm import DataType,utility
from pymilvus_orm.schema import FieldSchema, CollectionSchema
from pymilvus_orm.types import DataType



def create_collection(field_name, collection_name):
    # 主键
    field_id = FieldSchema(name="field_id", dtype=DataType.INT64, is_primary=True, auto_id=True)
    # 向量检索的field
    field = FieldSchema(name=field_name, dtype=DataType.FLOAT_VECTOR, dim=8)
    cat_id = FieldSchema(name="cat_id", dtype=DataType.INT64)
    schema = CollectionSchema(fields=[field_id, field, cat_id], description="example collection")

    collection = Collection(name=collection_name, schema=schema)
    # print(pymilvus_orm.utility.get_connection().has_collection(collection_name))
    # print(pymilvus_orm.utility.get_connection().list_collections())

    return collection


def create_partition(collection):
    """
    为collection创建分区
    :param collection:
    :return:
    """
    partition_name = "example_partition"
    partition = collection.create_partition(partition_name)

    print(collection.partitions)

    print(collection.has_partition(partition_name))


def insert(collection: Collection, partition_name=None):
    """
    插入数据
    :param partition_name: 指定插入的分区
    :param collection:
    :return:
    """
    # 由于主键field_id设置自增，所以无需插入
    mr = collection.insert([
        # 只能是list
        np.random.random([10000, 8]).tolist(),  # 向量
        np.random.randint(0, 10, [10000]).tolist()  # cat_id
    ], partition_name=partition_name)
    print(mr.primary_keys)

    # 插入的数据存储在内存，需要传输到磁盘
    # utility.get_connection().flush([collection.name])


def create_index(collection: Collection):
    """
    为向量检索的field 创建索引
    :param collection:
    :return:
    """
    index_param = {
        "metric_type": "L2",
        "index_type": "IVF_FLAT",
        "params": {"nlist": 1024}
    }
    collection.create_index(field_name=field_name, index_params=index_param)
    print(collection.index().params)


def search(collection: Collection, partition_name=None):
    """
    向量检索
    :param collection:
    :param partition_name: 检索指定分区的向量
    :return:
    """
    # 将collection加载到内存
    collection.load()
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    # 向量搜索
    result = collection.search(data=np.random.random([5, 8]).tolist(),
                               anns_field=field_name, param=search_params, limit=10,
                               partition_names=[partition_name] if partition_name else None)
    print(result[0].ids)
    print(result[0].distances)

    # 表达式：只检索cat_id为2的向量
    result = collection.search(data=np.random.random([5, 8]).tolist(),
                               anns_field=field_name, param=search_params, limit=10,
                               expr="cat_id==2")
    print(result[0].ids)
    print(result[0].distances)


def drop(collection: Collection):
    # 删除collection
    collection.drop()
    # 删除索引
    collection.drop_index()
    # 删除分区
    collection.drop_partition("partition_name")


def release(collection: Collection = None):
    # 从内存中释放collection
    if collection:
        collection.release()

    # # 断开与服务器的连接，释放资源
    # connections.disconnect("default")

if __name__ == '__main__':

    myclient = pymilvus.MilvusClient(
        uri="http://localhost:19530",
        host="127.0.0.1",
        user='root',
        db_name= '',
        token = '',
        password='89io*(IO'
    )

    field_name = "example_field"
    collection_name = "example_collection"

    collection = create_collection(field_name, collection_name)

    create_partition(collection)