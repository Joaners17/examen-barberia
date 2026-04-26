// MANEJO DE LOGIN
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    if(user === 'admin' && pass === '1234') {
        localStorage.setItem('auth_token', 'session_active_123'); // Simulación de Token
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        renderCitas();
    } else {
        alert("Credenciales incorrectas");
    }
});

// NAVEGACIÓN
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById('tab-' + tabName).style.display = 'block';
}

function logout() {
    localStorage.removeItem('auth_token');
    location.reload();
}

// CONEXIÓN CON SPRING BOOT API
const listContainer = document.getElementById('appointmentsList');

async function renderCitas() {
    try {
        const response = await fetch('/api/appointments');
        const citas = await response.json();

        listContainer.innerHTML = citas.map(cita => `
            <div class="appointment-item">
                <div>
                    <strong>${cita.clienteNombre}</strong><br>
                    <small>${new Date(cita.fechaHora).toLocaleString()}</small>
                </div>
                <button onclick="eliminarCita(${cita.id})" class="btn-delete">❌</button>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar citas:", error);
    }
}

document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevaCita = {
        clienteNombre: document.getElementById('nombre').value,
        fechaHora: document.getElementById('fecha').value,
        duracionMin: 30
    };

    await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCita)
    });

    e.target.reset();
    renderCitas();
});

async function eliminarCita(id) {
    if(confirm("¿Seguro que quieres cancelar la cita?")) {
        await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        renderCitas();
    }
}