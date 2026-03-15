# app/schemas.py
from pydantic import BaseModel, computed_field, field_validator
from typing import Optional, Dict, Any, List
from .utils.level_table import calculate_level, calculate_proficiency_bonus

# юзер
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# персонаж основа
class CharacterBase(BaseModel):
    name: str
    race: Optional[str] = None
    class_name: Optional[str] = None
    experience: int = 0
    hp: int = 0
    strength_score: int = 10
    dexterity_score: int = 10
    constitution_score: int = 10
    intelligence_score: int = 10
    wisdom_score: int = 10
    charisma_score: int = 10
    armour_class: int = 10
    speed: int = 30
    initiative: int = 0
    inspiration: bool = False
    details: Dict[str, Any] = {}

class CharacterCreate(CharacterBase):
    pass

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    race: Optional[str] = None
    class_name: Optional[str] = None
    experience: Optional[int] = None
    hp: Optional[int] = None
    strength_score: Optional[int] = None
    dexterity_score: Optional[int] = None
    constitution_score: Optional[int] = None
    intelligence_score: Optional[int] = None
    wisdom_score: Optional[int] = None
    charisma_score: Optional[int] = None
    armour_class: Optional[int] = None
    speed: Optional[int] = None
    initiative: Optional[int] = None
    inspiration: Optional[bool] = None
    details: Optional[Dict[str, Any]] = None

class Character(CharacterBase):
    id: int
    owner_id: int

    # Вычисляемые поля основные
    @computed_field
    @property
    def level(self) -> int:
        return calculate_level(self.experience)

    @computed_field
    @property
    def proficiency_bonus(self) -> int:
        return calculate_proficiency_bonus(self.level)

    # Модификаторы характеристик вычисляемые поля
    @computed_field
    @property
    def strength_modifier(self) -> int:
        return (self.strength_score - 10) // 2

    @computed_field
    @property
    def dexterity_modifier(self) -> int:
        return (self.dexterity_score - 10) // 2

    @computed_field
    @property
    def constitution_modifier(self) -> int:
        return (self.constitution_score - 10) // 2

    @computed_field
    @property
    def intelligence_modifier(self) -> int:
        return (self.intelligence_score - 10) // 2

    @computed_field
    @property
    def wisdom_modifier(self) -> int:
        return (self.wisdom_score - 10) // 2

    @computed_field
    @property
    def charisma_modifier(self) -> int:
        return (self.charisma_score - 10) // 2

    @computed_field
    @property
    def ability_modifiers(self) -> Dict[str, int]:
        return {
            "strength": self.strength_modifier,
            "dexterity": self.dexterity_modifier,
            "constitution": self.constitution_modifier,
            "intelligence": self.intelligence_modifier,
            "wisdom": self.wisdom_modifier,
            "charisma": self.charisma_modifier,
        }

    @computed_field
    @property
    def passive_wisdom(self) -> int:
        #пассивная мдр вычисление
        wisdom_mod = self.wisdom_modifier
        proficient = self.details.get("skills", {}).get("mindfulness", {}).get("proficient", False)
        prof_bonus = self.proficiency_bonus if proficient else 0
        return 10 + wisdom_mod + prof_bonus

    @computed_field
    @property
    def skill_bonuses(self) -> Dict[str, int]:
        skill_to_ability = {
            "acrobatics": "dexterity",
            "animal_care": "wisdom",
            "analysis": "intelligence",
            "athletics": "strength",
            "bullying": "charisma",
            "deception": "charisma",
            "discernment": "wisdom",
            "history": "intelligence",
            "magic": "intelligence",
            "medicine": "wisdom",
            "mindfulness": "wisdom",
            "nature": "intelligence",
            "performance": "charisma",
            "persuasion": "charisma",
            "religion": "intelligence",
            "reticence": "dexterity",
            "sleight_of_hand": "dexterity",
            "survival": "wisdom"
        }
        skills = self.details.get("skills", {})
        result = {}
        for skill, ability in skill_to_ability.items():
            proficient = skills.get(skill, {}).get("proficient", False)
            extra_bonus = skills.get(skill, {}).get("bonus", 0)
            modifier = getattr(self, f"{ability}_modifier")
            bonus = modifier + (self.proficiency_bonus if proficient else 0) + extra_bonus
            result[skill] = bonus
        return result



class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

    class Config:
        from_attributes = True