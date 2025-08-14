from pydantic import BaseModel

class GenreOut(BaseModel):
    genre_id: int
    label: str
    class Config:
        from_attributes = True