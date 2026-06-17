# Replit Setup: Shopping Santiago

Esta guia explica como importar, instalar y correr Shopping Santiago en Replit. El proyecto sigue siendo un MVP frontend simple: React, Vite, Tailwind CSS y datos locales en JSON. No requiere backend, base de datos, login, pagos ni claves API.

## 1. Crear o importar el Repl

Opcion A: importar desde GitHub

1. Sube este proyecto a un repositorio de GitHub.
2. En Replit, elige **Create Repl**.
3. Selecciona **Import from GitHub**.
4. Pega la URL del repositorio.
5. Confirma que Replit detecte el proyecto como Node.js.

Opcion B: subir archivos manualmente

1. Crea un Repl de tipo **Node.js**.
2. Sube todos los archivos del proyecto.
3. Asegurate de que estos archivos queden en la raiz del Repl:
   - `package.json`
   - `vite.config.js`
   - `index.html`
   - `.replit`
   - `src/`

## 2. Instalar dependencias

Abre la consola de Replit y ejecuta:

```bash
npm install
```

Esto instalara React, Vite, Tailwind CSS y Lucide React.

## 3. Correr el proyecto

Puedes usar cualquiera de estos comandos:

```bash
npm run dev
```

o:

```bash
npm start
```

El archivo `.replit` ya esta configurado con:

```txt
run = "npm run dev"
```

Por eso, el boton **Run** de Replit tambien deberia levantar la app.

## 4. Abrir la app

Cuando Vite arranque, Replit mostrara una URL publica o una vista web interna. El proyecto usa:

```js
server: {
  host: "0.0.0.0",
  port: 5173
}
```

Esto permite que Replit exponga correctamente el servidor de desarrollo.

## 5. Verificar que todo este conectado

Revisa estas partes principales:

- Home y botones rapidos: `src/components/Hero.jsx` y `src/components/QuickIntentButtons.jsx`
- Malls: `src/data/malls.json`
- Rutas: `src/data/routes.json`
- Filtros: `src/components/MallFilters.jsx`
- Quiz: `src/components/RecommendationQuiz.jsx` y `src/utils/scoring.js`
- Comparador: `src/components/CompareMalls.jsx`
- Ficha de mall: `src/components/MallDetail.jsx`

Si agregas un mall nuevo, usa un `id` unico. Si agregas una ruta, cada `stop.mallId` debe coincidir con el `id` de un mall existente.

## 6. Estructura esperada

```txt
.
├── .replit
├── REPLIT_SETUP.md
├── README.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    ├── data/
    │   ├── malls.json
    │   └── routes.json
    ├── i18n/
    │   └── locales.js
    └── utils/
        └── scoring.js
```

## 7. Problemas comunes

Si Replit no instala dependencias:

```bash
npm install
```

Si la app no aparece en la vista web:

1. Confirma que el comando activo sea `npm run dev`.
2. Revisa que `vite.config.js` tenga `host: "0.0.0.0"`.
3. Deten el Repl y presiona **Run** otra vez.

Si aparece un error por un mall o ruta:

1. Revisa comas y comillas en `src/data/malls.json` o `src/data/routes.json`.
2. Confirma que cada ruta use un `mallId` existente.
3. No agregues horarios, promociones o descuentos no confirmados.

## Como seguir desarrollando Shopping Santiago

1. Agregar fotos reales de malls.
2. Agregar version portugues.
3. Agregar mapa.
4. Agregar panel administrador simple.
5. Agregar datos oficiales de horarios.
6. Agregar convenios y cupones.
7. Agregar rutas desde hoteles.
8. Agregar version mobile app futura.

Mantener por ahora el proyecto simple y editable: los datos deben seguir viviendo en archivos JSON locales hasta que realmente haga falta un backend.
