// ============================================================
// ZENITH BARBER CLOUD — app.js  (VERSIÓN CORREGIDA)
// ============================================================

const USERS = {
    'joan':    { pass: '1234',  name: 'Joan Eras',  avatar: 'J' },
    'anthony': { pass: '5678',  name: 'Anthony',    avatar: 'A' },
    'admin':   { pass: 'admin', name: 'Super User', avatar: 'S' }
};

let selectedSvc  = "";
let selectedPago = "";
let currentCitas = [];

// ============================================================
// TOAST
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
// LOGIN
// ============================================================
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('user').value.trim();
    const p = document.getElementById('pass').value;

    if (USERS[u] && USERS[u].pass === p) {
        document.getElementById('displayUserName').innerText = USERS[u].name;
        document.getElementById('avatarIcon').innerText      = USERS[u].avatar;
        document.getElementById('loginSection').style.display     = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        showToast(`Bienvenido, ${USERS[u].name}`);
        inicializarDashboard();
    } else {
        showToast('Usuario o contraseña incorrectos.', 'error');
    }
});

// ============================================================
// LOGOUT
// ============================================================
function logout() {
    if (!confirm('¿Desea cerrar la sesión?')) return;
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display     = 'flex';
    document.getElementById('loginForm').reset();
    showToast('Sesión cerrada correctamente.');
}

// ============================================================
// NAVEGACIÓN
// ============================================================
function showTab(tabId, el) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');

    if (tabId === 'servicios') renderServicios();
    if (tabId === 'agenda')    renderAppointments();
    if (tabId === 'stats')     actualizarEstadisticas();
}

// ============================================================
// BURBUJAS DE SERVICIOS
// ============================================================
async function cargarBubblesServicios() {
    const container = document.getElementById('bubblesServicios');
    if (!container) return;

    try {
        const res = await fetch('/api/servicios');
        if (!res.ok) return;
        const servicios = await res.json();

        container.innerHTML = '';
        selectedSvc = '';

        servicios.forEach(s => {
            const div = document.createElement('div');
            div.className = 'b-opt';
            div.textContent = s.nombre;
            div.addEventListener('click', () => {
                document.querySelectorAll('#appointmentForm .bubbles .b-opt')
                    .forEach(b => b.classList.remove('active'));
                div.classList.add('active');
                selectedSvc = s.nombre;
                const slider = document.getElementById('duracion');
                const label  = document.getElementById('durValue');
                if (s.duracionMin) {
                    slider.value    = Math.min(s.duracionMin, 120);
                    label.innerText = Math.min(s.duracionMin, 120);
                }
            });
            container.appendChild(div);
        });
    } catch (err) {
        showToast('No se pudieron cargar los servicios.', 'error');
    }
}

// ============================================================
// MÉTODO DE PAGO
// ============================================================
function setPago(el, pago) {
    document.querySelectorAll('.pago-opt').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedPago = pago;
}

// ============================================================
// SLIDER DURACIÓN
// ============================================================
document.getElementById('duracion').addEventListener('input', function () {
    document.getElementById('durValue').innerText = this.value;
});

// ============================================================
// CREAR CITA — con campo email y manejo de 409 Conflict
// ============================================================
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // ✅ Validaciones en frontend
    const email = document.getElementById('email').value.trim();
    if (!email) { showToast('El email es obligatorio.', 'error'); return; }

    const emailRegex = /^[\w.+-]+@[\w-]+\.[\w.]+$/;
    if (!emailRegex.test(email)) {
        showToast('El email no tiene un formato válido.', 'error');
        return;
    }

    const fechaVal = document.getElementById('fecha').value;
    if (!fechaVal) { showToast('La fecha y hora son obligatorias.', 'error'); return; }
    if (new Date(fechaVal) <= new Date()) {
        showToast('No puedes agendar una cita en el pasado.', 'error');
        return;
    }

    // ✅ Body con los campos del enunciado
    const data = {
        clienteNombre:    document.getElementById('nombre').value.trim(),
        clienteEmail:     email,
        clienteTelefono:  document.getElementById('telefono').value.trim() || null,
        fechaHora:        fechaVal,
        duracionMin:      parseInt(document.getElementById('duracion').value, 10)
    };

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Guardando...';

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.status === 201) {
            e.target.reset();
            resetSelecciones();
            showToast('✅ Cita confirmada correctamente.');
            renderAppointments();

        } else if (res.status === 409) {
            // ✅ Manejo especial del conflicto de solapamiento
            const body = await res.json();
            showToast('⚠️ ' + (body.error || 'Conflicto de horario.'), 'error', 6000);

        } else {
            const body = await res.json().catch(() => ({}));
            showToast(body.error || 'Error al guardar la cita.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'CONFIRMAR';
    }
});

