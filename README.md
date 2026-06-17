# Shopping Santiago

Shopping Santiago es un prototipo web responsive para turistas que quieren decidir donde comprar en Santiago de Chile. El MVP combina una guia editorial de malls y outlets, rutas sugeridas, filtros, comparador y un cuestionario simple que recomienda lugares segun zona, intereses, tiempo disponible y tipo de transporte.

## Como correr el proyecto

```bash
npm install
npm run dev
```

Luego abre la URL local que muestra Vite, normalmente `http://localhost:5173`.

## Como correrlo en Replit

1. Crea un Repl de tipo Node.js o importa este proyecto desde GitHub.
2. Asegurate de que los archivos `package.json`, `vite.config.js`, `src/` e `index.html` queden en la raiz del Repl.
3. Abre la consola de Replit y ejecuta:

```bash
npm install
npm run dev
```

4. Replit detectara el servidor de Vite. El proyecto ya incluye `server.host = "0.0.0.0"` en `vite.config.js` y un archivo `.replit` con `run = "npm run dev"`.

Para una guia paso a paso, revisa `REPLIT_SETUP.md`.

## Estructura de archivos

```txt
src/
  App.jsx
  main.jsx
  index.css
  data/
    malls.json
    routes.json
  components/
    Header.jsx
    Hero.jsx
    QuickIntentButtons.jsx
    MallCard.jsx
    MallDetail.jsx
    MallGrid.jsx
    MallFilters.jsx
    RecommendationQuiz.jsx
    RouteCard.jsx
    RoutesSection.jsx
    CompareMalls.jsx
    TouristTips.jsx
    Footer.jsx
  utils/
    scoring.js
  i18n/
    locales.js
```

## Como agregar nuevos malls

Edita `src/data/malls.json` y agrega un objeto con la misma estructura de los existentes. Mantiene `id` unico, usa categorias en minuscula y deja `checkOfficialHours: true` cuando no haya horarios verificados.

## Como agregar nuevas rutas

Edita `src/data/routes.json` y agrega una ruta con `id`, `title`, `summary`, `duration`, `bestFor`, `stops` y `tips`. En `stops`, usa `mallId` para relacionar la ruta con un mall existente.

## Proximos pasos sugeridos

1. Agregar fotos reales de malls.
2. Agregar version portugues.
3. Agregar mapa.
4. Agregar panel administrador simple.
5. Agregar datos oficiales de horarios.
6. Agregar convenios y cupones.
7. Agregar rutas desde hoteles.
8. Agregar version mobile app futura.
