// ============================================================
// ZENITH BARBER CLOUD — app.js (FULL EXTENDED VERSION)
// ============================================================

// js/app.js

// 1. Vincular el botón "Refrescar" del Dashboard
function refrescarPantalla() {
    // Cerramos la cortina
    window.cerrarCortina();

    // Esperamos a que se cierre para simular la carga y volver a abrirla
    setTimeout(() => {
        // Aquí podrías recargar datos de la API si quieres
        console.log("Sistema Refrescado");

        window.abrirCortina();
    }, 1000);
}

// 2. Vincular el Logout
function logout() {
    window.cerrarCortina();

    setTimeout(() => {
        // Hacemos el cambio de vista mientras está tapado
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'flex';

        // Volvemos a abrir la cortina para mostrar el Login
        setTimeout(() => {
            window.abrirCortina();
        }, 300);
    }, 800);
}

// 3. OPCIONAL: Si quieres que la cortina se cierre al darle F5 o refrescar el navegador
window.addEventListener('beforeunload', () => {
    window.cerrarCortina();
});

const USERS = {
    'joan':    { pass: '1234',  name: 'Joan Eras',  avatar: 'J' },
    'anthony': { pass: '5678',  name: 'Anthony',    avatar: 'A' },
    'admin':   { pass: 'admin', name: 'Super User', avatar: 'S' }
};

// Estados Globales
let selectedSvc  = "";
let selectedPago = "";
let currentCitas = [];

// ============================================================
// 1. UTILIDADES Y NOTIFICACIONES (TOAST)
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

    // Animación de salida
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================================
// 2. SISTEMA DE LOGIN Y SESIÓN
// ============================================================
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value;

    if (USERS[u] && USERS[u].pass === p) {
        // Guardar en sesión simulada si fuera necesario
        document.getElementById('displayUserName').innerText = USERS[u].name;
        document.getElementById('avatarIcon').innerText     = USERS[u].avatar;

        // Transición de interfaz
        document.getElementById('loginSection').style.display    = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';

        // Carga inicial de datos
        inicializarDashboard();
        showToast(`Bienvenido de nuevo, ${USERS[u].name}`);
    } else {
        showToast('Credenciales incorrectas. Verifique usuario y contraseña.', 'error');
    }
});

function logout() {
    if (!confirm('¿Desea cerrar la sesión del sistema?')) return;
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display    = 'flex';
    document.getElementById('loginForm').reset();
    showToast('Sesión finalizada.');
}

// ============================================================
// 3. NAVEGACIÓN Y TABS
// ============================================================
function showTab(tabId, el) {
    // Reset de botones
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');

    // Reset de paneles
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    const target = document.getElementById('tab-' + tabId);
    target.classList.add('active');

    // Cargas específicas según el tab
    if (tabId === 'servicios') renderServicios();
    if (tabId === 'agenda') renderAppointments();
    if (tabId === 'stats') actualizarEstadisticas();
}

// ============================================================
// 4. GESTIÓN DE SERVICIOS (API & BUBBLES)
// ============================================================
async function cargarBubblesServicios() {
    const container = document.getElementById('bubblesServicios');
    if (!container) return;

    try {
        const res = await fetch('/api/servicios');
        const servicios = await res.json();

        container.innerHTML = '';
        selectedSvc = '';

        servicios.forEach(s => {
            const div = document.createElement('div');
            div.className = 'b-opt';
            div.textContent = s.nombre;
            div.onclick = () => {
                document.querySelectorAll('#bubblesServicios .b-opt').forEach(b => b.classList.remove('active'));
                div.classList.add('active');
                selectedSvc = s.nombre;

                // Sincronizar slider de duración con el servicio
                const slider = document.getElementById('duracion');
                const label  = document.getElementById('durValue');
                slider.value = s.duracionMin;
                label.innerText = s.duracionMin;
            };
            container.appendChild(div);
        });
    } catch (err) {
        console.error("Error al cargar burbujas:", err);
    }
}

async function renderServicios() {
    const grid = document.getElementById('serviciosGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/servicios');
        const data = await res.json();
        grid.innerHTML = '';

        data.forEach(s => {
            const card = document.createElement('div');
            card.className = 's-card';
            card.innerHTML = `
                <h4>${s.nombre}</h4>
                <p>₡${s.precio.toLocaleString()}</p>
                <small>${s.duracionMin} minutos</small>
                <button class="btn-delete" style="width:100%; margin-top:15px;" onclick="eliminarServicio(${s.id})">
                    Eliminar Servicio
                </button>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        showToast('Error al conectar con la lista de servicios.', 'error');
    }
}

async function agregarServicio() {
    const nombre   = document.getElementById('svcNombre').value.trim();
    const precio   = parseInt(document.getElementById('svcPrecio').value);
    const duracion = parseInt(document.getElementById('svcDuracion').value);

    if (!nombre || isNaN(precio) || isNaN(duracion)) {
        showToast('Por favor, complete todos los campos del servicio.', 'error');
        return;
    }

    try {
        const res = await fetch('/api/servicios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, duracionMin: duracion })
        });

        if (res.ok) {
            showToast('Servicio agregado al catálogo.');
            document.getElementById('svcNombre').value = '';
            document.getElementById('svcPrecio').value = '';
            document.getElementById('svcDuracion').value = '';
            renderServicios();
            cargarBubblesServicios();
        }
    } catch (err) {
        showToast('Error al guardar servicio.', 'error');
    }
}

async function eliminarServicio(id) {
    if (!confirm('¿Desea eliminar este servicio? Esto lo quitará de las opciones de cita.')) return;
    try {
        const res = await fetch(`/api/servicios/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Servicio eliminado.');
            renderServicios();
            cargarBubblesServicios();
        }
    } catch (err) {
        showToast('Error al eliminar.', 'error');
    }
}

