# Auditoría factual oriente-core

Fecha de corte y consulta: 2026-08-24.

## Alcance

Entidades: Costanera Center/Cenco Costanera, Parque Arauco, Alto Las Condes/Cenco Alto las Condes, Casacostanera, Mall Sport y MUT Mercado Urbano Tobalaba.

Se priorizaron sitios oficiales de cada centro u operador, Metro de Santiago y la Municipalidad de Providencia. Las páginas `oriente-core-01` a `oriente-core-24` son capturas de las fuentes primarias consultadas.

## Bloqueos y límites de extracción

- `https://www.parquearauco.cl/servicios` falló durante `webFetch`; los tres servicios que sí quedaron confirmados (Arauco Pick Up & Delivery, Arauco Travellers y baños) aparecen enlazados en la portada oficial guardada como `oriente-core-04-parque-arauco.md`.
- `https://www.parquearauco.cl/tiendas` abre, pero su directorio dinámico no entregó nombres de locales en el contenido extraído (`oriente-core-18-parque-arauco-tiendas.md`). El inventario de tiendas queda pendiente; no se usaron snippets ni fuentes secundarias para completarlo.
- Las fichas de estación `https://www.metro.cl/estacion/?estacion=TB` y `https://www.metro.cl/estacion/?estacion=TOB` devolvieron una página de error durante la extracción (`oriente-core-13` y `oriente-core-14`). Para MUT, la conexión a Tobalaba y las líneas 1 y 4 sí están explícitas en la página oficial “Cómo llegar” del propio MUT (`oriente-core-24-mut-como-llegar.md`). Para Costanera, el sitio extraído no confirmó estación/líneas, por lo que ese detalle queda pendiente en vez de inferirse.
- Las direcciones postales de Parque Arauco y Casacostanera no quedaron expuestas en las páginas oficiales extraídas. Se conserva solamente la comuna cuando está respaldada por fuente pública/primaria y se deja la dirección pendiente.
- Los directorios Cenco son paginados. Solo se consideran confirmados los locales que aparecen en la página guardada o en la página oficial de horarios; la ausencia de una marca en la primera página no demuestra que no exista.
- Los horarios son volátiles y corresponden exclusivamente a lo publicado y capturado el 2026-08-24. Parque Arauco y MUT advierten expresamente que pueden variar por local o contingencia.

## Criterio de inventario

Se recomienda publicar únicamente un conjunto pequeño y verificable:

- Cenco Costanera: Adidas, Abercrombie & Fitch, Aldo; además Falabella, Jumbo, Paris y Ripley aparecen en su página oficial de horarios.
- Cenco Alto las Condes: Adidas, American Eagle y Aldo; además Falabella, Jumbo y Paris aparecen en su página oficial de horarios.
- Casacostanera: Artesanías de Chile, Banana Republic, Bimba y Lola, Casaideas y Cinépolis.
- Mall Sport: The North Face, Sparta, Under Armour, Trek Bicycle Store y Patagonia.
- MUT: Majen, Larry y Toni Lautaro.
- Parque Arauco: inventario pendiente por bloqueo de extracción del directorio.

## Contradicciones críticas detectadas

- El registro de MUT dice “Sin metro cercano”; la página oficial confirma conexión directa con estación Tobalaba, líneas 1 y 4, y salida por MUT.
- El registro de MUT usa “Avenida Apoquindo 2750”; la página oficial “Cómo llegar” publica Apoquindo 2730.
- El registro de Alto Las Condes incluye Louis Vuitton, Hermès, Prada, Valentino, Cartier y Bulgari sin respaldo en las páginas oficiales capturadas. Deben retirarse hasta verificación individual.
- El registro de Casacostanera incluye Ripley, Adidas, Nike, Samsung, Starbucks, McDonald’s, PizzaPizza y Sushi Itto sin respaldo en el directorio oficial completo capturado. Deben retirarse; Zara, H&M, Mango y Pandora sí aparecen, pero para un inventario pequeño conviene usar la muestra indicada arriba.
- El registro de Mall Sport presenta Decathlon como tienda ancla y lista Nike, Reebok, Puma, Skechers, Brooks, Starbucks, Subway, Juan Valdez, GoPro y Leatherman; no aparecen en el directorio oficial capturado. Deben retirarse hasta nueva confirmación.
- Las afirmaciones editoriales de tiempos recomendados, nivel de precio, puntuación turística, popularidad y perfiles “ideal/no ideal” no están respaldadas por las fuentes primarias consultadas y deben tratarse como opinión editorial o retirarse de una ficha factual.