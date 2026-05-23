// js/firebase.js

let db = null;
let storage = null;
let app = null;

function inicializarFirebase() {
    const configStr = localStorage.getItem('firebaseConfig');
    
    if (!configStr) {
        console.log("No hay configuración de Firebase. Modo offline/demo.");
        return null;
    }

    try {
        const config = JSON.parse(configStr);
        
        // Inicializar App si no existe
        if (!firebase.apps.length) {
            app = firebase.initializeApp(config);
        } else {
            app = firebase.app();
        }

        db = firebase.firestore();
        storage = firebase.storage();
        
        console.log("Firebase inicializado correctamente");
        return { db, storage };
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        localStorage.removeItem('firebaseConfig'); // Limpiar si está corrupto
        return null;
    }
}

// Ejecutar intento de conexión al cargar
inicializarFirebase();