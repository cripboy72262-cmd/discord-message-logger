let sessionId = null;
let loggedIn = false;

window.addEventListener('load', () => checkStatus());

async function checkStatus() {
    try {
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        const res = await fetch('/api/status', { headers });
        const data = await res.json();
        if (data.loggedIn && sessionId) {
            loggedIn = true;
            showDash();
            loadStats();
            loadRecent();
        } else {
            showLogin();
        }
    } catch (e) {
        console.error('Status check error:', e);
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
        if (data.success && data.sessionId) {
            sessionId = data.sessionId;
            loggedIn = true;
            error.textContent = '';
            localStorage.setItem('sessionId', sessionId);
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
    const headers = sessionId ? { 'x-session-id': sessionId } : {};
    await fetch('/api/logout', { method: 'POST', headers });
    sessionId = null;
    localStorage.removeItem('sessionId');
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

async function api(endpoint, method = 'GET') {
    const headers = { 'x-session-id': sessionId };
    const res = await fetch(endpoint, { method, headers });
    return res.json();
}

async function loadStats() {
    try {
        const data = await api('/api/stats');
        if (data.stats) {
            document.getElementById('s1').textContent = data.stats.totalMessages || 0;
            document.getElementById('s2').textContent = data.stats.uniqueUsers || 0;
            document.getElementById('s3').textContent = data.stats.totalGuilds || 0;
        }
    } catch (e) { console.error(e); }
}

async function loadRecent() {
    try {
        const data = await api('/api/messages?limit=20');
        const container = document.getElementById('recent');
        container.innerHTML = '';
        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                const date = new Date(msg.timestamp).toLocaleString();
                container.innerHTML += `<div class="msg"><strong>${msg.authorName}</strong> in ${msg.channelName} (${msg.guildName})<br><small>${date}</small><p>${(msg.content || '').substring(0, 100)}</p></div>`;
            });
        }
    } catch (e) { console.error(e); }
}

async function doSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    try {
        const data = await api('/api/search?q=' + encodeURIComponent(query));
        const container = document.getElementById('search-results');
        container.innerHTML = `<p>Found ${data.messages.length} results</p>`;
        data.messages.slice(0, 20).forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            container.innerHTML += `<div class="msg"><strong>${msg.authorName}</strong> (${msg.authorId})<br><small>${date}</small><p>${(msg.content || '').substring(0, 100)}</p></div>`;
        });
    } catch (e) { alert('Error: ' + e.message); }
}

async function doKeyword() {
    const keyword = document.getElementById('keyword-input').value.trim();
    if (!keyword) return;
    try {
        const data = await api('/api/keyword?k=' + encodeURIComponent(keyword));
        const container = document.getElementById('keyword-results');
        container.innerHTML = `<p>Found ${data.messages.length} messages</p>`;
        data.messages.slice(0, 20).forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString();
            container.innerHTML += `<div class="msg"><strong>${msg.authorName}</strong><br><small>${date}</small><p>${(msg.content || '').substring(0, 100)}</p></div>`;
        });
    } catch (e) { alert('Error: ' + e.message); }
}

async function loadGuilds() {
    try {
        const data = await api('/api/guilds');
        const container = document.getElementById('guilds-list');
        container.innerHTML = '';
        if (data.guilds && data.guilds.length > 0) {
            data.guilds.forEach(guild => {
                container.innerHTML += `<div class="guild-card"><strong>${guild.name}</strong><br>ID: ${guild.id}<br>Members: ${guild.memberCount}</div>`;
            });
        }
    } catch (e) { console.error(e); }
}

window.addEventListener('load', () => {
    const saved = localStorage.getItem('sessionId');
    if (saved) {
        sessionId = saved;
        checkStatus();
    }
});

setInterval(() => { if (loggedIn) loadStats(); }, 30000);
