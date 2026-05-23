// js/admin.js

async function renderAdmin() {
    const appDiv = $('#app');
    
    // Verificar sesión
    const isLogged = sessionStorage.getItem('adminLogged') === 'true';
    
    if (!isLogged) {
        // Vista de Login
        appDiv.innerHTML = `
            <div style="max-width:400px; margin: 3rem auto; background:white; padding:2rem; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.1);" data-aos="fade-up">
                <h2 style="text-align:center;">Admin Tiznadita 🐰</h2>
                <form onsubmit="adminLogin(event)" style="margin-top:1.5rem;">
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="admin-pass" class="form-control" required>
                    </div>
                    <button type="submit" class="btn-primary">Ingresar</button>
                </form>
                <p id="login-error" style="color:red; text-align:center; margin-top:10px; display:none;">Contraseña incorrecta</p>
            </div>
        `;
        return;
    }

    // Panel Principal
    appDiv.innerHTML = `
        <div class="admin-panel" data-aos="fade-in">
            <aside class="admin-sidebar">
                <h3>Menú</h3>
                <div class="admin-menu-item active" onclick="switchAdminTab('config')">⚙️ Configuración Firebase</div>
                <div class="admin-menu-item" onclick="switchAdminTab('settings')">🏠 Ajustes Sitio</div>
                <div class="admin-menu-item" onclick="switchAdminTab('products')">🍰 Productos</div>
                <div class="admin-menu-item" onclick="switchAdminTab('orders')">📦 Pedidos</div>
                <div class="admin-menu-item" onclick="logout()" style="color:red;">Cerrar Sesión</div>
            </aside>
            <main class="admin-content" id="admin-tab-content">
                <!-- Contenido dinámico -->
            </main>
        </div>
    `;
    
    // Cargar pestaña por defecto
    switchAdminTab('config');
}

// Autenticación Simple
window.adminLogin = async (e) => {
    e.preventDefault();
    const passInput = $('#admin-pass').value;
    let validPass = 'tiznadita123'; // Default hardcodeado

    // Intentar obtener contraseña de Firebase si existe
    if(db) {
        try {
            const doc = await db.collection('configuracion').doc('siteSettings').get();
            if(doc.exists && doc.data().adminPassword) {
                validPass = doc.data().adminPassword;
            }
        } catch(err) { console.log("Error leyendo pass de FB"); }
    }

    if(passInput === validPass) {
        sessionStorage.setItem('adminLogged', 'true');
        router(); // Recargar vista
    } else {
        $('#login-error').style.display = 'block';
    }
};

window.logout = () => {
    sessionStorage.removeItem('adminLogged');
    router();
};

// Navegación de Pestañas Admin
window.switchAdminTab = async (tab) => {
    const contentDiv = $('#admin-tab-content');
    const menuItems = document.querySelectorAll('.admin-menu-item');
    menuItems.forEach(i => i.classList.remove('active'));
    // Nota: En una implementación real, seleccionaríamos el elemento clickeado específicamente
    
    if(tab === 'config') renderAdminConfig(contentDiv);
    if(tab === 'settings') await renderAdminSettings(contentDiv);
    if(tab === 'products') await renderAdminProducts(contentDiv);
    if(tab === 'orders') await renderAdminOrders(contentDiv);
};

// 1. Configuración Firebase
function renderAdminConfig(container) {
    const currentConfig = localStorage.getItem('firebaseConfig');
    container.innerHTML = `
        <h2>Configuración de Firebase</h2>
        <p>Introduce las credenciales de tu proyecto Firebase para activar la base de datos.</p>
        <form onsubmit="saveFirebaseConfig(event)" style="margin-top:1rem;">
            <div class="form-group"><label>API Key</label><input name="apiKey" class="form-control" value="${currentConfig ? JSON.parse(currentConfig).apiKey : ''}"></div>
            <div class="form-group"><label>Auth Domain</label><input name="authDomain" class="form-control" value="${currentConfig ? JSON.parse(currentConfig).authDomain : ''}"></div>
            <div class="form-group"><label>Project ID</label><input name="projectId" class="form-control" value="${currentConfig ? JSON.parse(currentConfig).projectId : ''}"></div>
            <div class="form-group"><label>Storage Bucket</label><input name="storageBucket" class="form-control" value="${currentConfig ? JSON.parse(currentConfig).storageBucket : ''}"></div>
            <div class="form-group"><label>Messaging Sender ID</label><input name="messagingSenderId" class="form-control" value="${currentConfig ? JSON.parse(currentConfig).messagingSenderId : ''}"></div>
            <div class="form-group"><label>App ID</label><input name="appId" class="form-control" value="${currentConfig ? JSON.parse(currentConfig).appId : ''}"></div>
            <button type="submit" class="btn-primary">Guardar y Reiniciar</button>
        </form>
        ${currentConfig ? '<button onclick="clearFirebaseConfig()" style="margin-top:10px; background:#ccc; border:none; padding:5px 10px; cursor:pointer;">Borrar Configuración</button>' : ''}
    `;
}

