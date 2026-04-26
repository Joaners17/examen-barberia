let currentService = "";

// LOGIN
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    if(document.getElementById('user').value === 'admin' && document.getElementById('pass').value === '1234') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        renderCitas();
    }
};

// SELECCIÓN DE BURBUJAS
function selectService(el, service) {
    document.querySelectorAll('.bubble').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    currentService = service;
}

// RENDER DE CITAS
async function renderCitas() {
    const res = await fetch('/api/appointments');
    const citas = await res.json();
    const list = document.getElementById('appointmentsList');

    list.innerHTML = citas.map(c => `
        <div class="appointment-card">
            <div>
                <strong style="color:var(--gold)">${c.servicio}</strong> — ${c.clienteNombre}<br>
                <small>${new Date(c.fechaHora).toLocaleString()}</small>
            </div>
            <button onclick="deleteCita(${c.id})" style="background:none; border:none; color:red; cursor:pointer;">X</button>
        </div>
    `).join('');
}

// GUARDAR CITA
document.getElementById('appointmentForm').onsubmit = async (e) => {
    e.preventDefault();
    if(!currentService) return alert("Selecciona un servicio");

    const data = {
        clienteNombre: document.getElementById('nombre').value,
        fechaHora: document.getElementById('fecha').value,
        servicio: currentService
    };

    await fetch('/api/appointments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    e.target.reset();
    currentService = "";
    document.querySelectorAll('.bubble').forEach(b => b.classList.remove('active'));
    renderCitas();
};

async function deleteCita(id) {
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    renderCitas();
}

function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById('tab-' + name).style.display = 'block';
}

function logout() { location.reload(); }