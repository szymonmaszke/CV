# Code structure

## data

- `generated` - scrapped data (for example from StackOverflow or GitHub)
- `specified` - user specified achievments etc.

## main.tex

Main LaTeX file which loads `/sections` subfolder and stitches the whole thing
together.

## sections

Code for different parts of CV:
- `top.tex` - top bar of the CV (name, surname, social profiles displayed by icons)
- `sidebar.tex` - left side bar containing skills, GitHub, SO, Research, Languages
- `core.tex` - center/core bar with work, education and projects

__Each part loads commands/colors from `styles`__

## styles

Defines different parts used within `sections`:
- `colors.sty` - defines everything color related (bars, foreground, text, icon colors)
- `commands.sty` - commands used to create blocks, nodes etc. with TiKZ (pardon my LaTeX)
- `environments.sty` - single environment for writing, consider an `util`
- `rulers.sty` - rulers used to divide skill blobs in the CV
- `variables.sty` - generic `variables` defining margin size, height, width and so on
