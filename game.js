"use strict";
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vect) {
    if (vect instanceof Vector === false) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
    }
    let vectorPlus = new Vector();
    vectorPlus.x = this.x + vect.x;
    vectorPlus.y = this.y + vect.y;
    return vectorPlus;
  }
  times(factor) {
    let vectorTimes = new Vector();
    vectorTimes.x = this.x * factor;
    vectorTimes.y = this.y * factor;
    return vectorTimes;
  }
}
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
//////////////////////////////////////////////////////////////////

class Actor {
  constructor(
    pos = new Vector(0, 0),
    size = new Vector(1, 1),
    speed = new Vector(0, 0)
  ) {
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    if (
      !(pos instanceof Vector) ||
      !(size instanceof Vector) ||
      !(speed instanceof Vector)
    ) {
      throw new Error(`Можно прибавлять Actor только тип Vector`);
    }
  }
  get type() {
    return "actor";
  }
  act() {
    return;
  }
  get left() {
    return this.pos.x;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get top() {
    return this.pos.y;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error(`Не передан объект типа Actor`);
    }
    if (this === actor) {
      return false;
    }
    return (
      this.right > actor.left &&
      this.left < actor.right &&
      this.top < actor.bottom &&
      this.bottom > actor.top
    );
  }
}
// const items = new Map();
// const player = new Actor();
// items.set("Игрок", player);
// items.set("Первая монета", new Actor(new Vector(10, 10)));
// items.set("Вторая монета", new Actor(new Vector(15, 5)));

// function position(item) {
//   return ["left", "top", "right", "bottom"]
//     .map(side => `${side}: ${item[side]}`)
//     .join(", ");
// }

// function movePlayer(x, y) {
//   player.pos = player.pos.plus(new Vector(x, y));
// }

// function status(item, title) {
//   console.log(`${title}: ${position(item)}`);
//   if (player.isIntersect(item)) {
//     console.log(`Игрок подобрал ${title}`);
//   }
// }

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);
/////////////////////////////////////////////////////////////////////////////////////////////////
class Level {
  constructor(grid = [], actors = []) {
    this.actors = actors.slice();
    this.grid = grid.slice();
    this.height = this.grid.length;
    this.width = 0;
    if (this.grid.length > 0) {
      this.width = Math.max(...this.grid.map(el => el.length));
    }
    this.status = null;
    this.finishDelay = 1;
    this.player = this.actors.find(actore => actore.type === "player");
  }
  isFinished() {
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    }
    return false;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error(`Не передан объект типа Actor или нет аргумента `);
    }
    return this.actors.find(actore => actore.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if (!(position instanceof Vector) || !(size instanceof Vector)) {
      throw new Error(`передан не Vector`);
    }

    const leftBorder = Math.floor(position.x);
    const topBorder = Math.floor(position.y);
    const rightBorder = Math.ceil(position.x + size.x);
    const bottomBorder = Math.ceil(position.y + size.y);

    if (leftBorder < 0 || rightBorder > this.width || topBorder < 0) {
      return `wall`;
    }
    if (bottomBorder > this.height) {
      return `lava`;
    }

    for (let x = leftBorder; x < rightBorder; x++) {
      for (let y = topBorder; y < bottomBorder; y++) {
        if (this.grid[y][x] === `wall` || this.grid[y][x] === `lava`) {
          return this.grid[y][x];
        }
      }
    }
  }
  removeActor(actor) {
    const actorIndex = this.actors.indexOf(actor);
    if (actorIndex !== -1) {
      this.actors.splice(actorIndex, 1);
    }
  }
  noMoreActors(type) {
    if (this.actors.find(el => el.type === type)) {
      return false;
    }
    return true;
  }
  playerTouched(typeofObject, actor) {
    if (this.status !== null) {
      return;
    }
    if (typeofObject === `lava` || typeofObject === `fireball`) {
      this.status = `lost`;
    }
    if (typeofObject === "coin" && actor.type === "coin") {
      this.removeActor(actor);
      if (this.noMoreActors("coin")) {
        return (this.status = "won");
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////

// const grid = [
//   [undefined, undefined],
//   ['wall', 'wall']
// ];

// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;

// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();

// const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);

// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }

// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }

// const otherActor = level.actorAt(player);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }

