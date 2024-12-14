# schemas.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    content: str
    book_id: str
    user_id: int
    created_at: datetime  # Змінюємо на datetime.datetime

class Comment(CommentBase):
    id: int
    book_id: str
    user_id: int
    created_at: Optional[datetime] = None  # Додаємо поле created_at для відповідності даним із бази

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True  # Дозволяємо довільні типи

