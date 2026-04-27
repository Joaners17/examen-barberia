// ============================================================
// ZENITH BARBER CLOUD — app.js (v2)
// ============================================================

const USERS = {
    'joan':    { pass: '1234',  name: 'Joan Eras',  avatar: 'J' },
    'anthony': { pass: '5678',  name: 'Anthony',    avatar: 'A' },
    'admin':   { pass: 'admin', name: 'Super User', avatar: 'S' }
};

let selectedSvc  = "";
let selectedPago = "";

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
// NAVEGACIÓN
// ============================================================
function showTab(tabId, el) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    if (tabId === 'servicios') renderServicios();
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
        document.getElementById('avatarIcon').innerText     = USERS[u].avatar;
        document.getElementById('loginSection').style.display    = 'none';
        document.getElementById('dashboardSection').style.display = 'flex';
        render();
        cargarBubblesServicios();
    } else {
        showToast('Usuario o contraseña incorrectos.', 'error');
    }
});

// ============================================================
// BURBUJAS DE SERVICIOS — cargadas desde el backend
// ============================================================
async function cargarBubblesServicios() {
    try {
        const res = await fetch('/api/servicios');
        if (!res.ok) return;
        const servicios = await res.json();

        const container = document.querySelector('.bubbles');
        container.innerHTML = '';
        selectedSvc = '';

        servicios.forEach(s => {
            const div = document.createElement('div');
            div.className = 'b-opt';
            div.textContent = s.nombre;
            div.addEventListener('click', () => setS(div, s.nombre, s.duracionMin));
            container.appendChild(div);
        });
    } catch (err) {
        showToast('No se pudieron cargar los servicios.', 'error');
    }
}

function setS(el, svc, duracion) {
    document.querySelectorAll('.b-opt').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedSvc = svc;
    if (duracion) {
        document.getElementById('duracion').value = Math.min(duracion, 120);
        document.getElementById('durValue').innerText = Math.min(duracion, 120);
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
// CREAR CITA
// ============================================================
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedSvc)  { showToast('Selecciona un servicio.', 'error'); return; }
    if (!selectedPago) { showToast('Selecciona un método de pago.', 'error'); return; }

    const telefono = document.getElementById('telefono').value.trim();
    if (!/^\d{8}$/.test(telefono)) {
        showToast('El teléfono debe tener exactamente 8 dígitos.', 'error');
        return;
    }

    const cedula = document.getElementById('cedula').value.trim();
    if (!/^\d{9}$/.test(cedula)) {
        showToast('La cédula debe tener exactamente 9 dígitos.', 'error');
        return;
    }

    const fechaVal = document.getElementById('fecha').value;
    if (new Date(fechaVal) < new Date()) {
        showToast('No puedes agendar una cita en el pasado.', 'error');
        return;
    }

    const data = {
        clienteNombre: document.getElementById('nombre').value.trim(),
        telefono,
        cedula,
        fechaHora:   fechaVal,
        servicio:    selectedSvc,
        metodoPago:  selectedPago,
        duracionMin: parseInt(document.getElementById('duracion').value, 10)
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
            selectedSvc = ''; selectedPago = '';
            document.querySelectorAll('.b-opt, .pago-opt').forEach(b => b.classList.remove('active'));
            showToast('✅ Cita confirmada correctamente.');
            render();
        } else {
            const errText = await res.text();
            showToast(errText || 'Error al guardar la cita.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'CONFIRMAR';
    }
});

// ============================================================
// RENDERIZAR CITAS
// ============================================================
async function render() {
    try {
        const res = await fetch('/api/appointments');
        if (!res.ok) { showToast('Error al cargar las citas.', 'error'); return; }

        const data = await res.json();
        const list = document.getElementById('appointmentsList');
        document.getElementById('totalCount').innerText = data.length;

        if (data.length === 0) {
            list.innerHTML = `<div class="empty-state"><span>📅</span>No hay citas registradas aún.</div>`;
            return;
        }

        list.innerHTML = '';
        data.forEach(c => {
            const card = document.createElement('div');
            card.className = 'appt-card';

            const info = document.createElement('div');

            const svcLabel = document.createElement('div');
            svcLabel.className = 'svc-label';
            svcLabel.textContent = `${c.servicio} · ${c.duracionMin} min · ${c.metodoPago}`;

            const nombre = document.createElement('h4');
            nombre.textContent = c.clienteNombre;

            const tel = document.createElement('small');
            tel.style.display = 'block';
            tel.textContent = `📞 ${c.telefono}`;

            const ced = document.createElement('small');
            ced.style.display = 'block';
            ced.textContent = `🪪 ${c.cedula}`;

            const fecha = document.createElement('small');
            fecha.textContent = new Date(c.fechaHora).toLocaleString('es-CR');

            info.appendChild(svcLabel);
            info.appendChild(nombre);
            info.appendChild(tel);
            info.appendChild(ced);
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

        // Reaplicar filtro si hay texto en el buscador
        const query = document.getElementById('searchCedula').value;
        if (query) filtrarCitas(query);

    } catch (err) {
        showToast('No se pudo conectar con el servidor.', 'error');
    }
}

// ============================================================
// ELIMINAR CITA
// ============================================================
async function del(id, cardEl) {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
        const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        if (res.ok) {
            if (cardEl) {
                cardEl.style.opacity = '0';
                cardEl.style.transition = 'opacity 0.3s ease';
                setTimeout(() => render(), 300);
            } else render();
            showToast('Cita eliminada.');
        } else {
            showToast('No se pudo eliminar la cita.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    }
}

// ============================================================
// FILTRAR CITAS POR CÉDULA
// ============================================================
function filtrarCitas(query) {
    const cards = document.querySelectorAll('.appt-card');
    const q = query.trim();
    cards.forEach(card => {
        const texto = card.innerText;
        card.style.display = (!q || texto.includes(q)) ? '' : 'none';
    });
}

// ============================================================
// GESTIÓN DE SERVICIOS
// ============================================================
async function renderServicios() {
    try {
        const res = await fetch('/api/servicios');
        if (!res.ok) return;
        const servicios = await res.json();

        const grid = document.getElementById('serviciosGrid');
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
            dur.style.color = 'rgba(255,255,255,0.5)';
            dur.style.display = 'block';
            dur.style.marginBottom = '12px';

            const btn = document.createElement('button');
            btn.className = 'btn-delete';
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

    if (!nombre || !precio || !duracion) {
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
// LOGOUT
// ============================================================
function logout() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display    = 'flex';
    document.getElementById('loginForm').reset();
    showToast('Sesión cerrada correctamente.');
}

// ============================================================
// RELOJ
// ============================================================
function updateClock() {
    const el = document.getElementById('liveClock');
    if (el) el.innerText = new Date().toLocaleTimeString('es-CR');
}
updateClock();
setInterval(updateClock, 1000);
window.addEventListener('load', () => {
    const loader = document.getElementById('curtain-loader');

    // Tiempo para que el usuario vea el nombre (1.5 segundos)
    setTimeout(() => {
        loader.classList.add('loader-finished');

        // Eliminamos el elemento por completo después de que termine la transición CSS
        setTimeout(() => {
            loader.classList.add('loader-none');
        }, 1200); // Este tiempo debe coincidir con el del CSS (1.2s)
    }, 1500);
});