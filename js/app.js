// js/app.js

// Estado Global
const state = {
    currency: 'PEN', // PEN o USD
    exchangeRate: 3.70, // Valor por defecto
    cart: JSON.parse(localStorage.getItem('tiznadita_cart')) || [],
    siteName: 'Tiznadita'
};

// Utilidades
const $ = (selector) => document.querySelector(selector);
const formatPrice = (priceInPen) => {
    const rate = state.currency === 'USD' ? state.exchangeRate : 1;
    const symbol = state.currency === 'USD' ? '$' : 'S/ ';
    const finalPrice = priceInPen / rate;
    return `${symbol}${finalPrice.toFixed(2)}`;
};

const saveCart = () => {
    localStorage.setItem('tiznadita_cart', JSON.stringify(state.cart));
    updateCartCount();
};

const updateCartCount = () => {
    const count = state.cart.reduce((acc, item) => acc + item.cantidad, 0);
    $('#cart-count').innerText = count;
};

// Router Simple
const routes = {
    'home': renderHome,
    'catalog': renderCatalog,
    'producto': renderProducto,
    'carrito': renderCarrito,
    'checkout': renderCheckout,
    'admin': renderAdmin
};

async function router() {
    const hash = window.location.hash.slice(2) || 'home'; // Remove #/
    const [route, param] = hash.split('/');
    
    const appDiv = $('#app');
    appDiv.innerHTML = '<div class="loader"><div class="spinner">🐰</div></div>'; // Loading spinner
    
    // Actualizar nombre del sitio desde settings o default
    const settings = await getSiteSettings();
    if(settings && settings.nombrePasteleria) {
        state.siteName = settings.nombrePasteleria;
        $('#site-name').innerText = state.siteName;
        document.title = `${state.siteName} - Postres`;
    }

    if (routes[route]) {
        try {
            await routes[route](param);
            AOS.refresh(); // Reiniciar animaciones
        } catch (error) {
            console.error(error);
            appDiv.innerHTML = `<h2>Ups, algo salió mal cargando ${route}</h2>`;
        }
    } else {
        window.location.hash = '#/home';
    }
}

// Listener de navegación
window.addEventListener('hashchange', router);
window.addEventListener('load', async () => {
    AOS.init({ duration: 800, once: true });
    await fetchExchangeRate();
    updateCartCount();
    router();
});

// Obtener tipo de cambio
async function fetchExchangeRate() {
    const cached = localStorage.getItem('exchangeRate');
    const timestamp = localStorage.getItem('exchangeRateTime');
    const now = Date.now();
    
    // Validez 6 horas (21600000 ms)
    if (cached && timestamp && (now - timestamp < 21600000)) {
        state.exchangeRate = parseFloat(cached);
        return;
    }

    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/PEN');
        const data = await res.json();
        const rate = data.rates.USD; // 1 PEN a USD
        if(rate) {
            state.exchangeRate = rate;
            localStorage.setItem('exchangeRate', rate);
            localStorage.setItem('exchangeRateTime', now);
        }
    } catch (e) {
        console.log("Usando tasa de cambio por defecto");
    }
}

// Helper para obtener settings (puede ser de Firebase o default)
async function getSiteSettings() {
    if(db) {
        try {
            const doc = await db.collection('configuracion').doc('siteSettings').get();
            if(doc.exists) return doc.data();
        } catch(e) {}
    }
    return { nombrePasteleria: 'Tiznadita' };
}