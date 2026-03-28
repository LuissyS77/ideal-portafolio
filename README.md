# 🌟 Portafolio — Zulimar Suárez · Distribuidora Ideal

Sitio web estático de portafolio y catálogo de productos para **Zulimar Suárez**, distribuidora oficial de **Ideal**, empresa de productos de limpieza, aseo personal y cuidado del hogar.

🔗 **Sitio en producción:** [https://ideal-portafolio.onrender.com](https://ideal-portafolio.onrender.com)

---

## 📋 Descripción

Página web de una sola página (SPA-like) que permite a los visitantes:

- Conocer a la distribuidora y su propuesta de valor
- Explorar el catálogo de productos con filtros por categoría
- Contactar directamente por WhatsApp para hacer pedidos
- Unirse al emprendimiento como distribuidor/a

---

## 🗂️ Estructura del proyecto

```
ideal-portafolio/
├── index.html        ← Estructura principal de la página
├── styles.css        ← Todos los estilos y diseño responsive
├── products.js       ← Mock de productos (datos del catálogo)
├── main.js           ← Lógica JS: menú, filtros, animaciones
└── img/
    ├── zulimar-foto.jpg
    ├── acondicionador.png
    ├── alisado-organico.jpeg
    ├── gel-arnica.jpeg
    ├── jabon-azufre.jpeg
    ├── jabon-glicerina.jpeg
    ├── jabon-intimo.jpeg
    ├── kit-limpieza.jpeg
    ├── protector-solar.jpeg
    └── shampoo-kids.jpeg
```

---

## 🛍️ Catálogo de productos

| # | Producto | Categoría | Precio |
|---|---|---|---|
| 1 | Kit de Higiene | Aseo personal | $12,5 |
| 2 | Kit de Limpieza | Limpieza | $12,5 |
| 3 | Jabón de Azufre | Cuidado personal | $5 |
| 4 | Jabón de Glicerina | Cuidado personal | $5 |
| 5 | Acondicionador | Aseo personal | $8,5 |
| 6 | Champú de Niño | Aseo personal | $8,5 |
| 7 | Gel de Árnica | Cuidado personal | $9 |
| 8 | Protector Solar | Cuidado personal | $10 |
| 9 | Lavaplatos en Crema | Limpieza | $5 |
| 10 | Alisado Orgánico | Cuidado personal | $20 |
| 11 | Jabón Íntimo | Aseo personal | $9 |

---

## ✏️ Cómo actualizar el catálogo

Edita el archivo `products.js`. Cada producto tiene esta estructura:

```js
{
  id: 1,
  name: "Nombre del producto",
  category: "limpieza",      // limpieza | aseo | cuidado
  categoryLabel: "Limpieza",
  emoji: "🧹",               // Se muestra si no hay imagen
  price: "$12,5",
  description: "Descripción corta.",
  image: "img/nombre-foto.jpg", // ruta local o URL externa
  badge: "Nuevo",            // texto del badge o null
}
```

Para cambiar el número de WhatsApp:

```js
const WHATSAPP_NUMBER = "573001234567"; // sin + ni espacios
```

---

## 🚀 Correr localmente

No se necesita ningún servidor ni dependencias. Solo:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/LuissyS77/ideal-portafolio.git
   cd ideal-portafolio
   ```

2. Abre `index.html` con la extensión **Live Server** de VS Code
   - Clic derecho sobre `index.html` → **"Open with Live Server"**
   - Se abre en `http://127.0.0.1:5500`

---

## ☁️ Deploy en Render

El sitio se despliega automáticamente en [Render](https://render.com) como **Static Site**.

| Campo | Valor |
|---|---|
| Build Command | *(vacío)* |
| Publish Directory | `.` |
| Branch | `main` |

Cada `git push` a `main` redespliega el sitio automáticamente.

---

## 🛠️ Tecnologías

- **HTML5** — Estructura semántica
- **CSS3** — Variables CSS, Flexbox, Grid, animaciones
- **JavaScript vanilla** — Sin frameworks ni dependencias
- **Google Fonts** — Playfair Display + DM Sans
- **Render** — Hosting estático gratuito

---

## 📁 Reglas para las imágenes

Para evitar errores en producción (Linux distingue mayúsculas):

- ✅ Nombres en minúsculas: `jabon-azufre.jpeg`
- ✅ Sin espacios: `kit-limpieza.jpeg`
- ✅ Rutas sin `/` al inicio ni `./`: `img/nombre.jpeg`
- ❌ `Jabon Azufre.JPEG` → no funciona en servidor

---

## 👩 Contacto

**Zulimar Suárez** — Distribuidora Oficial Ideal  