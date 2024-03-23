from fastapi import FastAPI
from pydantic import BaseModel

class Name(BaseModel):
    firstName: str = "Jas"
    lastName: str = "Wu"

app = FastAPI(
    
)

@app.get("/helloworld")
# function handles requests that go to path "/" with the "get" operation
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}

@app.post("/name")
async def create_name(name:Name):
    # f embeds code into a string
    return {f"Hello, {name.firstName} {name.lastName}"}

# chatgpt 
@app.get("/lyricstemplate")
async def get_lyrics()
