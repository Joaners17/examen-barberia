// ============================================================
// ZENITH BARBER CLOUD — app.js (mejorado)
// ============================================================

// ✅ USUARIOS — Solo para demo frontend.
// En producción, el login debe validarse contra el backend con JWT.
const USERS = {
    'joan':    { pass: '1234',  name: 'Joan Eras',  avatar: 'J' },
    'anthony': { pass: '5678',  name: 'Anthony',    avatar: 'A' },
    'admin':   { pass: 'admin', name: 'Super User', avatar: 'S' }
};

let selectedSvc = "";

// ============================================================
// TOAST NOTIFICATIONS (reemplaza los alert())
// ============================================================
function showToast(msg, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
// NAVEGACIÓN DE TABS
// ============================================================

// ✅ Recibe el evento como parámetro — evita el uso de `event` global
function showTab(tabId, btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

// Asignar listeners a los botones del nav (en lugar de onclick en HTML)
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) showTab(tab, btn);
    });
});

// ============================================================
// LOGIN
// ============================================================
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value;

    if (USERS[u] && USERS[u].pass === p) {
        document.getElementById('displayUserName').innerText = USERS[u].name;
        document.getElementById('avatarIcon').innerText     = USERS[u].avatar;
        document.getElementById('loginSection').style.display    = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        render();
    } else {
        // ✅ Toast en vez de alert()
        showToast('Usuario o contraseña incorrectos.', 'error');
    }
});

// ============================================================
// SELECCIÓN DE SERVICIO
// ============================================================
function setS(el, svc) {
    document.querySelectorAll('.b-opt').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedSvc = svc;
}

// ============================================================
// SLIDER DE DURACIÓN
// ============================================================
document.getElementById('duracion').addEventListener('input', function () {
    document.getElementById('durValue').innerText = this.value;
});

// ============================================================
// CREAR CITA
// ============================================================
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedSvc) {
        showToast('Selecciona un servicio antes de confirmar.', 'error');
        return;
    }

    const fechaVal = document.getElementById('fecha').value;

    // ✅ Validar que la fecha no sea en el pasado
    if (new Date(fechaVal) < new Date()) {
        showToast('No puedes agendar una cita en el pasado.', 'error');
        return;
    }

    const data = {
        clienteNombre: document.getElementById('nombre').value.trim(),
        fechaHora:     fechaVal,
        servicio:      selectedSvc,
        // ✅ Convertir a número entero (antes se enviaba como string)
        duracionMin:   parseInt(document.getElementById('duracion').value, 10)
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Guardando...';

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            e.target.reset();
            document.getElementById('durValue').innerText = '30';
            selectedSvc = '';
            document.querySelectorAll('.b-opt').forEach(b => b.classList.remove('active'));
            showToast('✅ Cita confirmada correctamente.');
            render();
        } else {
            // ✅ Muestra el mensaje de error del backend
            const errText = await res.text();
            showToast(errText || 'Error al guardar la cita.', 'error');
        }
    } catch (err) {
        // ✅ Manejo de errores de red
        showToast('Error de conexión. Verifica tu red.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'CONFIRMAR';
    }
});

// ============================================================
// RENDERIZAR LISTA DE CITAS
// ============================================================
async function render() {
    try {
        const res = await fetch('/api/appointments');

        if (!res.ok) {
            showToast('Error al cargar las citas.', 'error');
            return;
        }

        const data = await res.json();
        const list = document.getElementById('appointmentsList');
        document.getElementById('totalCount').innerText = data.length;

        if (data.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span>📅</span>
                    No hay citas registradas aún.
                </div>`;
            return;
        }

        // ✅ Se usa DOM API en lugar de innerHTML con datos del servidor (previene XSS)
        list.innerHTML = '';
        data.forEach(c => {
            const card = document.createElement('div');
            card.className = 'appt-card';

            const info = document.createElement('div');

            const svcLabel = document.createElement('div');
            svcLabel.className = 'svc-label';
            // ✅ textContent previene XSS (no interpreta HTML)
            svcLabel.textContent = `${c.servicio} · ${c.duracionMin} min`;

            const nombre = document.createElement('h4');
            nombre.textContent = c.clienteNombre;

            const fecha = document.createElement('small');
            fecha.textContent = new Date(c.fechaHora).toLocaleString('es-CR');

            info.appendChild(svcLabel);
            info.appendChild(nombre);
            info.appendChild(fecha);

            const delBtn = document.createElement('button');
            delBtn.className = 'btn-delete';
            delBtn.textContent = '✕';
            delBtn.title = 'Eliminar cita';
            delBtn.addEventListener('click', () => del(c.id, card));

            card.appendChild(info);
            card.appendChild(delBtn);
            list.appendChild(card);
        });

    } catch (err) {
        showToast('No se pudo conectar con el servidor.', 'error');
    }
}

// ============================================================
// ELIMINAR CITA
// ============================================================
async function del(id, cardEl) {
    // ✅ Confirmación antes de eliminar
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;

    try {
        const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });

        if (res.ok) {
            // ✅ Animación de salida antes de actualizar
            if (cardEl) {
                cardEl.style.opacity = '0';
                cardEl.style.transition = 'opacity 0.3s ease';
                setTimeout(() => render(), 300);
            } else {
                render();
            }
            showToast('Cita eliminada.');
        } else {
            showToast('No se pudo eliminar la cita.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    }
}

// ============================================================
// LOGOUT
// ============================================================
function logout() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display    = 'flex';
    document.getElementById('loginForm').reset();
    showToast('Sesión cerrada correctamente.');
}

// ============================================================
// RELOJ EN VIVO
// ============================================================
function updateClock() {
    const el = document.getElementById('liveClock');
    if (el) el.innerText = new Date().toLocaleTimeString('es-CR');
}

updateClock();
setInterval(updateClock, 1000);