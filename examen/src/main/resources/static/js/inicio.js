// Función para activar la animación de la cortina
function ejecutarPortada() {
    const loader = document.getElementById('curtain-loader');

    // Reset en caso de que tuviera las clases (para reutilizarla)
    loader.classList.remove('loader-finished', 'loader-none');

    // 1. Tiempo para que el usuario vea el nombre
    setTimeout(() => {
        loader.classList.add('loader-finished');

        // 2. Quitamos el display none después de la transición (1.2s)
        setTimeout(() => {
            loader.classList.add('loader-none');
        }, 1200);
    }, 1500);
}

// Se ejecuta automáticamente al cargar la ventana
window.addEventListener('load', ejecutarPortada);