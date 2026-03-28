// =============================================
// MOCK DE PRODUCTOS — IDEAL 2026
// Para agregar imágenes: reemplaza la URL en
// el campo "image" de cada producto.
// Puedes usar una URL de internet o una ruta
// local como "images/products/nombre.jpg"
// =============================================

const products = [
  {
    id: 1,
    name: "Kit de Higiene",
    category: "aseo",
    categoryLabel: "Aseo personal",
    emoji: "🧴",
    price: "$12,5",
    description: "Kit completo de higiene personal, ideal para el cuidado diario de toda la familia.",
    image: "https://conecaideal.com/wp-content/uploads/2023/05/1v2.png",
    badge: "Kit",
  },
  {
    id: 2,
    name: "Kit de Limpieza",
    category: "limpieza",
    categoryLabel: "Limpieza",
    emoji: "🧹",
    price: "$12,5",
    description: "Kit esencial para mantener tu hogar limpio y desinfectado con los mejores productos.",
    image: "https://conecaideal.com/wp-content/uploads/2023/05/2.png",
    badge: "Kit",
  },
  {
    id: 3,
    name: "Jabón de Azufre",
    category: "cuidado",
    categoryLabel: "Cuidado personal",
    emoji: "🧼",
    price: "$5",
    description: "Jabón de azufre con propiedades purificantes, ideal para piel grasa y con impurezas.",
    image: "img/jabon-azufre.jpeg",
    badge: null,
  },
  {
    id: 4,
    name: "Jabón de Glicerina",
    category: "cuidado",
    categoryLabel: "Cuidado personal",
    emoji: "🫧",
    price: "$5",
    description: "Jabón suave con glicerina, hidrata y protege la piel en cada lavado.",
    image: "img/jabon-glicerina.jpeg",
    badge: null,
  },
  {
    id: 5,
    name: "Acondicionador",
    category: "aseo",
    categoryLabel: "Aseo personal",
    emoji: "💆",
    price: "$8,5",
    description: "Acondicionador nutritivo para cabello suave, brillante y fácil de peinar.",
    image: "img/acondicionador.png",
    badge: null,
  },
  {
    id: 6,
    name: "Champú de Niño",
    category: "aseo",
    categoryLabel: "Aseo personal",
    emoji: "👶",
    price: "$8,5",
    description: "Fórmula suave sin lágrimas, especialmente diseñada para el cabello de los más pequeños.",
    image: "./img/shampoo-kids.jpeg",
    badge: "Bebés",
  },
  {
    id: 7,
    name: "Gel de Árnica",
    category: "cuidado",
    categoryLabel: "Cuidado personal",
    emoji: "🌿",
    price: "$9",
    description: "Gel con extracto de árnica, alivia golpes, contusiones y dolores musculares.",
    image: "img/gel-arnica.jpeg",
    badge: null,
  },
  {
    id: 8,
    name: "Protector Solar",
    category: "cuidado",
    categoryLabel: "Cuidado personal",
    emoji: "☀️",
    price: "$10",
    description: "Protección solar de amplio espectro para el cuidado diario de tu piel bajo el sol.",
    image: "/img/protector-solar.jpeg",
    badge: "Nuevo",
  },
  {
    id: 9,
    name: "Lavaplatos en Crema",
    category: "limpieza",
    categoryLabel: "Limpieza",
    emoji: "🍽️",
    price: "$5",
    description: "Crema lavaplatos de alta eficacia, elimina grasa y deja tus utensilios impecables.",
    image: "https://conecaideal.com/wp-content/uploads/2023/03/shampoo-ideal-4-1372x2048.jpg",
    badge: null,
  },
  {
    id: 10,
    name: "Alisado Orgánico",
    category: "cuidado",
    categoryLabel: "Cuidado personal",
    emoji: "✨",
    price: "$20",
    description: "Tratamiento alisador con ingredientes orgánicos para un cabello liso, sano y brillante.",
    image: "img/alisado-organico.jpeg",
    badge: "Premium",
  },
  {
    id: 11,
    name: "Jabón Íntimo",
    category: "aseo",
    categoryLabel: "Aseo personal",
    emoji: "🌸",
    price: "$9",
    description: "Jabón íntimo con pH balanceado, fórmula suave para una higiene segura y delicada.",
    image: "img/jabon-intimo.jpeg",
    badge: null,
  },
];

// ─────────────────────────────────────────────
// Número de WhatsApp de tu mamá
// Cambia por el número real (con código de país, sin + ni espacios)
// Ejemplo Colombia: 573101234567
// ─────────────────────────────────────────────
const WHATSAPP_NUMBER = "573001234567";

function getWhatsAppLink(productName) {
  const msg = encodeURIComponent(
    `¡Hola! Estoy interesado/a en el producto *${productName}*. ¿Me podrías dar más información? 😊`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}