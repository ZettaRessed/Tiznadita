// js/publico.js

// Datos de ejemplo (Fallback)
const dummyProducts = [
    { id: '1', nombre: 'Torta Tres Leches', descripcion: 'Esponjosa y húmeda.', precio: 45.00, categoria: 'Tortas', imagenUrl: 'https://via.placeholder.com/300x200/FFD1DC/555?text=Tres+Leches', destacado: true },
    { id: '2', nombre: 'Merengue Francés', descripcion: 'Crujiente por fuera, suave por dentro.', precio: 35.00, categoria: 'Tortas', imagenUrl: 'https://via.placeholder.com/300x200/FFF0F5/555?text=Merengue', destacado: true },
    { id: '3', nombre: 'Mousse Maracuyá', descripcion: 'Fresco y tropical.', precio: 15.00, categoria: 'Postres', imagenUrl: 'https://via.placeholder.com/300x200/E6E6FA/555?text=Mousse', destacado: false },
    { id: '4', nombre: 'Flan de Caramelo', descripcion: 'El clásico irresistible.', precio: 12.00, categoria: 'Postres', imagenUrl: 'https://via.placeholder.com/300x200/FFDAB9/555?text=Flan', destacado: false },
    { id: '5', nombre: 'Cheesecake Fresa', descripcion: 'Base crujiente y crema suave.', precio: 18.00, categoria: 'Postres', imagenUrl: 'https://via.placeholder.com/300x200/FFB6C1/555?text=Cheesecake', destacado: true },
    { id: '6', nombre: 'Torta Helada', descripcion: 'Ideal para días calurosos.', precio: 50.00, categoria: 'Tortas', imagenUrl: 'https://via.placeholder.com/300x200/B0E0E6/555?text=Helada', destacado: false }
];

// Función para obtener productos (Firebase o Dummy)
async function getProducts() {
    if (db) {
        const snapshot = await db.collection('productos').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return dummyProducts;
}

// --- VISTAS ---

async function renderHome() {
    const products = await getProducts();
    const destacados = products.filter(p => p.destacado).slice(0, 4);
    
    let html = `
        <section class="hero" data-aos="fade-up" style="text-align:center; padding: 3rem 0;">
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Bienvenido a ${state.siteName} 🐰</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">Los postres más tiernos, directos a tu puerta.</p>
            <a href="#/catalog" class="btn-primary" style="display:inline-block; width:auto; text-decoration:none;">Ver Catálogo</a>
        </section>

        <h3 style="margin: 2rem 0 1rem;">Destacados del Mes</h3>
        <div class="products-grid">
            ${destacados.map(p => createProductCard(p)).join('')}
        </div>

        <section style="margin-top: 4rem; background: var(--soft-pink); padding: 2rem; border-radius: 15px;" data-aos="zoom-in">
            <h3>Lo que dicen nuestros clientes</h3>
            <p><i>"La torta tres leches estaba increíble, súper húmeda." - María G.</i></p>
            <p><i>"Llegó rápido y el empaque es precioso." - Carlos R.</i></p>
        </section>
    `;
    $('#app').innerHTML = html;
}

async function renderCatalog() {
    const products = await getProducts();
    
    // Filtros simples (en una app real se haría más complejo)
    const categorias = [...new Set(products.map(p => p.categoria))];
    
    let html = `
        <h2 data-aos="fade-down">Nuestro Catálogo</h2>
        <div style="margin: 1rem 0;">
            <input type="text" id="search-input" placeholder="Buscar postre..." class="form-control" onkeyup="filtrarProductos()">
        </div>
        <div class="products-grid" id="catalog-grid">
            ${products.map(p => createProductCard(p)).join('')}
        </div>
    `;
    $('#app').innerHTML = html;
}

// Función global para filtrar (necesaria porque el HTML se genera dinámicamente)
window.filtrarProductos = () => {
    const term = $('#search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const name = card.querySelector('h4').innerText.toLowerCase();
        card.style.display = name.includes(term) ? 'block' : 'none';
    });
};

function createProductCard(product) {
    return `
        <div class="product-card" data-aos="fade-up" onclick="window.location.hash='#/producto/${product.id}'">
            <img src="${product.imagenUrl}" alt="${product.nombre}" class="product-img">
            <div class="product-info">
                <h4>${product.nombre}</h4>
                <p style="color: var(--deep-pink); font-weight: bold;">${formatPrice(product.precio)}</p>
                <button class="btn-add" onclick="event.stopPropagation(); addToCart('${product.id}', '${product.nombre}', ${product.precio}, '${product.imagenUrl}')">Añadir 🛒</button>
            </div>
        </div>
    `;
}