// ============================================================
// RENDERIZAR CITAS
// ============================================================
async function renderAppointments(emailFiltro = '') {
    const list = document.getElementById('appointmentsList');
    if (!list) return;

    try {
        // ✅ Filtro por email via query param
        const url = emailFiltro
            ? `/api/appointments?clienteEmail=${encodeURIComponent(emailFiltro)}`
            : '/api/appointments';

        const res = await fetch(url);
        if (!res.ok) { showToast('Error al cargar las citas.', 'error'); return; }
        currentCitas = await res.json();

        actualizarEstadisticas();

        if (currentCitas.length === 0) {
            list.innerHTML = '<div class="empty-state"><span>📅</span>No hay citas registradas aún.</div>';
            return;
        }

        list.innerHTML = '';
        currentCitas.forEach(c => {
            const card = document.createElement('div');
            card.className = 'appt-card';

            // ✅ Badge de estado (RESERVADA / CANCELADA)
            const estadoBadge = document.createElement('div');
            estadoBadge.style.cssText = `
                display: inline-block;
                padding: 2px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                margin-bottom: 6px;
                background: ${c.estado === 'RESERVADA' ? 'rgba(0,200,100,0.2)' : 'rgba(255,80,80,0.2)'};
                color:       ${c.estado === 'RESERVADA' ? '#00e676' : '#ff5252'};
            `;
            estadoBadge.textContent = c.estado;

            const info = document.createElement('div');

            const nombre = document.createElement('h4');
            nombre.textContent = c.clienteNombre;

            const emailEl = document.createElement('small');
            emailEl.style.display = 'block';
            emailEl.textContent = `📧 ${c.clienteEmail}`;

            const tel = document.createElement('small');
            tel.style.display = 'block';
            tel.textContent = c.clienteTelefono ? `📞 ${c.clienteTelefono}` : '';

            const fecha = document.createElement('small');
            fecha.style.display = 'block';
            fecha.textContent = `🗓 ${new Date(c.fechaHora).toLocaleString('es-CR')} · ${c.duracionMin} min`;

            const creado = document.createElement('small');
            creado.style.display = 'block';
            creado.style.opacity = '0.5';
            creado.textContent = `Creada: ${new Date(c.creadoEn).toLocaleString('es-CR')}`;

            info.appendChild(estadoBadge);
            info.appendChild(nombre);
            info.appendChild(emailEl);
            if (c.clienteTelefono) info.appendChild(tel);
            info.appendChild(fecha);
            info.appendChild(creado);

            card.appendChild(info);

            // ✅ Solo mostrar botón cancelar si la cita está RESERVADA
            if (c.estado === 'RESERVADA') {
                const delBtn = document.createElement('button');
                delBtn.className = 'btn-delete';
                delBtn.textContent = '✕ Cancelar';
                delBtn.title = 'Cancelar cita';
                delBtn.addEventListener('click', () => cancelarCita(c.id, card));
                card.appendChild(delBtn);
            }

            list.appendChild(card);
        });

    } catch (err) {
        showToast('No se pudo conectar con el servidor.', 'error');
    }
}

// ============================================================
// FILTRAR POR EMAIL (llama al backend con ?clienteEmail=)
// ============================================================
function filtrarPorEmail() {
    const email = document.getElementById('searchEmail').value.trim();
    renderAppointments(email);
}

