from llama_index.legacy import (
    Document,
    StorageContext,
    VectorStoreIndex,
    SimpleDirectoryReader,
    ServiceContext,
    load_index_from_storage,
)
from llama_index.legacy.retrievers import RecursiveRetriever
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core.embeddings import OpenAIEmbedding
from llama_index.core.schema import IndexNode
from llama_index.llms import OpenAI

# for loading environment variables
from decouple import config

import os

# set env variables
os.environ["OPENAI_API_KEY"] = config("OPENAI_API_KEY")

# create LLM and Embedding Model
embed_model = OpenAIEmbedding()
llm = OpenAI(model="gpt-3.5-turbo")
service_context = ServiceContext.from_defaults(
    embed_model=embed_model, llm=llm)

# load data
documents = SimpleDirectoryReader(
    input_dir="../dataFiles").load_data(show_progress=True)

doc_text = "\n\n".join([d.get_content() for d in documents])
docs = [Document(text=doc_text)]

# create nodes parser
node_parser = SimpleNodeParser.from_defaults(chunk_size=1024)

# split into nodes
base_nodes = node_parser.get_nodes_from_documents(documents=docs)

# set document IDs
for idx, node in enumerate(base_nodes):
    node.id_ = f"node-{idx}"

# create parent child documents
sub_chunk_sizes = [128, 256, 512]
sub_node_parsers = [
    SimpleNodeParser.from_defaults(chunk_size=c, chunk_overlap=0) for c in sub_chunk_sizes
]

all_nodes = []
for base_node in base_nodes:
    for n in sub_node_parsers:
        sub_nodes = n.get_nodes_from_documents([base_node])
        sub_inodes = [
            IndexNode.from_text_node(sn, base_node.node_id) for sn in sub_nodes
        ]
        all_nodes.extend(sub_inodes)

    # also add original node to node
    original_node = IndexNode.from_text_node(base_node, base_node.node_id)
    all_nodes.append(original_node)

        
all_nodes_dict = {n.node_id: n for n in all_nodes}


print(all_nodes[0])
print(len(all_nodes_dict))

# creating index
index = VectorStoreIndex(nodes=all_nodes, service_context=service_context)