async function renderProducto(id) {
    const products = await getProducts();
    const product = products.find(p => p.id === id);
    
    if(!product) { $('#app').innerHTML = '<h2>Producto no encontrado</h2>'; return; }

    let html = `
        <div style="display:flex; flex-wrap:wrap; gap: 2rem;" data-aos="fade-right">
            <div style="flex:1; min-width:300px;">
                <img src="${product.imagenUrl}" style="width:100%; border-radius:15px;">
            </div>
            <div style="flex:1; min-width:300px;">
                <h2>${product.nombre}</h2>
                <p style="font-size:1.5rem; color:var(--deep-pink); margin:1rem 0;">${formatPrice(product.precio)}</p>
                <p>${product.descripcion}</p>
                <div style="margin: 2rem 0;">
                    <label>Cantidad:</label>
                    <input type="number" id="prod-qty" value="1" min="1" style="width:60px; padding:5px;">
                </div>
                <button class="btn-primary" style="width:auto; padding: 10px 30px;" 
                    onclick="addToCart('${product.id}', '${product.nombre}', ${product.precio}, '${product.imagenUrl}', parseInt($('#prod-qty').value))">
                    Añadir al Carrito
                </button>
            </div>
        </div>
    `;
    $('#app').innerHTML = html;
}

// Lógica del Carrito
window.addToCart = (id, nombre, precio, img, qty = 1) => {
    const existing = state.cart.find(item => item.id === id);
    if(existing) {
        existing.cantidad += qty;
    } else {
        state.cart.push({ id, nombre, precio, imagenUrl: img, cantidad: qty });
    }
    saveCart();
    alert('¡Añadido al carrito! 🍰');
};

function renderCarrito() {
    if(state.cart.length === 0) {
        $('#app').innerHTML = '<h2>Tu carrito está vacío 🐰</h2><br><a href="#/catalog" class="btn-primary">Ir al catálogo</a>';
        return;
    }

    const totalPen = state.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    let html = `
        <h2>Tu Carrito</h2>
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; margin: 1rem 0;">
                <thead>
                    <tr style="background:var(--soft-pink); text-align:left;">
                        <th style="padding:10px;">Producto</th>
                        <th>Precio</th>
                        <th>Cant.</th>
                        <th>Subtotal</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.cart.map(item => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px; display:flex; align-items:center; gap:10px;">
                                <img src="${item.imagenUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                                ${item.nombre}
                            </td>
                            <td>${formatPrice(item.precio)}</td>
                            <td>
                                <button onclick="updateQty('${item.id}', -1)">-</button>
                                ${item.cantidad}
                                <button onclick="updateQty('${item.id}', 1)">+</button>
                            </td>
                            <td>${formatPrice(item.precio * item.cantidad)}</td>
                            <td><button onclick="removeFromCart('${item.id}')" style="color:red; border:none; background:none; cursor:pointer;">🗑️</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="text-align:right; margin-top:2rem;">
            <h3>Total: ${formatPrice(totalPen)}</h3>
            <button class="btn-primary" style="width:auto; margin-top:1rem;" onclick="window.location.hash='#/checkout'">Realizar Pedido</button>
        </div>
    `;
    $('#app').innerHTML = html;
}

window.updateQty = (id, delta) => {
    const item = state.cart.find(i => i.id === id);
    if(item) {
        item.cantidad += delta;
        if(item.cantidad <= 0) removeFromCart(id);
        else saveCart();
        renderCarrito(); // Re-render para actualizar vista
    }
};

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(i => i.id !== id);
    saveCart();
    renderCarrito();
};

// Checkout
function renderCheckout() {
    if(state.cart.length === 0) { window.location.hash = '#/carrito'; return; }
    
    const totalPen = state.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    let html = `
        <h2>Finalizar Compra</h2>
        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:1rem;">
            <div style="flex:1; min-width:300px;">
                <form id="checkout-form" onsubmit="submitOrder(event)">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" name="nombre" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" name="telefono" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Dirección de Entrega</label>
                        <textarea name="direccion" required class="form-control"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Notas Adicionales</label>
                        <textarea name="notas" class="form-control"></textarea>
                    </div>
                    <button type="submit" class="btn-primary">Confirmar Pedido</button>
                </form>
            </div>
            <div style="flex:1; min-width:300px; background:var(--soft-pink); padding:1.5rem; border-radius:10px;">
                <h3>Resumen</h3>
                <ul style="list-style:none; margin:1rem 0;">
                    ${state.cart.map(i => `<li>${i.cantidad} x ${i.nombre}</li>`).join('')}
                </ul>
                <hr>
                <h4>Total a Pagar: ${formatPrice(totalPen)}</h4>
            </div>
        </div>
    `;
    $('#app').innerHTML = html;
}

window.submitOrder = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const orderData = {
        cliente: {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion')
        },
        items: state.cart,
        total: state.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0),
        notas: formData.get('notas'),
        estado: 'pendiente',
        fecha: new Date()
    };

    try {
        if(db) {
            await db.collection('pedidos').add(orderData);
        } else {
            // Simulación offline
            console.log("Pedido guardado (simulado):", orderData);
            alert("¡Pedido recibido! (Modo Demo)");
        }
        
        state.cart = [];
        saveCart();
        $('#app').innerHTML = `
            <div style="text-align:center; padding:3rem;" data-aos="zoom-in">
                <h1 style="font-size:4rem;">🎉</h1>
                <h2>¡Gracias por tu compra!</h2>
                <p>Tu pedido ha sido registrado correctamente.</p>
                <a href="#/home" class="btn-primary" style="display:inline-block; width:auto; margin-top:1rem; text-decoration:none;">Volver al Inicio</a>
            </div>
        `;
    } catch (error) {
        console.error(error);
        alert("Hubo un error al procesar tu pedido.");
    }
};