// ============================================================
// CANCELAR CITA (DELETE → marca como CANCELADA)
// ============================================================
async function cancelarCita(id, cardEl) {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
        const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Cita cancelada.');
            if (cardEl) {
                cardEl.style.opacity = '0';
                cardEl.style.transition = 'opacity 0.3s ease';
                setTimeout(() => renderAppointments(), 300);
            } else {
                renderAppointments();
            }
        } else {
            const body = await res.json().catch(() => ({}));
            showToast(body.error || 'No se pudo cancelar la cita.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    }
}

// ============================================================
// GESTIÓN DE SERVICIOS
// ============================================================
async function renderServicios() {
    const grid = document.getElementById('serviciosGrid');
    if (!grid) return;
    try {
        const res = await fetch('/api/servicios');
        if (!res.ok) return;
        const servicios = await res.json();

        grid.innerHTML = '';
        servicios.forEach(s => {
            const card = document.createElement('div');
            card.className = 's-card';

            const h4 = document.createElement('h4');
            h4.textContent = s.nombre;

            const precio = document.createElement('p');
            precio.textContent = `₡${s.precio.toLocaleString()}`;

            const dur = document.createElement('small');
            dur.textContent = `${s.duracionMin} min`;
            dur.style.color   = 'rgba(255,255,255,0.5)';
            dur.style.display = 'block';
            dur.style.marginBottom = '12px';

            const btn = document.createElement('button');
            btn.className   = 'btn-delete';
            btn.style.width = '100%';
            btn.textContent = 'Eliminar';
            btn.addEventListener('click', () => eliminarServicio(s.id));

            card.appendChild(h4);
            card.appendChild(precio);
            card.appendChild(dur);
            card.appendChild(btn);
            grid.appendChild(card);
        });
    } catch (err) {
        showToast('Error cargando servicios.', 'error');
    }
}

async function agregarServicio() {
    const nombre   = document.getElementById('svcNombre').value.trim();
    const precio   = parseInt(document.getElementById('svcPrecio').value, 10);
    const duracion = parseInt(document.getElementById('svcDuracion').value, 10);

    if (!nombre || isNaN(precio) || isNaN(duracion)) {
        showToast('Completá todos los campos del servicio.', 'error');
        return;
    }

    try {
        const res = await fetch('/api/servicios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, duracionMin: duracion })
        });

        if (res.ok) {
            document.getElementById('svcNombre').value   = '';
            document.getElementById('svcPrecio').value   = '';
            document.getElementById('svcDuracion').value = '';
            showToast('✅ Servicio agregado.');
            renderServicios();
            cargarBubblesServicios();
        } else {
            const err = await res.text();
            showToast(err || 'Error al agregar servicio.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    }
}

async function eliminarServicio(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
        const res = await fetch(`/api/servicios/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Servicio eliminado.');
            renderServicios();
            cargarBubblesServicios();
        } else {
            showToast('No se pudo eliminar.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    }
}

// ============================================================
// ESTADÍSTICAS
// ============================================================
function actualizarEstadisticas() {
    const totalEl      = document.getElementById('totalCount');
    const reservadasEl = document.getElementById('reservadasCount');
    const canceladasEl = document.getElementById('canceladasCount');

    if (totalEl)      totalEl.innerText      = currentCitas.length;
    if (reservadasEl) reservadasEl.innerText = currentCitas.filter(c => c.estado === 'RESERVADA').length;
    if (canceladasEl) canceladasEl.innerText = currentCitas.filter(c => c.estado === 'CANCELADA').length;
}

// ============================================================
// INICIALIZAR DASHBOARD
// ============================================================
function inicializarDashboard() {
    cargarBubblesServicios();
    renderAppointments();
}

// ============================================================
// RESET SELECCIONES
// ============================================================
function resetSelecciones() {
    selectedSvc  = "";
    selectedPago = "";
    document.querySelectorAll('.b-opt, .pago-opt').forEach(b => b.classList.remove('active'));
    document.getElementById('durValue').innerText = '30';
    document.getElementById('duracion').value     = '30';
}

// ============================================================
// RELOJ
// ============================================================
function updateClock() {
    const el = document.getElementById('liveClock');
    if (el) el.innerText = new Date().toLocaleTimeString('es-CR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
}
updateClock();
setInterval(updateClock, 1000);