let loggedIn = false;

window.addEventListener('load', () => checkStatus());

async function checkStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.loggedIn) {
            loggedIn = true;
            showDash();
            loadStats();
            loadRecent();
        } else {
            showLogin();
        }
    } catch (e) {
        showLogin();
    }
}

async function login() {
    const token = document.getElementById('token').value.trim();
    const error = document.getElementById('error');
    if (!token || token.length < 50) {
        error.textContent = 'Invalid token';
        return;
    }
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.success) {
            loggedIn = true;
            error.textContent = '';
            showDash();
            loadStats();
        } else {
            error.textContent = data.error || 'Login failed';
        }
    } catch (e) {
        error.textContent = 'Error: ' + e.message;
    }
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    loggedIn = false;
    showLogin();
}

function showLogin() {
    document.getElementById('login').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDash() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

function tab(name) {
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name).style.display = 'block';
    event.target.classList.add('active');
    if (name === 'guilds') loadGuilds();
}

async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.stats) {
            document.getElementById('s1').textContent = data.stats.totalMessages || 0;
            document.getElementById('s2').textContent = data.stats.uniqueUsers || 0;
            document.getElementById('s3').textContent = data.stats.totalGuilds || 0;
        }
    } catch (e) { console.error(e); }
}

async function loadRecent() {
    try {
        const res = await fetch('/api/messages?limit=20');
        const data = await res.json();
        const container = document.getElementById('recent');
        container.innerHTML = '';
        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                const date = new Date(msg.timestamp).toLocaleString();
                container.innerHTML += `<div class="msg"><strong>${msg.authorName}</strong> in ${msg.channelName} (${msg.guildName})<br><small>${date}</small><p>${msg.content.substring(0, 100)}</p></div>`;
            });
        }
    } catch (e) { console.error(e); }
}

async function doSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        const container = document.getElementById('search-results');
        container.innerHTML = `<p>Found ${data.messages.length} results</p>`;
        data.messages.slice(0, 20).forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            container.innerHTML += `<div class="msg"><strong>${msg.authorName}</strong> (${msg.authorId})<br><small>${date}</small><p>${msg.content.substring(0, 100)}</p></div>`;
        });
    } catch (e) { alert('Error: ' + e.message); }
}

async function doKeyword() {
    const keyword = document.getElementById('keyword-input').value.trim();
    if (!keyword) return;
    try {
        const res = await fetch('/api/keyword?k=' + encodeURIComponent(keyword));
        const data = await res.json();
        const container = document.getElementById('keyword-results');
        container.innerHTML = `<p>Found ${data.messages.length} messages</p>`;
        data.messages.slice(0, 20).forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            container.innerHTML += `<div class="msg"><strong>${msg.authorName}</strong><br><small>${date}</small><p>${msg.content.substring(0, 100)}</p></div>`;
        });
    } catch (e) { alert('Error: ' + e.message); }
}

async function loadGuilds() {
    try {
        const res = await fetch('/api/guilds');
        const data = await res.json();
        const container = document.getElementById('guilds-list');
        container.innerHTML = '';
        if (data.guilds && data.guilds.length > 0) {
            data.guilds.forEach(guild => {
                container.innerHTML += `<div class="guild-card"><strong>${guild.name}</strong><br>ID: ${guild.id}<br>Members: ${guild.memberCount}</div>`;
            });
        }
    } catch (e) { console.error(e); }
}

setInterval(() => { if (loggedIn) loadStats(); }, 30000);
