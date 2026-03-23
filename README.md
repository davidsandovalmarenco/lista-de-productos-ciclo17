<div align="center">

# 📱 Lista de Productos Premium
**Gestión de Inventario de Siguiente Nivel**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

Una aplicación móvil construida bajo los más altos estándares de diseño (SaaS UI/UX). Diseñada para transformar la gestión rutinaria de productos en una experiencia fluida, rápida y visualmente asombrosa.
</div>

---

## 🎯 Visión General del Proyecto

Esta aplicación de inventario está meticulosamente diseñada para ofrecer:
- **Gestión Avanzada:** Control total sobre tu catálogo de productos y categorías.
- **Rendimiento Nativo:** Animaciones de a 60FPS utilizando el motor de React Native.
- **Experiencia de Usuario (UX):** Interacciones modernas basadas en gestos y retroalimentación inmediata.

> **💡 Nota Técnica:** La arquitectura enfatiza un estado escalable y un diseño de componentes altamente reutilizables y tipados estáticamente con TypeScript.

<br/>

<div align="center">
  <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop" alt="App Banner" style="border-radius: 12px; width: 100%; max-height: 250px; object-fit: cover;" />
</div>

<br/>

---

## ⚡ Características Principales

| Característica | Descripción Técnica & UX |
| :--- | :--- |
| **Arquitectura SaaS Premium** | Interfaz limpia (fondos blancos, sombras sutiles) y jerarquía visual impecable, proporcionando confianza y profesionalismo al usuario final. |
| **Categorización por Color** | Sistema de etiquetas dinámico. Los usuarios pueden asignar colores hexadecimales personalizados a las categorías (e.g. Rojo para "Urgente", Verde para "Orgánico"). |
| **Filtros de Datos Estrictos** | Expresiones regulares (Regex) a nivel componente. Previene la introducción de caracteres no numéricos en los campos de precio e impone un formato monetario estricto. |
| **Bottom Sheets Nativos** | Hojas modales contextuales (sin abandonar la pantalla) utilizando `Animated.spring()` para ofrecer interacciones elásticas realistas. |
| **Flujo CRUD Completo** | Lógica de estado robusta capaz de crear, leer, actualizar y eliminar (CRUD) registros de forma instantánea y en memoria. |

---

## 📐 Tecnologías Utilizadas

La solución está apoyada en una pila de desarrollo móvil moderna y probada en la industria:

*   **[React Native](https://reactnative.dev/):** Renderizado de componentes nativos para iOS y Android desde un mismo código base.
*   **[Expo](https://expo.dev/):** Abstracción de configuración nativa, compilación en la nube (EAS) y hot-reloading de última generación.
*   **[TypeScript](https://www.typescriptlang.org/):** Superficie de código estáticamente tipada para evitar errores en tiempo de pre-compilación.
*   **[Expo Vector Icons](https://icons.expo.fyi/):** Paquete de iconografía tipográfica (Feather) ligera y escalable de resolución independiente.

---

## 🚀 Instalación y Uso Local

Para desplegar este entorno en tu máquina local, sigue el flujo estándar de Node.js:

### 1. Clonar el Repositorio
Obtén el código fuente utilizando tu terminal preferida:
```bash
git clone https://github.com/davidsandovalm/lista-de-productos-ciclo17.git
cd lista-de-productos-ciclo17
```

### 2. Instalar Dependencias
Asegúrate de contar con Node.js (v16+) y ejecuta:
```bash
npm install
```

### 3. Ejecutar el Servidor de Desarrollo Metro
Inicia el empaquetador de la aplicación:
```bash
npx expo start
```

**Para visualizarlo:**
- Presiona `a` en tu terminal para correr un Emulador de **Android**.
- Presiona `i` para correr un Simulador de **iOS** (Solo macOS).
- Escanea el código QR mostrado en terminal con la aplicación **Expo Go** en tu dispositivo físico real.

---

## 📂 Arquitectura de Directorios

La estructura favorece un desarrollo ágil y escalabilidad entre vistas:

```markdown
📦 lista-de-productos-ciclo17
 ┣ 📂 assets/             # Recursos estáticos (fuentes, iconos del app, splash screen)
 ┣ 📂 screen/             # Controladores de Interfaz de Usuario
 ┃ ┣ 📜 AddCategory.tsx   # Lógica, estado y vista del modal de gestión de categorías
 ┃ ┗ 📜 AddProduct.tsx    # Formularios y validaciones para creación/edición de productos
 ┣ 📜 App.tsx             # Entry-point. Bucle de estado central y renderizado de lista base.
 ┣ 📜 app.json            # Manifiesto de Expo (Nombre, orientación, permisos, iconos)
 ┗ 📜 package.json        # Árbol de dependencias y scripts de CLI
```

---

## 🤝 Contribuir a este Proyecto

Las Pull Requests son bienvenidas. Sigue estas convenciones para mantener el alto estándar del proyecto:

1. Realiza un **Fork** de este repositorio.
2. Crea tu rama descriptiva: `git checkout -b refactoring/MejoraDeValidacion` o `feature/DashboardEstadisticas`.
3. Haz un commit siguiendo [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
4. Sube los cambios y propón un **Pull Request**.

---

<div align="center">
  <p><b>Desarrollado con pasión e ingeniería por David Sandoval M y para el Ciclo 17 - Desarrollo de Aplicaciones Multidispositivo II</b></p>
  <p>Construyendo el futuro de las aplicaciones móviles un commit a la vez.</p>
</div>
