window.abrirCortina = function() {
    const loader = document.getElementById('curtain-loader');
    if (!loader) return;

    loader.classList.remove('loader-none');
    setTimeout(() => {
        loader.classList.add('loader-finished');
        setTimeout(() => {
            loader.classList.add('loader-none');
        }, 1200);
    }, 500);
};

window.cerrarCortina = function() {
    const loader = document.getElementById('curtain-loader');
    if (!loader) return;

    loader.classList.remove('loader-none');
    loader.offsetHeight;
    loader.classList.remove('loader-finished');
};

document.addEventListener('DOMContentLoaded', window.abrirCortina);