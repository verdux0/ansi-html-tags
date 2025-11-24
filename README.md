<h1 align="center">ansi-html-tags</h1>

<p align="center">
  <img src="https://web.archive.org/web/20091020072437/http://hk.geocities.com/meelin292002/ani_line_star2_rainbow.gif" alt="rainbow">
</p>


🇪🇸 Una **forma fácil** de crear un banner colorido en la terminal usando Python.  
🇬🇧 An **easy way** to create multi-platform colourful banners in the terminal with Python.

---

## Cómo funciona

`colorText()` es una **función** que te permite aplicar colores y estilos tipo HTML a cualquier texto para la terminal.  
Con solo descargarte `colors.py` ya tienes todos los colores disponibles.  

Se usa como un **parser de etiquetas HTML**:

```python
from colors import colorText

banner = """
<PINK>I</PINK><BRIGHT_MAGENTA>L</BRIGHT_MAGENTA><MAGENTA>O</MAGENTA><BRIGHT_MAGENTA>V</BRIGHT_MAGENTA><PINK>E</PINK><BRIGHT_MAGENTA> U </BRIGHT_MAGENTA><MAGENTA>C</MAGENTA><BRIGHT_MAGENTA>U</BRIGHT_MAGENTA><PINK>Q</PINK><MAGENTA>U</MAGENTA><MAGENTA>I</MAGENTA> <BRIGHT_RED><BOLD>❤</BOLD></BRIGHT_RED>
"""

print(colorText(banner))
```

![result](https://imgur.com/BwVRLn3.jpg)


## Requisitos 📦

pip install -r requirements.txt

```python
colorama==0.4.6
```


# Interfaz v2 Mejorada POR IA  (Banner Builder)
[estoy probando el poder de los agentes de github]
<br>
Esta versión incluye:
- Undo/Redo (botones y atajos: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z).
- Exportar directamente a `.txt`.
- Modo claro/oscuro (botón Claro/Oscuro).
- Fuente monoespaciada en modo Visual para simular terminal.
- Validación de colores: los no soportados aparecen deshabilitados.

## Uso Rápido
1. Escribe o pega tu texto en modo Visual.
2. Selecciona partes y aplica colores.
3. Cambia a modo Código para ver las etiquetas `<color>...</color>`.
4. Copia o exporta el resultado (`Copiar código` / `Exportar .txt`).
5. Usa el string con etiquetas con tu librería para obtener ANSI real.

## Undo/Redo
- Se guarda un snapshot cada (~250 ms) tras cambios y después de operaciones significativas.
- Máximo histórico: 200 estados (configurable).

## Exportar .txt
- En modo Visual: exporta conversión a tags.
- En modo Código: exporta exactamente lo mostrado.

## Validación de Colores
`SUPPORTED_COLORS` controla qué botones están habilitados.

Ejemplo dinámico:
```js
window.setSupportedColors(['red','green','blue']);
```

## Integración con Conversión a ANSI
```js
import { parseTagsToAnsi } from '../src/ansi'; // Ajusta la ruta

const tags = window.getBannerTags();
const ansi = parseTagsToAnsi(tags);
console.log(ansi);
```

## Extensiones Futuras
- Vista previa ANSI simulada.
- Atributos: bold, underline, italic.
- Fondo: `<red|bgBlue>Texto</red|bgBlue>`.
- Guardar/abrir proyectos `.banner.json`.

## Estructura
```
ui/
  index.html
  styles.css
  app.js
  README.md
```

