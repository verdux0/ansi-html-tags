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


## Futuro 🚀

En próximas versiones quiero añadir una interfaz gráfica sencilla que permita:

📝 Copiar y pegar un texto.

🎨 Seleccionar áreas con el ratón.

🌈 Elegir colores desde un selector visual.

Esto permitirá crear banners coloridos sin tocar directamente el código.


---


