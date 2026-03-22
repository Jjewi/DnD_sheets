const API_BASE = '';
function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE + endpoint, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/static/index.html';
        throw new Error('Unauthorized');
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Ошибка запроса');
    }
    return response.json();
}

// Страница авторизации
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch('/users/login', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Ошибка входа');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = '/static/dashboard.html';
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const emailValue = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('register-error');

    // Простая валидация email
    const isValidEmail = (email) => /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email);
    if (!isValidEmail(emailValue)) {
        errorEl.textContent = 'Введите корректный email (например, name@domain.ru)';
        return;
    }

    try {
        await apiRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify({ username, email: emailValue, password }),
        });
        alert('Регистрация успешна! Теперь войдите.');
        document.getElementById('login-tab').click();
    } catch (err) {
        errorEl.textContent = err.message;
    }
});
}
// Страница дашборда
if (document.getElementById('characters-list')) {
    if (!localStorage.getItem('token')) {
        window.location.href = '/static/index.html';
    }

    async function loadCharacters() {
        try {
            const characters = await apiRequest('/characters/');
            const listEl = document.getElementById('characters-list');
            listEl.innerHTML = '';

            if (characters.length === 0) {
                listEl.innerHTML = '<p>У вас пока нет персонажей. Создайте первого!</p>';
                return;
            }

            characters.forEach(char => {
                const card = document.createElement('div');
                card.className = 'character-card';
                card.innerHTML = `
                    <h3>${char.name}</h3>
                    <p>Раса: ${char.race || '—'}</p>
                    <p>Класс: ${char.class_name || '—'}</p>
                    <p>Уровень: ${char.level || '1'}</p>
                `;
                card.addEventListener('click', () => {
                    window.location.href = `/static/sheet.html?id=${char.id}`;
                });
                listEl.appendChild(card);
            });
        } catch (err) {
            alert('Ошибка загрузки персонажей: ' + err.message);
        }
    }

    loadCharacters();
    document.getElementById('create-character').addEventListener('click', () => {
        window.location.href = '/static/sheet.html';
    });
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/static/index.html';
    });
}
// Страница листа персонажа
if (document.getElementById('sheet-image')) {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    const isNew = !characterId;

    // Элементы ввода
    const nameInput = document.getElementById('char-name');
    const classInput = document.getElementById('char-class');
    const expInput = document.getElementById('char-exp');
    const levelInput = document.getElementById('char-level');
    const strengthInput = document.getElementById('strength');
    const dexterityInput = document.getElementById('dexterity');
    const constitutionInput = document.getElementById('constitution');
    const intelligenceInput = document.getElementById('intelligence');
    const wisdomInput = document.getElementById('wisdom');
    const charismaInput = document.getElementById('charisma');
    const strengthMod = document.getElementById('strength-mod');
    const dexterityMod = document.getElementById('dexterity-mod');
    const constitutionMod = document.getElementById('constitution-mod');
    const intelligenceMod = document.getElementById('intelligence-mod');
    const wisdomMod = document.getElementById('wisdom-mod');
    const charismaMod = document.getElementById('charisma-mod');
    const passiveWisdomSpan = document.getElementById('passive-wisdom');

    const XP_THRESHOLDS = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
    function recalcAll() {
        const strength = parseInt(strengthInput.value) || 10;
        const dexterity = parseInt(dexterityInput.value) || 10;
        const constitution = parseInt(constitutionInput.value) || 10;
        const intelligence = parseInt(intelligenceInput.value) || 10;
        const wisdom = parseInt(wisdomInput.value) || 10;
        const charisma = parseInt(charismaInput.value) || 10;

        strengthMod.textContent = Math.floor((strength - 10) / 2);
        dexterityMod.textContent = Math.floor((dexterity - 10) / 2);
        constitutionMod.textContent = Math.floor((constitution - 10) / 2);
        intelligenceMod.textContent = Math.floor((intelligence - 10) / 2);
        wisdomMod.textContent = Math.floor((wisdom - 10) / 2);
        charismaMod.textContent = Math.floor((charisma - 10) / 2);
        const wisMod = parseInt(wisdomMod.textContent) || 0;
        passiveWisdomSpan.textContent = 10 + wisMod;

        const xp = parseInt(expInput.value) || 0;
        let level = 1;
        for (let i = 1; i < XP_THRESHOLDS.length; i++) {
            if (xp >= XP_THRESHOLDS[i]) level = i + 1;
        }
        levelInput.value = level;

        recalcSkills();
    }
    function recalcSkills() {
        const strMod = parseInt(strengthMod.textContent) || 0;
        const dexMod = parseInt(dexterityMod.textContent) || 0;
        const intMod = parseInt(intelligenceMod.textContent) || 0;
        const wisMod = parseInt(wisdomMod.textContent) || 0;
        const chaMod = parseInt(charismaMod.textContent) || 0;

        const skillsMap = {
            'skill-athletics-value': strMod,
            'skill-acrobatics-value': dexMod,
            'skill-sleight-of-hand-value': dexMod,
            'skill-stealth-value': dexMod,
            'skill-arcana-value': intMod,
            'skill-history-value': intMod,
            'skill-investigation-value': intMod,
            'skill-nature-value': intMod,
            'skill-religion-value': intMod,
            'skill-animal-value': wisMod,
            'skill-insight-value': wisMod,
            'skill-medicine-value': wisMod,
            'skill-perception-value': wisMod,
            'skill-survival-value': wisMod,
            'skill-deception-value': chaMod,
            'skill-intimidation-value': chaMod,
            'skill-performance-value': chaMod,
            'skill-persuasion-value': chaMod,
        };
        for (const [id, value] of Object.entries(skillsMap)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
    }
    [strengthInput, dexterityInput, constitutionInput, intelligenceInput, wisdomInput, charismaInput, expInput].forEach(input => {
        input.addEventListener('input', recalcAll);
    });
    recalcAll();

    // Загрузка существующего персонажа
    if (!isNew) {
        apiRequest(`/characters/${characterId}`).then(data => {
            nameInput.value = data.name || '';
            classInput.value = data.class_name || '';
            expInput.value = data.experience || 0;
            strengthInput.value = data.strength_score || 10;
            dexterityInput.value = data.dexterity_score || 10;
            constitutionInput.value = data.constitution_score || 10;
            intelligenceInput.value = data.intelligence_score || 10;
            wisdomInput.value = data.wisdom_score || 10;
            charismaInput.value = data.charisma_score || 10;
            if (document.getElementById('race')) document.getElementById('race').value = data.race || '';
            if (document.getElementById('current-hp')) document.getElementById('current-hp').value = data.hp || 0;
            if (document.getElementById('armour-class')) document.getElementById('armour-class').value = data.armour_class || 10;
            if (document.getElementById('speed')) document.getElementById('speed').value = data.speed || 30;
            if (document.getElementById('initiative')) document.getElementById('initiative').value = data.initiative || 0;
            if (document.getElementById('inspiration')) document.getElementById('inspiration').checked = data.inspiration || false;

            if (data.details) {
                if (document.getElementById('alignment')) document.getElementById('alignment').value = data.details.alignment || '';
                if (document.getElementById('player-name')) document.getElementById('player-name').value = data.details.player_name || '';
                if (document.getElementById('personality-traits')) document.getElementById('personality-traits').value = data.details.personality_traits || '';
                if (document.getElementById('ideals')) document.getElementById('ideals').value = data.details.ideals || '';
                if (document.getElementById('bonds')) document.getElementById('bonds').value = data.details.bonds || '';
                if (document.getElementById('flaws')) document.getElementById('flaws').value = data.details.flaws || '';
                if (document.getElementById('features-traits')) document.getElementById('features-traits').value = data.details.features_traits || '';
                if (document.getElementById('equipment')) document.getElementById('equipment').value = data.details.equipment || '';
                if (document.getElementById('other-proficiencies')) document.getElementById('other-proficiencies').value = data.details.other_proficiencies || '';
                if (document.getElementById('hit-dice')) document.getElementById('hit-dice').value = data.details.hit_dice || '';
                if (document.getElementById('temp-hp')) document.getElementById('temp-hp').value = data.details.temp_hp || 0;
                if (data.details.attacks && data.details.attacks.length) {
                    if (document.getElementById('attack1')) document.getElementById('attack1').value = data.details.attacks[0] || '';
                    if (document.getElementById('attack2')) document.getElementById('attack2').value = data.details.attacks[1] || '';
                    if (document.getElementById('attack3')) document.getElementById('attack3').value = data.details.attacks[2] || '';
                    if (document.getElementById('attack4')) document.getElementById('attack4').value = data.details.attacks[3] || '';
                    if (document.getElementById('attack5')) document.getElementById('attack5').value = data.details.attacks[4] || '';
                    if (document.getElementById('attack6')) document.getElementById('attack6').value = data.details.attacks[5] || '';
                    if (document.getElementById('attack7')) document.getElementById('attack7').value = data.details.attacks[6] || '';
                    if (document.getElementById('attack8')) document.getElementById('attack8').value = data.details.attacks[7] || '';
                    if (document.getElementById('attack9')) document.getElementById('attack9').value = data.details.attacks[8] || '';
                    if (document.getElementById('text')) document.getElementById('text').value = data.details.attacks[9] || '';
                }
                if (data.skill_bonuses) {
                    const skillsFromServer = {
                        'skill-acrobatics-value': data.skill_bonuses.acrobatics,
                        'skill-animal-value': data.skill_bonuses.animal_care,
                        'skill-arcana-value': data.skill_bonuses.magic,
                        'skill-athletics-value': data.skill_bonuses.athletics,
                        'skill-deception-value': data.skill_bonuses.deception,
                        'skill-history-value': data.skill_bonuses.history,
                        'skill-insight-value': data.skill_bonuses.discernment,
                        'skill-intimidation-value': data.skill_bonuses.bullying,
                        'skill-investigation-value': data.skill_bonuses.analysis,
                        'skill-medicine-value': data.skill_bonuses.medicine,
                        'skill-nature-value': data.skill_bonuses.nature,
                        'skill-perception-value': data.skill_bonuses.mindfulness,
                        'skill-performance-value': data.skill_bonuses.performance,
                        'skill-persuasion-value': data.skill_bonuses.persuasion,
                        'skill-religion-value': data.skill_bonuses.religion,
                        'skill-sleight-of-hand-value': data.skill_bonuses.sleight_of_hand,
                        'skill-stealth-value': data.skill_bonuses.reticence,
                        'skill-survival-value': data.skill_bonuses.survival,
                    };
                    for (const [id, value] of Object.entries(skillsFromServer)) {
                        const el = document.getElementById(id);
                        if (el) el.innerText = value || 0;
                    }
                } else {
                    recalcSkills();
                }
            }
            recalcAll();
        }).catch(err => {
            alert('Ошибка загрузки персонажа: ' + err.message);
        });
    }
    document.getElementById('save-btn').addEventListener('click', async () => {
        const characterData = {
            name: nameInput.value,
            class_name: classInput.value || null,
            race: document.getElementById('race')?.value || null,
            experience: parseInt(expInput.value) || 0,
            hp: parseInt(document.getElementById('current-hp')?.value) || 0,
            strength_score: parseInt(strengthInput.value) || 10,
            dexterity_score: parseInt(dexterityInput.value) || 10,
            constitution_score: parseInt(constitutionInput.value) || 10,
            intelligence_score: parseInt(intelligenceInput.value) || 10,
            wisdom_score: parseInt(wisdomInput.value) || 10,
            charisma_score: parseInt(charismaInput.value) || 10,
            armour_class: parseInt(document.getElementById('armour-class')?.value) || 10,
            speed: parseInt(document.getElementById('speed')?.value) || 30,
            initiative: parseInt(document.getElementById('initiative')?.value) || 0,
            inspiration: document.getElementById('inspiration')?.checked || false,
            details: {
                alignment: document.getElementById('alignment')?.value || null,
                player_name: document.getElementById('player-name')?.value || null,
                personality_traits: document.getElementById('personality-traits')?.value || null,
                ideals: document.getElementById('ideals')?.value || null,
                bonds: document.getElementById('bonds')?.value || null,
                flaws: document.getElementById('flaws')?.value || null,
                features_traits: document.getElementById('features-traits')?.value || null,
                equipment: document.getElementById('equipment')?.value || null,
                other_proficiencies: document.getElementById('other-proficiencies')?.value || null,
                hit_dice: document.getElementById('hit-dice')?.value || null,
                temp_hp: parseInt(document.getElementById('temp-hp')?.value) || 0,
                attacks: [
                    document.getElementById('attack1')?.value || null,
                    document.getElementById('attack2')?.value || null,
                    document.getElementById('attack3')?.value || null,
                    document.getElementById('attack4')?.value || null,
                    document.getElementById('attack5')?.value || null,
                    document.getElementById('attack6')?.value || null,
                    document.getElementById('attack7')?.value || null,
                    document.getElementById('attack8')?.value || null,
                    document.getElementById('attack9')?.value || null,
                    document.getElementById('text')?.value || null,
                ],
            }
        };

        try {
            if (isNew) {
                await apiRequest('/characters/', {
                    method: 'POST',
                    body: JSON.stringify(characterData),
                });
            } else {
                await apiRequest(`/characters/${characterId}`, {
                    method: 'PUT',
                    body: JSON.stringify(characterData),
                });
            }
            alert('Сохранено!');
            window.location.href = '/static/dashboard.html';
        } catch (err) {
            alert('Ошибка сохранения: ' + err.message);
        }
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = '/static/dashboard.html';
    });
}