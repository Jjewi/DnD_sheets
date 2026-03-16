const API_BASE = '';
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
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const errorEl = document.getElementById('register-error');

        try {
            await apiRequest('/users/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
            alert('Регистрация успешна! Теперь войдите.');
            document.getElementById('login-tab').click();
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });
}
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
                    <p>Уровень: ${char.level}</p>
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

if (document.getElementById('sheet-image')) {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    const isNew = !characterId;
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
    }
    [strengthInput, dexterityInput, constitutionInput, intelligenceInput, wisdomInput, charismaInput, expInput].forEach(input => {
        input.addEventListener('input', recalcAll);
    });
    recalcAll();
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
            if (data.details) {
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
            experience: parseInt(expInput.value) || 0,
            strength_score: parseInt(strengthInput.value) || 10,
            dexterity_score: parseInt(dexterityInput.value) || 10,
            constitution_score: parseInt(constitutionInput.value) || 10,
            intelligence_score: parseInt(intelligenceInput.value) || 10,
            wisdom_score: parseInt(wisdomInput.value) || 10,
            charisma_score: parseInt(charismaInput.value) || 10,
            details: {
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