window.saveFirebaseConfig = (e) => {
    e.preventDefault();
    const form = e.target;
    const config = {
        apiKey: form.apiKey.value,
        authDomain: form.authDomain.value,
        projectId: form.projectId.value,
        storageBucket: form.storageBucket.value,
        messagingSenderId: form.messagingSenderId.value,
        appId: form.appId.value
    };
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
    alert("Configuración guardada. La página se recargará para conectar.");
    location.reload();
};

window.clearFirebaseConfig = () => {
    localStorage.removeItem('firebaseConfig');
    location.reload();
};

// 2. Ajustes del Sitio
async function renderAdminSettings(container) {
    let settings = { nombrePasteleria: 'Tiznadita', logoUrl: '', colorPrimario: '#FFB6C1', adminPassword: 'tiznadita123' };
    
    if(db) {
        const doc = await db.collection('configuracion').doc('siteSettings').get();
        if(doc.exists) settings = { ...settings, ...doc.data() };
    }

    container.innerHTML = `
        <h2>Ajustes del Sitio</h2>
        <form onsubmit="saveSiteSettings(event)">
            <div class="form-group"><label>Nombre Pastelería</label><input name="nombrePasteleria" class="form-control" value="${settings.nombrePasteleria}"></div>
            <div class="form-group"><label>URL Logo</label><input name="logoUrl" class="form-control" value="${settings.logoUrl || ''}"></div>
            <div class="form-group"><label>Color Primario</label><input type="color" name="colorPrimario" style="width:100%" value="${settings.colorPrimario}"></div>
            <div class="form-group"><label>Nueva Contraseña Admin</label><input name="adminPassword" class="form-control" placeholder="Dejar vacío para no cambiar"></div>
            <button type="submit" class="btn-primary">Guardar Cambios</button>
        </form>
    `;
}

window.saveSiteSettings = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        nombrePasteleria: form.nombrePasteleria.value,
        logoUrl: form.logoUrl.value,
        colorPrimario: form.colorPrimario.value
    };
    if(form.adminPassword.value) data.adminPassword = form.adminPassword.value;

    if(db) {
        await db.collection('configuracion').doc('siteSettings').set(data, { merge: true });
        alert("Guardado en Firestore");
    } else {
        // Guardar localmente para demo si no hay DB
        localStorage.setItem('siteSettingsDemo', JSON.stringify(data));
        alert("Guardado localmente (Modo Demo)");
    }
    // Actualizar variable global si cambia nombre
    if(data.nombrePasteleria) state.siteName = data.nombrePasteleria;
};

