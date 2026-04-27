// js/inicio.js

// Función para ABRIR la cortina (De centro hacia afuera)
window.abrirCortina = function() {
    const loader = document.getElementById('curtain-loader');
    if (!loader) return;

    loader.classList.remove('loader-none');
    // Pequeño delay para que el navegador procese el render
    setTimeout(() => {
        loader.classList.add('loader-finished');
        // Quitamos el display después de la animación (1.2s)
        setTimeout(() => {
            loader.classList.add('loader-none');
        }, 1200);
    }, 500);
};

// Función para CERRAR la cortina (De afuera hacia el centro)
window.cerrarCortina = function() {
    const loader = document.getElementById('curtain-loader');
    if (!loader) return;

    loader.classList.remove('loader-none');
    // Forzamos un reflow para que el CSS reinicie la posición
    loader.offsetHeight;
    loader.classList.remove('loader-finished');
};

// Se ejecuta solo al cargar la página por primera vez
document.addEventListener('DOMContentLoaded', window.abrirCortina);