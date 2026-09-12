import os
import uvicorn

print("NEXUS START: importing application...", flush=True)

from app.main import app

print("NEXUS START: application imported successfully", flush=True)

port = int(os.environ.get("PORT", 10000))

print(f"NEXUS START: starting server on 0.0.0.0:{port}", flush=True)

uvicorn.run(
    app,
    host="0.0.0.0",
    port=port,
    log_level="debug"
)
