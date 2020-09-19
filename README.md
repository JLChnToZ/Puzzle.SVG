# 🧩 Puzzle.SVG

An experiment on create self-contained jigsaw puzzle which can loads custom image written in SVG and TypeScript.

Currently is still in prototype, but basic funcionality are finished, you can play with any image file you want.

Features:
- Load any image via clipboard / files
- 2 puzzle generation mode (random/fixed pattern)
- Touch screen is supported, despite the puzzle scale, it is playable with mobile devices.
- Self contained, save files are packed with full runtime and the game state, thus it is still playable even the device is offline, you may open the save file directly with any modern web browser (But Chroumium based browsers such as Google Chrome, Microsoft Edge, Vivaldi are recommend) to continue.
- The start/end time is recorded, a "certificate" with those information will display once the puzzle is solved.

## Trying

[Click here](https://code.moka-rin.moe/Puzzle.SVG/puzzle.svg) to try out!

## Building

After cloneing this repository, just use `yarn` and then `yarn build` (assume you have installed Node.js), it will do the thing.

## License

[MIT](LICENSE)
