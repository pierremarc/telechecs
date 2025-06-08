export interface SVGTags {
    line: SVGLineElement;
    circle: SVGCircleElement;
    path: SVGPathElement;
    g: SVGGElement;
}

const create = <T extends keyof SVGTags>(tag: T): SVGTags[T] =>
    document.createElementNS("http://www.w3.org/2000/svg", tag) as SVGTags[T];

export const events = <E extends SVGElement>(
    e: E,
    f: (
        s: <K extends keyof SVGElementEventMap>(
            k: K,
            listener: (ev: SVGElementEventMap[K]) => void
        ) => void
    ) => void
) => {
    const add = <K extends keyof SVGElementEventMap>(
        k: K,
        listener: (ev: SVGElementEventMap[K]) => void
    ) => {
        e.addEventListener(k, listener);
    };
    f(add);
    return e;
};

export const style = <E extends SVGElement>(
    e: E,
    f: (style: CSSStyleDeclaration) => void
) => {
    f(e.style);
    return e;
};

type Properties = {
    [k: string]: string;
};

export type MoveTo = { tag: "M"; x: number; y: number };
export type LineTo = { tag: "L"; x: number; y: number };
export type Close = { tag: "Z" };

export const moveTo = (x: number, y: number): MoveTo => ({
    tag: "M",
    x,
    y,
});

export const lineTo = (x: number, y: number): LineTo => ({
    tag: "L",
    x,
    y,
});
export const close = (): Close => ({
    tag: "Z",
});

export type Op = MoveTo | LineTo | Close;

const opToString = (op: Op) => {
    switch (op.tag) {
        case "Z":
            return "Z";
        case "M":
            return `M${op.x},${op.y}`;
        case "L":
            return `L${op.x},${op.y}`;
    }
};
const opsToString = (ops: Op[]) => ops.map(opToString).join(" ");

export const SVG = (els: SVGElement[], properties = {} as Properties) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    Object.keys(properties).forEach((key) =>
        el.setAttribute(key, properties[key])
    );
    els.forEach((e) => el.appendChild(e));
    return el;
};

export const LINE = (x1: number, y1: number, x2: number, y2: number) => {
    const l = create("line");
    l.setAttribute("x1", x1.toString());
    l.setAttribute("y1", y1.toString());
    l.setAttribute("x2", x2.toString());
    l.setAttribute("y2", y2.toString());
    return l;
};

export const PATH = (ops: Op[], properties = {} as Properties) => {
    const p = create("path");
    Object.keys(properties).forEach((key) =>
        p.setAttribute(key, properties[key])
    );
    p.setAttribute("d", opsToString(ops));
    return p;
};
export const GROUP = (elements: SVGElement[]) => {
    const g = create("g");
    elements.forEach((e) => g.appendChild(e));
    return g;
};
