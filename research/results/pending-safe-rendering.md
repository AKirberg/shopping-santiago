Implementado en los cuatro archivos permitidos:

- Fichas omiten descripciones, comuna, transporte, tiempo, precio, listas, tiendas y notas cuando faltan, sin placeholders.
- Parking/Uber solo se muestran cuando el valor individual es booleano.
- JSON-LD y prerender omiten campos factuales ausentes; tiendas inválidas no generan `containsPlace`.
- Rutas filtran paradas sin mall, usan conteos válidos, no duplican notas y ocultan contenido/chips vacíos.
- Tiempo y Metro localizados son independientes; botones Maps requieren URL HTTP(S) válida.
- SEO actualizado a wording neutral ES/PT/EN (“Información y cómo llegar” y equivalentes).
- No se modificaron rutas, IDs, canonicals, hreflang, sitemap ni redirects.

Verificación: `node --check`, transformación JSX con esbuild y `git diff --check` completaron sin errores. Los cambios ajenos en metadata/research ya presentes no fueron tocados.