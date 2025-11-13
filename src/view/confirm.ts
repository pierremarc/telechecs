import { attrs, emptyElement } from "../lib/dom";
import { DIV, removeClass, addClass } from "../lib/html";
import tr from "../locale";
import { button } from "./buttons";

const getRoot = () => {
  const root = document.getElementById("confirm");
  if (root) {
    return root;
  } else {
    const root = attrs(DIV("root-element"), (set) => set("id", "confirm"));
    document.body.append(root);
    return root;
  }
};

const activate = addClass("active");
const deactivate = removeClass("active");

export const confirm = (message: HTMLElement) =>
  new Promise<void>((resolve, reject) => {
    const root = getRoot();
    emptyElement(root);
    activate(root);

    const clear = () => {
      deactivate(root);
      emptyElement(root);
    };

    const okButton = button(tr("button/confirm"), () => {
      clear();
      resolve(void 0);
    });

    const cancelButton = button(tr("button/cancel"), () => {
      clear();
      reject(void 0);
    });

    root.append(
      DIV("inner-message", message),
      DIV("inner-buttons", okButton, cancelButton)
    );
  });

export default confirm;
