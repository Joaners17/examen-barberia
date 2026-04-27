// js/inicio.js

window.ejecutarPortada = function() {
    const loader = document.getElementById('curtain-loader');

    // Quitamos las clases de cierre para que vuelva a aparecer
    loader.classList.remove('loader-finished', 'loader-none');

    // Reiniciamos la animación de la línea (opcional)
    const line = loader.querySelector('.shave-line');
    if(line) {
        line.style.animation = 'none';
        line.offsetHeight; // Truco para reiniciar animación
        line.style.animation = null;
    }

    setTimeout(() => {
        loader.classList.add('loader-finished');
        setTimeout(() => {
            loader.classList.add('loader-none');
        }, 1200);
    }, 1500);
};

// Auto-ejecución al cargar la web por primera vez
document.addEventListener('DOMContentLoaded', window.ejecutarPortada);EventListener('load', ejecutarPortada);