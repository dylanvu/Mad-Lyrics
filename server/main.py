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
try:
    GenerateSong = SongsGen(SUNO_COOKIE)
except Exception as e:
    print(e)


openai.api_key = os.getenv("OPEN_AI_API_KEY")

class Name(BaseModel):
    firstName: str = "Jas"
    lastName: str = "Wu"
# manages the connection across mukt clients and sate of ws
class ConnectionManager:
    # initializes ws and adds to active connections inside of a dictionary
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.ready_players: Dict[str, bool] = {}
        self.player_inputs: Dict[str, List[List[str]]] = {}

    # establish connection btwn a client and ws. waits for ws to start and adds accepted client to active connections
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.ready_players[client_id] = False
        self.player_inputs[client_id] = []
        print(self.active_connections)
    # disconnects client from ws
    def disconnect(self, client_id: str):
        del self.active_connections[client_id]
        del self.ready_players[client_id]
        del self.player_inputs[client_id]
        print(self.active_connections)
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
# default state of client is none
async def websocket_endpoint(websocket: WebSocket, client_id: str | None = None):
    if client_id is None:
        client_id = websocket.query_params.get("client_id")

    if client_id is None:
        await websocket.close(code=4001)
        return
    # save this client into server memory
    await manager.connect(websocket, client_id)      
    try:
        while True:
            data = await websocket.receive_json()
            event = data["event"]
            if event == "generate":
                lyrics = data["lyrics"]
                genre = data["genre"]
                # create var that calls the function to generate a song using the Suno function "songGen" with the suno api key
                # get_songs_custom is a function under suno with the lyrics and genre passed through the combined user prompted genre and gpt generated lyrics
                output = GenerateSong.get_songs_custom(lyrics, genre)
                # returns a link from the "song url" element inside of the output item in dictionary, stored in link. The first element in the array
                link = output['song_urls'][0]
                # gets the mp3 associated with each link and sets streaming in websocket to true, meaning that data is sent in chunks
                # no streaming.
                audio = GenerateSong.get_mp3(link)
                b64 = base64.b64encode(audio)
                # decodes the b.64 binary obj into a string
                utf = b64.decode('utf-8')
                # creates a dict obj that stores the event as an audio chunk and sets the audio data to utf format
                obj = {
                    "event": "audio",
                    "audio_data": utf
                }
                # waits for broadcasting to run
                await manager.broadcast(obj)
                # move all players to the song page
                obj = {
                    "event": "phase_change",
                    "data": "song"
                }
                await manager.broadcast(obj)

                # audio = GenerateSong.get_mp3(link, stream=True)
                # for chunk in audio:
                #     if chunk:
                #         # translates binary to base64 string
                #         b64 = base64.b64encode(chunk)
                #         # decodes the b.64 binary obj into a string
                #         utf = b64.decode('utf-8')
                #         # creates a dict obj that stores the event as an audio chunk and sets the audio data to utf format
                #         obj = {
                #             "event": "audio",
                #             "audio_data": utf
                #         }
                #         # waits for broadcasting to run
                #         await manager.broadcast(obj)

            elif event == "lyrics":
                print("lyrics")
                # lyrics = lyrics_data["lyrics"][0]
                # await websocket.send_json({
                #     "event": "lyrics",
                #     "data": lyrics
                # })
            elif event == "sample_song":
                print("Getting sample song")
                path_to_song = './output/1 .mp3'
                with open(path_to_song, 'rb') as mp3_file:
                    # reading data in chunks of 4kb
                    chunk = mp3_file.read()
                    if not chunk:
                        break
                    b64 = base64.b64encode(chunk)
                    utf = b64.decode('utf-8')
                    obj = {
                        "event": "audio",
                        "audio_data": utf
                    }
                    await manager.broadcast(obj)
                    # move all players to the song page
                    obj = {
                        "event": "phase_change",
                        "data": "song"
                    }
                    await manager.broadcast(obj)
                    # while True:
                    #     # reading data in chunks of 4kb
                    #     chunk = mp3_file.read(4096)
                    #     if not chunk:
                    #         break
                    #     b64 = base64.b64encode(chunk)
                    #     utf = b64.decode('utf-8')
                    #     obj = {
                    #         "event": "audio",
                    #         "audio_data": utf
                    #     }
                    #     await manager.broadcast(obj)
            
            elif event == "start":
                # This should bring players from the lobby to the input screen
                obj = {
                    "event": "phase_change",
                    "data": "input"
                }
                await manager.broadcast(obj)
            elif event == "finished":
                # parse out the event data to get which player finished
                # expect: {"event": "finished", "id": string, "libs": string[][]}
                id = data["id"]
                libs = data["libs"]
                manager.ready_players[id] = True
                manager.player_inputs[id] = libs
                # if all players are ready, move them to the waiting screen
                all_ready = all(value for value in manager.ready_players.values())
                if all_ready:
                    # bring all players to the moving screen
                    print("READY TO GENERATE")
                    print(manager.player_inputs)
                    # TODO: need to randomly select from inputs
                    # obj = {
                    # "event": "phase_change",
                    # "data": "song"
                    # }
                    # await manager.broadcast(obj)

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

