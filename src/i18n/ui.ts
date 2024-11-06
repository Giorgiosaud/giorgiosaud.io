import * as esTranslations from "./locales/es";
import * as enTranslations from "./locales/es";

export const languages=[
  {
    name:"English",
    code:"en",
    path:'/'
  },
  {
    name:"Español",
    code:"es",
    path:'/es'
  }
] as const;
export const showDefaultLang = false as const;

export const defaultLang = "en" as const;
export const routes = {
  notebook:{
    es:"cuaderno",
    en: "notebook",
  },
  about:{
    es:"acerca-de-mi",
    en: "about",
  },
  contact:{
    es:"contactame",
    en: "contact",
  },
  portfolio:{
    es:"mi-portfolio",
    en: "portfolio",
  },
} as const;
export const ui = {
  en: {
    ...enTranslations,
    "nav.home": "Home",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.title": "Notebook",
    "nav.lang": "Languages",
    "nav.twitter": "Twitter",
    "hero.title": "My web developer notebook",
    "hero.description":
      "This website is made with Astro and based on an Astroship theme, but it is a simple place to take my mental notes and remember my investigations because it is very difficult for me to keep focus on web surfing, and I need a place to concentrate on the good things.",
    "hero.notebook": "My notebook",
    "hero.githubProfileButton": "My Github Profile",
    "hero.imageAlt": "Astronaut in the air",
    "features.title": "Topics to talk in this notebook",
    "features.1.title": "Front end Tools/Frameworks",
    "features.description":
      "All the topics related with web development like frontend or backend frameworks, pretending to be the most agnostic and imparcial as possible.",
    "features.1.description":
      "Although I have a deep appreciation for vanilla JavaScript, I will provide comparisons of various frontend frameworks I've used, from the elegant to the less appealing.",
    "features.2.title": "Code Design patterns",
    "features.2.description":
      "I will simplify and explain various design patterns and issues I've resolved in my roles as a Frontend Developer, Architect, and Solution Architect.",
    "features.3.title": "Code Snippets",
    "features.3.description":
      "I'll share useful gists and code snippets, including GitHub calls, to simplify both your life and mine, saving time and money in the process.",
    "features.4.title": "Integration issues",
    "features.4.description":
      "I'll address common issues I've encountered while integrating various systems and libraries, providing solutions and insights.",
    "features.5.title": "SEO Things",
    "features.5.description":
      "We will be explaining some basic technical SEO implementations an dismitifyng some old SEO techniques with a touch of reality but knowing the obscure side of the SEO moon.",
    "features.6.title": "Community",
    "features.6.description":
      "My main idea is to make a community that helps each other to resolve some issues or just to share some knowledge, so i will try to make some posts about how to make a community and how to make it grow.",
    "logos.title": "Some technologies that i had used before",
    "cta.description": "A day without learning is a lost day.",
    "contact.name.error": "Please provide your full name.",
    "contact.name.placeholder": "Full Name",
    "contact.email.placeholder": "Email Address",
    "contact.email.error": "Please provide your email.",
    "contact.message.placeholder": "Your Message",
    "contact.message.error": "Please provide your message.",
    "contact.submit": "Send Message",
  },
  es: {
    ...esTranslations,
    "nav.home": "Inicio",
    "nav.about": "Acerca de mi",
    "nav.twitter": "Twitter",
    "nav.contact": "Contáctame",
    "nav.title": "Cuaderno",
    "nav.lang": "Idiomas",
    "hero.title": "Mi cuaderno de desarrollo web",
    "hero.description":
      "Este sitio web está hecho con Astro y basado en un tema de Astroship, pero es un lugar simple para tomar mis notas mentales y recordar mis investigaciones porque me resulta muy difícil mantenerme concentrado en la navegación web, y necesito un lugar para concentrarme en las cosas buenas.",
    "hero.notebook": "Mi cuaderno",
    "hero.githubProfileButton": "Mi perfil de Github",
    "hero.imageAlt": "Astronauta en el aire",
    "features.title": "Temas a tratar en este cuaderno",
    "features.description":
      "Todos los temas relacionados con el desarrollo web como frameworks frontend o backend, pretendiendo ser lo más agnóstico e imparcial posible.",
    "feature.1.title": "Herramientas/Frameworks de Front",
    "features.1.description":
      "Aunque tengo un profundo aprecio por JavaScript vanilla, proporcionaré comparaciones de varios frameworks frontend que he usado, desde los más elegantes hasta los menos atractivos.",
    "features.2.title": "Patrones de diseño de código",
    "features.2.description":
      "Simplificaré y explicaré varios patrones de diseño y problemas que he resuelto en mis roles como Desarrollador Frontend, Arquitecto y Arquitecto de Soluciones.",
    "features.3.title": "Fragmentos de código",
    "features.3.description":
      "Compartiré gists útiles y fragmentos de código, incluidas llamadas a GitHub, para simplificar tanto tu vida como la mía, ahorrando tiempo y dinero en el proceso.",
    "features.4.title": "Problemas de integración",
    "features.4.description":
      "Abordaré problemas comunes que he encontrado al integrar varios sistemas y bibliotecas, proporcionando soluciones e ideas.",
    "features.5.title": "Cosas de SEO",
    "features.5.description":
      "Explicaremos algunas implementaciones técnicas básicas de SEO y desmitificaremos algunas técnicas de SEO antiguas con un toque de realidad pero conociendo el lado oscuro de la luna del SEO.",
    "features.6.title": "Comunidad",
    "features.6.description":
      "Mi idea principal es hacer una comunidad que se ayude mutuamente a resolver algunos problemas o simplemente a compartir conocimientos, por lo que intentaré hacer algunas publicaciones sobre cómo hacer una comunidad y cómo hacerla crecer.",
    "logos.title": "Algunas tecnologías que he usado antes",
    "cta.description": "Un día sin aprender es un día perdido.",
    "contact.name.error": "Por favor, escriba su nombre completo.",
    "contact.name.placeholder": "Nombre completo",
    "contact.email.placeholder": "Dirección de correo electrónico",
    "contact.email.error": "Por favor, escriba su correo electrónico.",
    "contact.message.placeholder": "Tu mensaje",
    "contact.message.error": "Por Favor, escriba un mensaje",
    "contact.submit": "Enviar mensaje",
  },
} as const;
