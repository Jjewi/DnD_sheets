from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    characters = relationship("Character", back_populates="owner", cascade="all, delete-orphan")

class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    race = Column(String)
    class_name = Column(String)
    experience = Column(Integer, default=0)
    hp = Column(Integer, default=0)

    # Характеристики
    strength_score = Column(Integer, default=10)
    dexterity_score = Column(Integer, default=10)
    constitution_score = Column(Integer, default=10)
    intelligence_score = Column(Integer, default=10)
    wisdom_score = Column(Integer, default=10)
    charisma_score = Column(Integer, default=10)

    # Боевые параметры
    armour_class = Column(Integer, default=10)
    speed = Column(Integer, default=30)
    initiative = Column(Integer, default=0)
    inspiration = Column(Boolean, default=False)

    # всё остальное(слабости привязанности сильные слабые стороны мировоззрение языки инвентарь особоые умения
    details = Column(JSON, default={})

    # Связь
    owner = relationship("User", back_populates="characters")