// ============================================================
// 5. GESTIÓN DE CITAS (AGENDA)
// ============================================================
function setPago(el, pago) {
    document.querySelectorAll('.pago-opt').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedPago = pago;
}

document.getElementById('duracion').oninput = function() {
    document.getElementById('durValue').innerText = this.value;
};

document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validaciones Extra
    if (!selectedSvc)  return showToast('Debe seleccionar un servicio.', 'error');
    if (!selectedPago) return showToast('Seleccione un método de pago.', 'error');

    const tel = document.getElementById('telefono').value;
    const ced = document.getElementById('cedula').value;

    if (tel.length !== 8) return showToast('El teléfono debe tener 8 dígitos.', 'error');
    if (ced.length !== 9) return showToast('La cédula debe tener 9 dígitos.', 'error');

    const appointmentData = {
        clienteNombre: document.getElementById('nombre').value.trim(),
        telefono: tel,
        cedula: ced,
        fechaHora: document.getElementById('fecha').value,
        servicio: selectedSvc,
        metodoPago: selectedPago,
        duracionMin: parseInt(document.getElementById('duracion').value)
    };

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'PROCESANDO...';

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        if (res.ok) {
            showToast('✅ Cita agendada con éxito.');
            e.target.reset();
            resetSelecciones();
            renderAppointments();
        } else {
            const msg = await res.text();
            showToast(msg || 'Error al agendar.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión con el servidor.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'CONFIRMAR';
    }
});

async function renderAppointments() {
    const list = document.getElementById('appointmentsList');
    if (!list) return;

    try {
        const res = await fetch('/api/appointments');
        currentCitas = await res.json();

        actualizarEstadisticas();

        if (currentCitas.length === 0) {
            list.innerHTML = '<div class="empty-state"><span>📅</span>No hay citas pendientes.</div>';
            return;
        }

        list.innerHTML = '';
        currentCitas.forEach(c => {
            const card = document.createElement('div');
            card.className = 'appt-card';
            card.innerHTML = `
                <div>
                    <div class="svc-label">${c.servicio} — ${c.duracionMin} min</div>
                    <h4>${c.clienteNombre}</h4>
                    <small>🪪 ${c.cedula} | 📞 ${c.telefono}</small><br>
                    <small>🕒 ${new Date(c.fechaHora).toLocaleString('es-CR')}</small><br>
                    <small>💰 Pago: ${c.metodoPago}</small>
                </div>
                <button class="btn-delete" onclick="eliminarCita(${c.id})">✕</button>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error("Error al renderizar citas:", err);
    }
}

async function eliminarCita(id) {
    if (!confirm('¿Marcar cita como finalizada o cancelada?')) return;
    try {
        const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Cita removida de la agenda.');
            renderAppointments();
        }
    } catch (err) {
        showToast('No se pudo eliminar la cita.', 'error');
    }
}

// ============================================================
// 6. FILTROS Y BÚSQUEDA
// ============================================================
function filtrarCitas(query) {
    const q = query.toLowerCase().trim();
    const cards = document.querySelectorAll('.appt-card');

    cards.forEach(card => {
        const contenido = card.innerText.toLowerCase();
        card.style.display = contenido.includes(q) ? 'flex' : 'none';
    });
}

// ============================================================
// 7. DASHBOARD & RELOJ
// ============================================================
function inicializarDashboard() {
    cargarBubblesServicios();
    renderAppointments();
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const totalEl = document.getElementById('totalCount');
    if (totalEl) totalEl.innerText = currentCitas.length;
}

function resetSelecciones() {
    selectedSvc = "";
    selectedPago = "";
    document.querySelectorAll('.b-opt, .pago-opt').forEach(b => b.classList.remove('active'));
    document.getElementById('durValue').innerText = "30";
    document.getElementById('duracion').value = "30";
}

function updateClock() {
    const clock = document.getElementById('liveClock');
    if (clock) {
        const now = new Date();
        clock.innerText = now.toLocaleTimeString('es-CR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    }
}

// ============================================================
// 8. CARGA INICIAL (LOADER)
// ============================================================
window.addEventListener('load', () => {
    const loader = document.getElementById('curtain-loader');

    // Iniciar Reloj
    setInterval(updateClock, 1000);
    updateClock();

    // Lógica del Curtain Loader
    setTimeout(() => {
        loader.classList.add('loader-finished');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1200);
    }, 1500);
});