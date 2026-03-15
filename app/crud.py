from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models, schemas
from .auth import get_password_hash


async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalar_one_or_none()

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(models.User).where(models.User.username == username))
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_character(db: AsyncSession, character_id: int):
    result = await db.execute(select(models.Character).where(models.Character.id == character_id))
    return result.scalar_one_or_none()

async def get_characters_by_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(models.Character)
        .where(models.Character.owner_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_character(db: AsyncSession, character: schemas.CharacterCreate, user_id: int):
    db_character = models.Character(**character.dict(), owner_id=user_id)
    db.add(db_character)
    await db.commit()
    await db.refresh(db_character)
    return db_character

async def update_character(db: AsyncSession, character_id: int, character_update: schemas.CharacterUpdate):
    result = await db.execute(select(models.Character).where(models.Character.id == character_id))
    db_character = result.scalar_one_or_none()
    if db_character:
        for key, value in character_update.dict(exclude_unset=True).items():
            setattr(db_character, key, value)
        await db.commit()
        await db.refresh(db_character)
    return db_character

async def delete_character(db: AsyncSession, character_id: int):
    result = await db.execute(select(models.Character).where(models.Character.id == character_id))
    db_character = result.scalar_one_or_none()
    if db_character:
        await db.delete(db_character)
        await db.commit()
    return db_character