// 3. Gestión de Productos
async function renderAdminProducts(container) {
    const products = db ? (await db.collection('productos').get()).docs.map(d => ({id:d.id, ...d.data()})) : window.dummyProducts || [];
    
    let html = `
        <h2>Gestión de Productos</h2>
        <button class="btn-primary" style="width:auto; margin-bottom:1rem;" onclick="toggleProductForm()">+ Nuevo Producto</button>
        <div id="product-form" style="display:none; background:#f9f9f9; padding:1rem; margin-bottom:1rem; border:1px solid #ddd;">
            <form onsubmit="handleProductSubmit(event)">
                <input type="hidden" name="id">
                <div class="form-group"><label>Nombre</label><input name="nombre" class="form-control" required></div>
                <div class="form-group"><label>Precio (S/)</label><input type="number" step="0.01" name="precio" class="form-control" required></div>
                <div class="form-group"><label>Categoría</label><input name="categoria" class="form-control" required></div>
                <div class="form-group"><label>Descripción</label><textarea name="descripcion" class="form-control"></textarea></div>
                <div class="form-group"><label>Imagen URL</label><input name="imagenUrl" class="form-control" placeholder="https://..."></div>
                <div class="form-group"><label>O subir imagen</label><input type="file" id="prod-file"></div>
                <button type="submit" class="btn-primary">Guardar</button>
                <button type="button" onclick="toggleProductForm()" style="background:#ccc; border:none; padding:5px;">Cancelar</button>
            </form>
        </div>
        <table style="width:100%; text-align:left;">
            <thead><tr><th>Img</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
            <tbody>
                ${products.map(p => `
                    <tr style="border-bottom:1px solid #eee;">
                        <td><img src="${p.imagenUrl}" style="width:40px; height:40px; object-fit:cover;"></td>
                        <td>${p.nombre}</td>
                        <td>S/ ${p.precio}</td>
                        <td>
                            <button onclick="editProduct('${p.id}')" style="cursor:pointer;">✏️</button>
                            <button onclick="deleteProduct('${p.id}')" style="cursor:pointer; color:red;">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

window.toggleProductForm = () => {
    const form = $('#product-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if(form.style.display === 'block') form.querySelector('form').reset();
};

window.handleProductSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fileInput = $('#prod-file');
    
    let imageUrl = form.imagenUrl.value;
    
    // Subir a Storage si hay archivo
    if(db && fileInput.files[0]) {
        const file = fileInput.files[0];
        const ref = storage.ref(`productos/${Date.now()}_${file.name}`);
        try {
            await ref.put(file);
            imageUrl = await ref.getDownloadURL();
        } catch(err) {
            alert("Error subiendo imagen");
            return;
        }
    } else if (!imageUrl) {
        imageUrl = 'https://via.placeholder.com/300?text=Sin+Imagen';
    }

    const data = {
        nombre: form.nombre.value,
        precio: parseFloat(form.precio.value),
        categoria: form.categoria.value,
        descripcion: form.descripcion.value,
        imagenUrl: imageUrl,
        destacado: false
    };

    if(db) {
        if(form.id.value) {
            await db.collection('productos').doc(form.id.value).update(data);
        } else {
            await db.collection('productos').add(data);
        }
    } else {
        alert("Producto guardado (Simulado en memoria)");
        // En modo demo no persiste realmente sin recargar el array dummy
    }
    
    renderAdminProducts($('#admin-tab-content'));
};

window.deleteProduct = async (id) => {
    if(confirm('¿Eliminar producto?')) {
        if(db) await db.collection('productos').doc(id).delete();
        renderAdminProducts($('#admin-tab-content'));
    }
};

// 4. Pedidos
async function renderAdminOrders(container) {
    let orders = [];
    if(db) {
        const snap = await db.collection('pedidos').orderBy('fecha', 'desc').get();
        orders = snap.docs.map(d => ({id:d.id, ...d.data()}));
    } else {
        orders = []; // En demo no hay pedidos persistentes
    }

    container.innerHTML = `
        <h2>Pedidos Recibidos</h2>
        ${orders.length === 0 ? '<p>No hay pedidos aún.</p>' : ''}
        <div style="display:grid; gap:1rem;">
            ${orders.map(o => `
                <div style="border:1px solid #ddd; padding:1rem; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>#${o.id.substr(0,5)} - ${o.cliente.nombre}</strong>
                        <span style="background:${o.estado==='pendiente'?'orange':'green'}; color:white; padding:2px 8px; border-radius:4px;">${o.estado}</span>
                    </div>
                    <p>Tel: ${o.cliente.telefono} | Dir: ${o.cliente.direccion}</p>
                    <ul>${o.items.map(i => `<li>${i.cantidad} x ${i.nombre}</li>`).join('')}</ul>
                    <p><strong>Total: S/ ${o.total.toFixed(2)}</strong></p>
                    ${o.estado === 'pendiente' ? `<button onclick="completeOrder('${o.id}')" class="btn-primary" style="width:auto; padding:5px 10px; font-size:0.8rem;">Marcar Completado</button>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

window.completeOrder = async (id) => {
    if(db) {
        await db.collection('pedidos').doc(id).update({ estado: 'completado' });
        renderAdminOrders($('#admin-tab-content'));
    }
};