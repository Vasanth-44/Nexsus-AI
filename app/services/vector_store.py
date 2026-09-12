from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

PERSIST_DIRECTORY = "chroma_db"

_embeddings = None
_vector_store = None


def get_embeddings():
    global _embeddings

    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    return _embeddings


def get_vector_store():
    global _vector_store

    if _vector_store is None:
        _vector_store = Chroma(
            collection_name="nexus_documents",
            embedding_function=get_embeddings(),
            persist_directory=PERSIST_DIRECTORY
        )

    return _vector_store


def add_documents(documents, user_id: str):
    for document in documents:
        document.metadata["user_id"] = user_id

    get_vector_store().add_documents(documents)


def search_documents(query: str, user_id: str, k: int = 4):
    return get_vector_store().similarity_search(
        query,
        k=k,
        filter={"user_id": user_id}
    )