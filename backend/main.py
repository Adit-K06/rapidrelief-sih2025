from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Set
import random, string
import json

from database import engine, SessionLocal, Base
from models import Room
from schemas import RoomResponse

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

connections: Dict[str, Set[WebSocket]] = {}

@app.post("/create_room", response_model=RoomResponse)
def create_room(db: Session = Depends(get_db)):
    code = ''.join(random.choices(string.digits, k=5))
    new_room = Room(code=code)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return {"code": new_room.code}

@app.get("/check_room/{code}", response_model=RoomResponse)
def check_room(code: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="NO ROOM EXISTS")
    return {"code": room.code}

@app.websocket("/ws/{room_code}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, username: str, db: Session = Depends(get_db)):
    await websocket.accept()

    # Verify room
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        await websocket.send_text("NO ROOM EXISTS")
        await websocket.close()
        return

    # Initialize room if it doesn't exist
    if room_code not in connections:
        connections[room_code] = set()
    
    # Add client to room
    connections[room_code].add(websocket)
    
    # Broadcast member count to all clients in the room
    member_count = len(connections[room_code])
    await broadcast_member_count(room_code)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the message to all clients in the room
            for client in connections[room_code]:
                await client.send_text(f"{username}: {data}")
    except WebSocketDisconnect:
        # Remove client from room
        connections[room_code].remove(websocket)
        if not connections[room_code]:
            del connections[room_code]
        else:
            # Broadcast updated member count
            await broadcast_member_count(room_code)

async def broadcast_member_count(room_code: str):
    if room_code in connections:
        count = len(connections[room_code])
        message = json.dumps({
            "type": "members_update",
            "count": count
        })
        for client in connections[room_code]:
            await client.send_text(message)
