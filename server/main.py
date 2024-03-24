from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import openai
import base64

from suno import SongsGen
from dotenv import load_dotenv
import os
load_dotenv()

SUNO_COOKIE = os.getenv("SUNO_COOKIE")
GenerateSong = SongsGen(SUNO_COOKIE)

openai.api_key = os.getenv("OPEN_AI_API_KEY")

class Name(BaseModel):
    firstName: str = "Jas"
    lastName: str = "Wu"
# manages the connection across mukt clients and sate of ws
class ConnectionManager:
    # initializes ws and adds to active connections inside of a dictionary
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    # establish connection btwn a client and ws. waits for ws to start and adds accepted client to active connections
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    # disconnects client from ws
    def disconnect(self, client_id: str):
        del self.active_connections[client_id]
    #  converts music into binary which it then sends as bytes
    async def send_personal_message(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)
    # shows music to all clients with active connections to the ws
    async def broadcast(self, data: dict):
        for connection in self.active_connections.values():
            await connection.send_json(data)


manager = ConnectionManager()

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

# websocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, client_id: str | None = None):
    if client_id is None:
        client_id = websocket.query_params.get("client_id")

    if client_id is None:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, client_id)

        
    try:
        while True:
            data = await websocket.receive_json()
            event = data["event"]
            if event == "generate":
                print("generate event")
                lyrics = data["lyrics"]
                genre = data["genre"]
                output = GenerateSong.get_songs_custom(lyrics, genre)
                link = output['song_urls'][0]
                audio = GenerateSong.get_mp3(link, stream=True)
                for chunk in audio:
                    if chunk:
                        # translates binary to base64 string
                        b64 = base64.b64encode(chunk)
                        # translates into string
                        utf = b64.decode('utf-8')
                        obj = {
                            "event": "audio",
                            "audio_data": utf
                        }
                        await manager.broadcast(obj)

            elif event == "lyrics":
                print("lyrics")
                # lyrics = lyrics_data["lyrics"][0]
                # await websocket.send_json({
                #     "event": "lyrics",
                #     "data": lyrics
                # })
            
    except WebSocketDisconnect:
        print("Disconnecting...")
        manager.disconnect(client_id)

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

    chat = openai.chat.completions.create( 
            model="gpt-4-turbo-preview", messages=prompt 
        )
    
    reply = chat.choices[0].message.content 
    print(f"ChatGPT: {reply}") 
    return {"lyrics": reply}

