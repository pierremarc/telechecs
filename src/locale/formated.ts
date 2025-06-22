import { ANCHOR, DIV, PARA, SPAN } from "../lib/html";
import { get } from "../store";

export default {
  "home/tagline": {
    en: () =>
      PARA(
        SPAN("ucui", "Téléchecs "),
        "is a ",
        ANCHOR("", get("lichess/host"), " Lichess"),
        " client for players who prefer to play over the board."
      ),
    fr: () =>
      PARA(
        SPAN("ucui", "Téléchecs "),
        "est une interface à ",
        ANCHOR("", get("lichess/host"), " Lichess"),
        " pour les joueuses et joueurs qui préfèrent jouer sur un échiquier."
      ),
  },

  "home/description": {
    en: () =>
      DIV(
        "",
        PARA(`
            Connect this page with your Lichess account to create games or challenge players 
            from here.  
            `),
        PARA(`
            Once a game starts, you'll be presented with a black 
            screen where you'll see your opponent moves when they play, 
            and an input widget to enter your moves when it's your turn.
            And that will be all of it. 
            `),
        PARA("Enjoy!")
      ),
    fr: () =>
      DIV(
        "",
        PARA(`
            Connectez cette page à votre compte Lichess pour commencer à jouer.  
            `),
        PARA(`
            Lorsqu'une partie commence, les coups de l'adversaire 
            vous seront présentés de manière textuelle. 
            Et à votre tour de jouer, une interface de saisie 
            vous permettra de transmettre votre coup. 
            `),
        PARA("Bonne partie!")
      ),
  },
};
