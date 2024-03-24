from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import openai
import base64

from suno import SongsGen
from dotenv import load_dotenv
import os

from starlette.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3000/*",
    # "http://localhost",
    # "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
You will generate a mad-libs puzzle and output the mad-libs in a JSON schema. Here is an example of the JSON schema I want:
[
  {
    "part": "Verse",
    "lyrics": string[]
  },
]
Create lyrics following the same JSON schema. The lyrics themselves should be quite different from what I put, as well as the mad libs. My example only applies to the JSON format. The mad libs should be annotated by the proper type of speech ie. {noun}. The valid parts of speech are: noun, adjective, verb, and adverb. 

Make four verses: Verse, Chorus, Bridge,  and Outro. Each verses will have 4 lines.
Never have two mad-libs next to each other in the same line. For example, {adjective} {noun} is invalid.

Have only 1 mad lib per line. There must be 1 mad-lib per line.
"""}
    ]
    chat = openai.chat.completions.create( 
            model="gpt-4-turbo-preview", messages=prompt 
        )
    
    reply = chat.choices[0].message.content 
#     reply = """
# [
#   {
#     "part": "Verse",
#     "lyrics": [
#       "The wind in the night, it whispers so {adjective},",
#       "Carrying tales from the {noun} so {adjective}.",
#       "My {noun} in my hand, ancient and {adjective},",
#       "Across the endless fields, our shadows {verb}."
#     ]
#   },
#   {
#     "part": "Chorus",
#     "lyrics": [
#       "With every step, I grow {adjective},",
#       "In a realm where {noun} softly {verb}.",
#       "But by your {noun}, I sail my {noun},",
#       "And in your voice, the {noun} I've long {verb}."
#     ]
#   },
#   {
#     "part": "Bridge",
#     "lyrics": [
#       "Under the gaze of the {noun}, we {verb},",
#       "To the rhythm that makes our hearts {verb},",
#       "Side by side, we {verb} and {verb},",
#       "In this {noun} dream, where hope brightly {verb}."
#     ]
#   },
#   {
#     "part": "Outro",
#     "lyrics": [
#       "Here's to the {noun}, the light, and the {noun},",
#       "On this path, we're forever {adjective}.",
#       "From dawn to dusk, under the sky's {noun},",
#       "Together, into the unknown we {verb}."
#     ]
#   }
# ]
# """
    reply = reply.replace("```json", "")
    reply = reply.replace("```", "")
    reply = reply.strip()
    print(f"ChatGPT: {reply}") 
    return {"lyrics": reply}

