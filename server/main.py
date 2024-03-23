from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

OpenAI.my_api_key = os.getenv("OPEN_AI_API_KEY")

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
async def get_lyrics():
    # call chatgpt
    prompt = [
        {"role": "system", "content": "You are a intelligent assistant."},

        {"role": "user", "content": """
[
  {
    "part": "Verse",
    "lyrics": [
      "The stars at night, they shine so {adjective},",
      "Guiding me through the {noun} so {adjective}.",
      "My {noun} by my side, steady and {adjective},",
      "Through the silent streets, our spirits {verb}."
    ]
  },
  {
    "part": "Chorus",
    "lyrics": [
      "With every heartbeat, I feel {adjective},",
      "In a world where {noun} often {verb}.",
      "But in your {noun}, I find my {noun},",
      "And in your eyes, the {noun} I've always {verb}."
    ]
  },
  {
    "part": "Bridge",
    "lyrics": [
      "In the quiet of the {noun}, we {verb},",
      "To the music that makes our souls {verb},",
      "Hand in hand, we {verb} and {verb},",
      "In our {noun} world, where love never {verb}."
    ]
  },
  {
    "part": "Outro",
    "lyrics": [
      "So here's to our {noun}, our bond, and our {noun},",
      "In this journey, we're never {adjective}.",
      "From {noun} to {noun}, under the {noun}'s glow,",
      "Together, into the future we {verb}."
    ]
  }
]
Generate new JSON lyrics following the same schema. Continue to replace words/phrases in each line with mad-libs, annotated by the proper type of speech ie. {noun}. Make four verses.
"""}
    ]

    chat = OpenAI.ChatCompletion.create( 
            model="gpt-4-turbo-preview", messages=prompt 
        )
    
    reply = chat.choices[0].message.content 
    print(f"ChatGPT: {reply}") 
    return {"lyrics": reply}

