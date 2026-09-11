from pathlib import Path

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def extract_text(file_path: str) -> str:

    path = Path(file_path)

    if path.suffix.lower() == ".pdf":

        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    if path.suffix.lower() == ".txt":

        return path.read_text(
            encoding="utf-8"
        )

    raise ValueError(
        "Only PDF and TXT files are supported."
    )


def split_text(
    text: str,
    filename: str
):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_text(text)

    return [
        Document(
            page_content=chunk,
            metadata={
                "source": filename
            }
        )
        for chunk in chunks
    ]