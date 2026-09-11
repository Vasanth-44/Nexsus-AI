from pathlib import Path


UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    exist_ok=True
)


def save_document(
    filename: str,
    content: bytes
):

    file_path = UPLOAD_DIR / filename

    file_path.write_bytes(
        content
    )

    return str(file_path)