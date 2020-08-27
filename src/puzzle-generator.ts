import { NS_SVG, getSeed, round } from './utils';
// Modified from https://gist.github.com/Draradech/35d36347312ca6d0887aa7d55f366e30
// Changes: Outputs per-puzzle path instead of one for all.

interface Stroke {
  points: number[];
  inst: string[];
}

const svgArgsCount: { [arg: string]: number; } = {
  M: 2, m: 2,
  L: 2, l: 2,
  H: 1, h: 1,
  V: 1, v: 1,
  C: 6, c: 6,
  S: 4, s: 4,
  Q: 4, q: 4,
  T: 2, t: 2,
  A: 7, a: 7,
  z: 0,
};

export interface JigsawGeneratorOptions {
  width: number;
  height: number;
  xCount: number;
  yCount: number;
  seed?: any;
  tabSize?: number;
  jitter?: number;
  radius?: number;
  fixedPattern?: boolean;
}

export class JigsawGenerator {
  cells: string[][];
  width: number;
  height: number;
  xCount: number;
  yCount: number;
  seed: number;
  tabSize: number;
  jitter: number;
  radius: number;
  fixedPattern: number;

  private strokes = new Map<number, Stroke[]>();
  private a: number = 0;
  private b: number = 0;
  private c: number = 0;
  private d: number = 0;
  private e: number = 0;
  private flip: boolean = false;
  private xi: number;
  private yi: number;
  private vertical: boolean;
  private get sl() { return this.vertical ? this.height / this.yCount : this.width / this.xCount; }
  private get sw() { return this.vertical ? this.width / this.xCount : this.height / this.yCount; }
  private get ol() { return this.sl * (this.vertical ? this.yi : this.xi); }
  private get ow() { return this.sw * (this.vertical ? this.xi : this.yi); }

  constructor(options: JigsawGeneratorOptions) {
    this.width = options.width;
    this.height = options.height;
    this.xCount = options.xCount;
    this.yCount = options.yCount;
    this.tabSize = options.tabSize ?? 0.1;
    this.jitter = options.jitter ?? 0.04;
    this.seed = getSeed(options.seed ?? Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER));
    this.radius = Math.min(options.radius ?? 0, this.sl, this.sw);
    this.fixedPattern = options.fixedPattern ? Math.floor(this.random() * 2 + 1) : 0;

    this.vertical = false;
    for(this.yi = 1; this.yi < this.yCount; this.yi++) {
      this.first();
      for(this.xi = 0; this.xi < this.xCount; this.xi++) {
        this.next();
        this.pushStroke(this.xi + this.xCount * (this.yi - 1), this.generateStroke(true));
        this.pushStroke(this.xi + this.xCount * this.yi, this.generateStroke());
      }
    }

    this.vertical = true;
    for(this.xi = 1; this.xi < this.xCount; this.xi++) {
      this.first();
      for(this.yi = 0; this.yi < this.yCount; this.yi++) {
        this.next();
        this.pushStroke(this.xi - 1 + this.xCount * this.yi, this.generateStroke());
        this.pushStroke(this.xi + this.xCount * this.yi, this.generateStroke(true));
      }
    }

    this.vertical = false;
    this.pushStroke(0, {
      points: [
        0, round(this.sw, 3),
        0, this.radius,
        this.radius, this.radius, 0, 0, 1,
        this.radius, 0,
      ],
      inst: ['M', 'L', 'A'],
    });

    this.vertical = true;
    this.pushStroke(this.xCount - 1, {
      points: [
        round(this.width - this.sw), 0,
        this.width - this.radius, 0,
        this.radius, this.radius, 0, 0, 1,
        this.width, this.radius,
      ],
      inst: ['M', 'L', 'A'],
    });

    this.vertical = false;
    this.pushStroke(this.xCount * this.yCount - 1, {
      points: [
        this.width, round(this.height - this.sw, 3),
        this.width, this.height - this.radius,
        this.radius, this.radius, 0, 0, 1,
        this.width - this.radius, this.height,
      ],
      inst: ['M', 'L', 'A'],
    });

    this.vertical = true;
    this.pushStroke(this.xCount * (this.yCount - 1), {
      points: [
        round(this.sw, 3), this.height,
        this.radius, this.height,
        this.radius, this.radius, 0, 0, 1, 0,
        this.height - this.radius,
      ],
      inst: ['M', 'L', 'A'],
    });

    this.cells = [];
    for(const [i, stroke] of this.strokes) {
      const y = Math.trunc(i / this.xCount);
      (this.cells[y] ?? (this.cells[y] = []))[i % this.xCount] = this.getNormalizedStroke(stroke);
    }

