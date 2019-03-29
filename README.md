Alec Bell
11:10 AM Section (CSE 5542)

- Open index.html to view it.
- JavaScript code is in main.js. This includes a parser `draw()` for the grammar. Variables are defined at the top (generations, sequences, and rotation angles).
- Can view the output string in the console.

Implemented all of the extra credit.
- 3D: Move around by clicking and dragging on screen (OrbitControls).
- My own grammar: Modified the given grammar to work for 3D and with colors and 3D shapes. Explanation of the new symbols...
  - `>` rotates the current line clockwise about the x-axis.
  - `<` rotates the current line counter-clockwise about the x-axis.
  - `R` changes the color to red.
  - `G` changes the color to green (lines are also green by default).
  - `#` creates a yellow cube (a flower).
- Colors: implemented both red and green colors for the L-system, with the additional option of making a yellow cube.
- Randomness: Rotation angle is randomized in that it can be +/- 0.025 radians.
