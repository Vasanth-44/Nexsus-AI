from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


PERSIST_DIRECTORY = "chroma_db"


embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


vector_store = Chroma(
    collection_name="nexus_documents",
    embedding_function=embeddings,
    persist_directory=PERSIST_DIRECTORY
)


def add_documents(
    documents,
    user_id: str
):

    for document in documents:
        document.metadata["user_id"] = user_id

    vector_store.add_documents(
        documents
    )


def search_documents(
    query: str,
    user_id: str,
    k: int = 4
):

    return vector_store.similarity_search(
        query,
        k=k,
        filter={
            "user_id": user_id
        }
    )