    this.strokes.clear();
  }

  toSvgElements(document: Document, parent?: Node) {
    const result: SVGPathElement[] = [];
    const fragment = parent != null ? document.createDocumentFragment() : null;
    for(let y = 0; y < this.cells.length; y++) {
      const row = this.cells[y];
      for(let x = 0; x < row.length; x++) {
        const elm = document.createElementNS(NS_SVG, 'path');
        elm.setAttribute('d', row[x]);
        elm.id = `p-${x}-${y}`;
        result.push(elm);
        fragment?.appendChild(elm);
      }
    }
    parent?.appendChild(fragment!);
    return result;
  }

  private generateStroke(reverse?: boolean): Stroke {
    const { a, b, c, d, e, tabSize } = this;
    const p0l = this.l(0);
    const p0w = this.w(0);
    const p1l = this.l(0.2);
    const p1w = this.w(a);
    const p2l = this.l(0.5 + b + d);
    const p2w = this.w(-tabSize + c);
    const p3l = this.l(0.5 - tabSize + b);
    const p3w = this.w(tabSize + c);
    const p4l = this.l(0.5 - 2 * tabSize + b - d);
    const p4w = this.w(3 * tabSize + c);
    const p5l = this.l(0.5 + 2 * tabSize + b - d);
    const p5w = this.w(3 * tabSize + c);
    const p6l = this.l(0.5 + tabSize + b);
    const p6w = this.w(tabSize + c);
    const p7l = this.l(0.5 + b + d);
    const p7w = this.w(-tabSize + c);
    const p8l = this.l(0.8);
    const p8w = this.w(e);
    const p9l = this.l(1);
    const p9w = this.w(0);
    return {
      points: this.vertical ? reverse ? [
        p9w, p9l, p8w, p8l, p7w, p7l, p6w, p6l,
        p5w, p5l, p4w, p4l, p3w, p3l, p2w, p2l,
        p1w, p1l, p0w, p0l,
      ] : [
        p0w, p0l, p1w, p1l, p2w, p2l, p3w, p3l,
        p4w, p4l, p5w, p5l, p6w, p6l, p7w, p7l,
        p8w, p8l, p9w, p9l,
      ] : reverse ? [
        p9l, p9w, p8l, p8w, p7l, p7w, p6l, p6w,
        p5l, p5w, p4l, p4w, p3l, p3w, p2l, p2w,
        p1l, p1w, p0l, p0w,
      ] : [
        p0l, p0w, p1l, p1w, p2l, p2w, p3l, p3w,
        p4l, p4w, p5l, p5w, p6l, p6w, p7l, p7w,
        p8l, p8w, p9l, p9w,
      ],
      inst: ['M', 'C', 'C', 'C'],
    };
  }

  private random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  private nextJitter() {
    return this.random() * this.jitter * 2 - this.jitter;
  }

  private first() {
    this.e = this.nextJitter();
  }

  private next() {
    const filp = this.flip;
    switch(this.fixedPattern) {
      case 1: case 2:
        this.flip = (this.xi + this.yi) % 2 === (this.fixedPattern + (this.vertical ? 1 : 0)) % 2;
        break;
      default:
        this.flip = this.random() >= 0.5;
        break;
    }
    this.a = (this.flip === filp ? -this.e : this.e);
    this.b = this.nextJitter();
    this.c = this.nextJitter();
    this.d = this.nextJitter();
    this.e = this.nextJitter();
  }

  private l(v: number) {
    return round(this.ol + this.sl * v, 3);
  }

  private w(v: number) {
    return round(this.ow + this.sw * v * (this.flip ? -1 : 1), 3);
  }

  private pushStroke(i: number, stroke: Stroke) {
    const strokes = this.strokes.get(i);
    if(strokes)
      strokes.push(stroke);
    else
      this.strokes.set(i, [stroke]);
  }

  private getNormalizedStroke(strokes: Stroke[]) {
    if(strokes == null || !strokes.length)
      return '';
    if(strokes.length > 1) {
      const strokeSet = new Set(strokes);
      const result: Stroke = { points: [], inst: [] };
      while(strokeSet.size) {
        let found = false;
        for(const other of strokeSet)
          if(!result.points.length) {
            result.points = other.points;
            result.inst = other.inst;
            found = true;
            strokeSet.delete(other);
            break;
          } else if(
            Math.abs(result.points[0] - other.points[other.points.length - 2]) < 1 &&
            Math.abs(result.points[1] - other.points[other.points.length - 1]) < 1
          ) {
            result.points.splice(0, 2, ...other.points);
            result.inst.splice(0, 1, ...other.inst);
            found = true;
            strokeSet.delete(other);
            break;
          } else if(
            Math.abs(other.points[0] - result.points[result.points.length - 2]) < 1 &&
            Math.abs(other.points[1] - result.points[result.points.length - 1]) < 1
          ) {
            other.points.splice(0, 2, ...result.points);
            other.inst.splice(0, 1, ...result.inst);
            result.points = other.points;
            result.inst = other.inst;
            found = true;
            strokeSet.delete(other);
            break;
          }
        if(!found)
          break;
      }
      strokes = [result];
    }
    const { points, inst } = strokes[0];
    let j = 0;
    let result = '';
    for(const i of inst) {
      result += i;
      const c = svgArgsCount[i];
      if(c) result += points.slice(j, j += c).join(' ');
    }
    return result + 'z';
  }
}
