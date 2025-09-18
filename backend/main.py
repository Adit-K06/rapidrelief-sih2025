from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
import random, string

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

connections = {}

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

    if room_code not in connections:
        connections[room_code] = []
    connections[room_code].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast to all in room
            for conn in connections[room_code]:
                await conn.send_text(f"{username}: {data}")
    except WebSocketDisconnect:
        connections[room_code].remove(websocket)
