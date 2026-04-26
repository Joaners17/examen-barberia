// Simulación de Base de Datos de Usuarios
const usersDB = [
    { user: 'joan', pass: '1234', name: 'Joan Eras', avatar: 'J' },
    { user: 'anthony', pass: '5678', name: 'Anthony', avatar: 'A' },
    { user: 'admin', pass: 'admin', name: 'Sistema Central', avatar: 'S' }
];

let selectedSvc = "";

// LOGIN MULTI-USUARIO
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;

    const session = usersDB.find(x => x.user === u && x.pass === p);

    if(session) {
        // Personalizar Dashboard
        document.getElementById('userName').innerText = session.name;
        document.getElementById('avatarLetter').innerText = session.avatar;

        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        initApp();
    } else {
        alert("Acceso denegado: Usuario no encontrado");
    }
};

function setSvc(el, svc) {
    document.querySelectorAll('.b-option').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedSvc = svc;
}

function initApp() {
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
    render();
}

async function render() {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    const list = document.getElementById('appointmentsList');

    list.innerHTML = data.map(c => `
        <div class="glass-container" style="margin-bottom:15px; padding:20px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="color:var(--accent); font-weight:800; font-size:0.8rem; text-transform:uppercase;">${c.servicio}</span>
                <h4 style="margin:5px 0;">${c.clienteNombre}</h4>
                <small style="opacity:0.6;">${new Date(c.fechaHora).toLocaleString()}</small>
            </div>
            <button onclick="del(${c.id})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:1.2rem;">&times;</button>
        </div>
    `).join('');
}

// RESTO DE FUNCIONES (fetch POST y DELETE igual que antes)