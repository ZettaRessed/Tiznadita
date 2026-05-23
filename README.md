# Tiznadita - Postres a Domicilio

SPA (Single Page Application) para venta de postres, construida con HTML, CSS y JS Vanilla.

## Características
- Diseño responsive y estética pastel.
- Carrito de compras con persistencia en LocalStorage.
- Panel de administración protegido.
- Integración opcional con Firebase (Firestore y Storage).
- Conversión de moneda Soles/Dólares.

## Despliegue en Netlify (Temporal)
1. Sube este repositorio a GitHub.
2. Ve a Netlify > "Add new site" > "Import an existing project".
3. Conecta tu repo de GitHub.
4. **Build command**: Déjalo vacío.
5. **Publish directory**: Déjalo como `/` (o escribe `.`).
6. Click en "Deploy".

## Migración a Firebase Hosting
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa el proyecto en la carpeta raíz: `firebase init hosting`
   - Selecciona "Use an existing project".
   - Public directory: `.` (punto, ya que index.html está en la raíz).
   - Configure as single-page app: `Yes`.
4. Despliega: `firebase deploy`

## Configuración Inicial (Primer Uso)
1. Abre la web y ve a la sección **Admin** (enlace en el header).
2. Contraseña por defecto: `tiznadita123`.
3. Ve a la pestaña **Configuración Firebase**.
4. Copia y pega las credenciales de tu proyecto Firebase Console.
5. Guarda. La página se recargará y comenzará a usar la base de datos real.