from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from .. import schemas, crud, auth
from ..database import get_db

router = APIRouter(prefix="/characters", tags=["characters"])

@router.get("/", response_model=List[schemas.Character])
async def read_characters(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    characters = await crud.get_characters_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    return characters

@router.post("/", response_model=schemas.Character, status_code=status.HTTP_201_CREATED)
async def create_character(
    character: schemas.CharacterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    return await crud.create_character(db=db, character=character, user_id=current_user.id)

@router.get("/{character_id}", response_model=schemas.Character)
async def read_character(
    character_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    character = await crud.get_character(db, character_id)
    if character is None or character.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

@router.put("/{character_id}", response_model=schemas.Character)
async def update_character(
    character_id: int,
    character_update: schemas.CharacterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    character = await crud.get_character(db, character_id)
    if character is None or character.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Character not found")
    updated = await crud.update_character(db, character_id, character_update)
    return updated

@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    character = await crud.get_character(db, character_id)
    if character is None or character.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Character not found")
    await crud.delete_character(db, character_id)
    return None