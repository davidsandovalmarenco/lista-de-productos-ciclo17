<div align="center">
  <h1> Lista de Productos</h1>
  <p><strong>Gestión de inventario de siguiente nivel con una experiencia de usuario (UX) asombrosa.</strong></p>

  <p align="center">
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
</div>

---

<p align="center">
  Una aplicación móvil construida con <b>React Native y Expo</b> diseñada bajo los más altos estándares visuales. Transforma la aburrida tarea de administrar productos en una experiencia premium. Interfaces fluidas, micro-interacciones pulidas y gestión de categorías por colores.
</p>

## Características Principales

- **Diseño "Premium SaaS":** Interfaz de usuario minimalista, moderna y limpia, con fondos blancos, tipografía cuidada y sombras suaves.
- **Gestión de Categorías Avanzada:** Crea, edita y elimina categorías. Asigna colores personalizados a cada categoría usando selecres cromáticos.
- **Administración de Productos:** Flujo completo de CRUD (Crear, Leer, Actualizar, Eliminar). Controla el estado del inventario ("En Stock con interruptores fluidos.
- **Bottom Sheets Animados:** Experiencia nativa al agregar o editar elementos, usando hojas modales que se deslizan desde la parte inferr de la pantalla con animaciones de resorte (*spring animations*).
- **Validación en Tiempo Real:** Filtros inteligentes (como la restricción exclusiva a números en el precio) para prevenir errores de usuar y mantener la integridad de los datos.
- **Micro-Interacciones:** Efectos al tocar, gestos de cierre y retroalimentación háptica/visual responsiva.

---

## Capturas de Pantalla

> **Tip:** *[Reemplaza estos enlaces con imágenes reales de tu aplicación]*

<div align="center">
  <img src="https://via.placeholder.com/250x500.png?text=Pantalla+Principal" width="22%" /> &nbsp;
  <img src="https://via.placeholder.com/250x500.png?text=Crear+Producto" width="22%" /> &nbsp;
  <img src="https://via.placeholder.com/250x500.png?text=Gestionar+Categorias" width="22%" /> &nbsp;
  <img src="https://via.placeholder.com/250x500.png?text=Detalle+Premium" width="22%" />
</div>

---

## Tecnologías Utilizadas

- **[React Native](https://reactnative.dev/):** Framework principal para el desarrollo móvil.
- **[Expo](https://expo.dev/):** Plataforma para desarrollo, construcción y despliegue rápido.
- **[TypeScript](https://www.typescriptlang.org/):** Tipado estricto para un código más seguro, predecible y libre de errores.
- **[Expo Vector Icons (Feather)](https://icons.expo.fyi/):** Íconos elegantes, ligeros y de estilo profesional.
- **Animated API:** Utilizada de forma extensiva para modales, *bottom sheets* y transiciones fluidas.

---

## Instalación y Uso Local

Sigue estos pasos para correr la aplicación en tu entorno local:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/davidsandovalm/lista-de-productos-ciclo17.git
cd lista-de-productos-ciclo17
```

### 2. Instalar Dependencias
Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
```bash
npm install
# o usando yarn
yarn install
```

### 3. Ejecutar la Aplicación
```bash
npx expo start
```
- Presiona `a` para abrir en un Emulador de **Android**.
- Presiona `i` para abrir en el Simulador de **iOS** (Solo Mac).
- Escanea el código QR con la app **Expo Go** en tu dispositivo físico (iOS/Android).

---

## Estructura del Proyecto Recomendada

```text
📦 lista-de-productos-ciclo17
 ┣ 📂 assets/             # Imágenes y fuentes locales
 ┣ 📂 screen/             # Pantallas de la aplicación (Modales y Bottom Sheets)
 ┃ ┣ 📜 AddCategory.tsx   # Modal para la creación/selección de categorías
 ┃ ┗ 📜 AddProduct.tsx    # Modal para añadir y editar productos
 ┣ 📜 App.tsx             # Punto de entrada / Pantalla Principal (Lista de Productos)
 ┣ 📜 app.json            # Configuración de Expo
 ┗ 📜 package.json        # Dependencias y scripts
```

---

## Contribución

¡Las contribuciones son siempre bienvenidas! Si tienes ideas para mejorar la UI/UX, optimizar las animaciones o añadir nuevas funciones:

1. Haz un **Fork** del proyecto.
2. Crea una **Rama** para tu función (`git checkout -b feature/NuevaCaracteristica`).
3. Haz **Commit** de tus cambios (`git commit -m 'Añadida NuevaCaracteristica'`).
4. Haz **Push** a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un **Pull Request**.

---

<div align="center">
  <p>Desarrollado con David Sandoval M y para el Ciclo 17 - Desarrollo de Aplicaciones Multidispositivo II</p>
</div>
