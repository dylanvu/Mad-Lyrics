from fastapi import FastAPI, WebSocket
from pydantic import BaseModel

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
    async def send_binary_music(self, music_data: bytes, websocket: WebSocket):
        await websocket.send_bytes(music_data)
    # shows music to all clients with active connections to the ws
    async def broadcast(self, music_data: bytes):
        for connection in self.active_connections.values():
            await connection.send_bytes(music_data)


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
async def websocket_endpoint(websocket: WebSocket, client_id: Union[str, None] = None):
    if client_id is None:
        client_id = websocket.query_params.get("client_id")

    if client_id is None:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, client_id)

        
    try:
        while True:
            binary_data = await websocket.receive_bytes()
             await manager.broadcast(binary_data) 

    except WebSocketDisconnect:
        print("Disconnecting...")
        manager.disconnect(client_id)

