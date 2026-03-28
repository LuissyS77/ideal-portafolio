# 🌟 Portafolio Ideal — Guía de uso y deploy

## Estructura del proyecto

```
ideal-portfolio/
├── index.html          ← Página principal
├── styles.css          ← Todos los estilos
├── products.js         ← Mock de productos (datos)
├── main.js             ← Lógica JS (menú, filtros, animaciones)
└── images/
    ├── hero-products.png   ← Imagen del hero (portada)
    ├── profile.jpg         ← Foto de tu mamá
    └── products/
        ├── limpiapisos.jpg
        ├── desengrasante.jpg
        ├── jabon-polvo.jpg
        ├── jabon-menta.jpg
        ├── shampoo.jpg
        ├── crema-aloe.jpg
        ├── desodorante.jpg
        └── kit-familia.jpg
```

> **Nota:** Si una imagen no existe, la web muestra un emoji como placeholder automáticamente. No hay errores rotos.

---

## ✏️ Cosas que debes personalizar

### 1. Datos de tu mamá (`index.html`)
- Busca `[Nombre de tu mamá]` y reemplaza con su nombre real
- En la sección About, edita los párrafos de descripción
- En la sección "Sobre mí", ajusta los años de experiencia en `.about__stat-card`

### 2. Número de WhatsApp (`products.js`)
```js
const WHATSAPP_NUMBER = "573001234567";
// Cambia por el número real (con código de país, sin +)
// Ejemplo Colombia: 573101234567
```

### 3. Redes sociales (`index.html`)
Busca y reemplaza:
- `https://wa.me/573001234567` → tu número real
- `https://instagram.com/ideal_distribuidora` → tu Instagram
- `https://facebook.com/idealdistribuidora` → tu Facebook
- `@ideal_distribuidora` → tu @

### 4. Productos (`products.js`)
Cada producto tiene esta estructura:
```js
{
  id: 1,
  name: "Nombre del producto",
  category: "limpieza",     // limpieza | aseo | cuidado
  categoryLabel: "Limpieza",
  emoji: "🧴",               // Se muestra si no hay imagen
  price: "$12.900",
  description: "Descripción corta del producto.",
  image: "images/products/nombre-foto.jpg",
  badge: "Favorito",        // o null si no quieres badge
}
```

### 5. Imágenes
- Crea la carpeta `images/` y dentro `images/products/`
- Agrega las fotos con los nombres que pusiste en `products.js`
- Formatos recomendados: `.jpg` o `.webp`
- Tamaño recomendado: 600×600px para productos, 800×1000px para perfil

---

## 🚀 Deploy en Render (Web estática)

1. Sube todo el proyecto a un repositorio en **GitHub**
2. Ve a [render.com](https://render.com) y crea una cuenta gratuita
3. Haz clic en **"New +"** → **"Static Site"**
4. Conecta tu repositorio de GitHub
5. Configura:
   - **Name:** ideal-portfolio (o el nombre que quieras)
   - **Branch:** main
   - **Build Command:** *(dejar vacío)*
   - **Publish Directory:** `.` *(un punto, que significa la raíz)*
6. Haz clic en **"Create Static Site"**
7. ¡Listo! Render te dará una URL tipo `https://ideal-portfolio.onrender.com`

---

## 💡 Tips

- **Sin build steps:** Al ser HTML puro, no necesitas `npm install` ni nada. Solo subir los archivos.
- **Imágenes grandes:** Si las fotos pesan mucho, comprime en [squoosh.app](https://squoosh.app) antes de subir.
- **Dominio propio:** Render permite conectar un dominio personalizado gratis en el plan gratuito.
