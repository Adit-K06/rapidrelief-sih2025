from pydantic import BaseModel

class RoomResponse(BaseModel):
    code: str

    class Config:
        orm_mode = True
