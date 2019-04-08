# Aquarium
Alec Bell, Jessica Moyer, Rob LaTour
11:10 AM Section (CSE 5542)

# To view:
  1. Run an HTTP server out of this directory. You can do this easily with Python from the command line using either of the following commands:
     - Python 2: `$ python -m SimpleHTTPServer`
     - Python 3: `$ python3 -m http.server`
  2. Navigate to http://localhost:8000/index.html, assuming it is running on port 8000.

# Project Overview
## Files/Code
- JavaScript code is in main.js. This includes a parser `draw()` for the grammar. Variables are defined at the top (generations, sequences, and rotation angles).
- Definition of the `Fish` class is in `fish.js`.

## L-system Grammar Symbols
- `F` moves forward 1 unit.
- `-` rotates the current line clockwise about the z-axis.
- `+` rotates the current line counter-clockwise about the z-axis.
- `[` enters a sub-sequence.
- `]` exits a sub-sequence.
- `>` rotates the current line clockwise about the x-axis.
- `<` rotates the current line counter-clockwise about the x-axis.
- `R` changes the color to red.
- `G` changes the color to green (lines are also green by default).
- `#` creates a yellow cube (a flower).
