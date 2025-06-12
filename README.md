# Téléchecs

Play on [Lichess](https://lichess.org/) over the board, for cheap.

You can try it on https://pierremarc.github.io/telechecs/

![scene with a chess set and a smartphone running Téléchecs](./picture.jpg)

### An experiment

I find playing online an exciting idea but a very frustrating experience. Being glued to a screen lowers the enjoyment of playing quite a bit, and unfortunately I couldn't manage to focus my attention when I replicated the game online on a chessboard. Thus the idea to have the online part reduced to a scoresheet as to not distract me from the board. After having the interface quite OK plugged to a chess engine, it's now redirected to the great [Lichess](https://lichess.org/) platform.

The state of the application is at the level of a proof of concept, but already functional enough to make it enjoyable to play with.

Made a lil video to demonstrate how it's supposed to work.

https://github.com/user-attachments/assets/d421356c-0898-4b62-8dbc-56b4bf455c94

### The program

The program is just a Javascript bundle out of Typescript [source code](./src/) . It does mean that you don't need much to get it running anywhere.

If you want to experiment with it (or even fix things 😉), a simple `npm install && npm run dev` will do to have it running locally and watching.

### Publish

_rather a note for myself though_

```
npm run build \
    && git add www \
    && git commit www/ -m 'Build' \
    && git subtree push --prefix www/telechecs origin pages
```

## License

This "work" is written by Pierre Marchand and licensed under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.en.html) version 3.
