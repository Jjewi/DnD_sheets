XP_THRESHOLDS = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]
PROFICIENCY_BY_LEVEL = {1:2,2:2,3:2,4:2,5:3,6:3,7:3,8:3,9:4,10:4,11:4,12:4,13:5,14:5,15:5,16:5,17:6,18:6,19:6,20:6}

def calculate_level(xp: int) -> int:
    for level, threshold in enumerate(XP_THRESHOLDS, start=1):
        if xp < threshold:
            return level - 1
    return len(XP_THRESHOLDS)

def calculate_proficiency_bonus(level: int) -> int:
    return PROFICIENCY_BY_LEVEL.get(level, 2)