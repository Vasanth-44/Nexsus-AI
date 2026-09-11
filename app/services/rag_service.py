from app.services.document_processor import (
    extract_text,
    split_text
)

from app.services.vector_store import (
    add_documents,
    search_documents
)


def process_document(
    file_path: str,
    filename: str,
    user_id: str
):

    text = extract_text(
        file_path
    )

    if not text.strip():
        raise ValueError(
            "No readable text found in document."
        )

    documents = split_text(
        text,
        filename
    )

    add_documents(
        documents,
        user_id
    )

    return {
        "filename": filename,
        "chunks": len(documents)
    }


def retrieve_context(
    query: str,
    user_id: str
):

    documents = search_documents(
        query,
        user_id
    )

    return "\n\n".join(
        document.page_content
        for document in documents
    )