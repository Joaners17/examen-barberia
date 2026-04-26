// CONFIGURACIÓN DE USUARIOS
const USERS = {
    'joan': { pass: '1234', name: 'Joan Eras', avatar: 'J' },
    'anthony': { pass: '5678', name: 'Anthony', avatar: 'A' },
    'admin': { pass: 'admin', name: 'Super User', avatar: 'S' }
};

let selectedSvc = "";

// --- SISTEMA DE NAVEGACIÓN ---
function showTab(tabId) {
    // Quitar activa de botones
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Quitar activa de pestañas
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- LOGIN ---
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault(); // IMPORTANTE: Evita que la página se recargue
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;

    if (USERS[u] && USERS[u].pass === p) {
        document.getElementById('displayUserName').innerText = USERS[u].name;
        document.getElementById('avatarIcon').innerText = USERS[u].avatar;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        render();
    } else {
        alert("Credenciales incorrectas");
    }
});

// --- LÓGICA DE CITAS ---
function setS(el, svc) {
    document.querySelectorAll('.b-opt').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedSvc = svc;
}

// Actualizar texto del slider de duración
document.getElementById('duracion').oninput = function() {
    document.getElementById('durValue').innerText = this.value;
};

document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // EVITA RESET

    if(!selectedSvc) return alert("Selecciona un servicio");

    const data = {
        clienteNombre: document.getElementById('nombre').value,
        fechaHora: document.getElementById('fecha').value,
        servicio: selectedSvc,
        duracionMin: document.getElementById('duracion').value // Nuevo campo
    };

    const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if(res.ok) {
        e.target.reset();
        selectedSvc = "";
        document.querySelectorAll('.b-opt').forEach(b => b.classList.remove('active'));
        render();
    }
});

async function render() {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    const list = document.getElementById('appointmentsList');
    document.getElementById('totalCount').innerText = data.length;

    list.innerHTML = data.map(c => `
        <div class="glass-card" style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; padding:15px;">
            <div>
                <span style="color:var(--gold); font-size:0.7rem; font-weight:800;">${c.servicio.toUpperCase()} (${c.duracionMin} min)</span>
                <h4 style="margin:3px 0;">${c.clienteNombre}</h4>
                <small style="opacity:0.5;">${new Date(c.fechaHora).toLocaleString()}</small>
            </div>
            <button onclick="del(${c.id})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>
        </div>
    `).join('');
}

async function del(id) {
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    render();
}

function logout() { location.reload(); }

// Reloj en vivo
setInterval(() => {
    document.getElementById('liveClock').innerText = new Date().toLocaleTimeString();
}, 1000);