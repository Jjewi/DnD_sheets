from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .routers import users, characters
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="D&D Character Sheet")
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(users.router)
app.include_router(characters.router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return FileResponse("static/index.html")