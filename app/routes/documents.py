from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from app.services.document_store import (
    save_document
)

from app.services.rag_service import (
    process_document
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
async def upload_document(
    user_id: str,
    file: UploadFile = File(...)
):

    allowed_extensions = {
        ".pdf",
        ".txt"
    }

    filename = file.filename or ""

    extension = ""

    if "." in filename:
        extension = "." + filename.rsplit(
            ".",
            1
        )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported."
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:

        file_path = save_document(
            filename,
            content
        )

        result = process_document(
    file_path,
    filename,
    user_id
)

        return {
            "message": "Document processed successfully.",
            **result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )