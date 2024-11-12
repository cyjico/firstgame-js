import Polygon2dCollider from '../ecs/comps/polygon2dCollider.js';
import Sprite from '../ecs/comps/sprite.js';
import Transform2d from '../ecs/comps/transform2d.js';
import Sys from '../ecs/core/sys.js';
import loadImage from '../util/loadImage.js';

export class BulletComp {
  /**
   * @param {import("../ecs/util/vector2d.js").default} dir
   * @param {number} spd
   * @param {import("../ecs/util/vector2d.js").default} pos
   * @param {number} rot
   */
  constructor(dir, spd, pos, rot) {
    this.vec = dir.clone().mul(spd);
    this.pos = pos.clone();
    this.rot = rot;
  }
}

export class BulletSys extends Sys {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    super();
    this.canvas = canvas;
  }

  /** @type {import('../ecs/core/sys.js').SysAction} */
  update = (ginfo) => {
    const ents = ginfo.entMger().getEntsWithComp_t(BulletComp);

    for (const ent of ents) {
      const bcomp = ginfo.entMger().getComp_t(ent, BulletComp);
      const t2d = ginfo.entMger().getComp_t(ent, Transform2d);
      if (!bcomp || !t2d) return;

      t2d.pos = bcomp.pos
        .add(bcomp.vec.clone().mul(ginfo.time.dt * 0.001))
        .clone();
      t2d.rot = bcomp.rot;

      if (
        t2d.pos.x < -50 ||
        t2d.pos.x > this.canvas.width + 50 ||
        t2d.pos.y < -50 ||
        t2d.pos.y > this.canvas.height + 50
      )
        ginfo.entMger().destroyEnt(ent);
    }
  };
}

const POLY2DCOL_RECT = Polygon2dCollider.fromRect(40, 25);

/**
 * @param {import("../ecs/core/entMger.js").default} entMger
 * @param {import("../ecs/util/vector2d.js").default} dir
 * @param {number} spd
 * @param {import("../ecs/util/vector2d.js").default} pos
 * @param {number} rot
 */
export default function createBullet(entMger, dir, spd, pos, rot) {
  const id = entMger.createEnt();
  const t2d = new Transform2d([0, 0]);
  let sprite = new Sprite({
    rot: 0,
    width: 40,
    height: 25,
  });
  const bcomp = new BulletComp(dir, spd, pos, rot);

  loadImage(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsf53D6qW-r1u5qULvvnESTXHirMs-m6ASJA&s',
  ).then((img) => {
    sprite.image = img;

    entMger.addComps(id, POLY2DCOL_RECT, t2d, sprite, bcomp);
  });
}
