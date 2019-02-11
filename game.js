"use strict";
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vect) {
    if (!(vect instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
    }
    return new Vector(this.x + vect.x, this.y + vect.y);
  }

  times(factor) {
    return new Vector(this.x * factor, this.y * factor);;
  }
}
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
////////////////////////////////////////////

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
    return this.status !== null && this.finishDelay < 0;
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
      };
    };
  };
  removeActor(actor) {
    const actorIndex = this.actors.indexOf(actor);
    if (actorIndex !== -1) {
      this.actors.splice(actorIndex, 1);
    }
  }
  noMoreActors(type) {
    return !this.actors.find(el => el.type === type)
  }
  playerTouched(typeofObject, actor) {

    if (typeofObject === `lava` || typeofObject === `fireball`) {
      this.status = `lost`;
    }
    if (typeofObject === "coin" && actor.type === "coin") {
      this.removeActor(actor);
      if (this.noMoreActors("coin")) {
        return (this.status = "won");
      }
    };
  };
};
//////////////////////////////////////////////////////////////////////////////
class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = dictionary;
  }
  actorFromSymbol(symbol) {
    if (symbol && this.dictionary) {
      return this.dictionary[symbol];
    };
  };
  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return `wall`
    }
    if (symbol === '!') {
      return `lava`
    };
  };
  createGrid(arryString) {
    let arryMap = arryString.map(line => line.split(''))
    arryMap = arryMap.map(line => line.map(line => this.obstacleFromSymbol(line)));
    return arryMap
  }
  createActors(arryString) {
    return arryString.reduce((previewElement, currentElement, y) => {
      currentElement.split('').forEach((itemX, x) => {
        const objectActor = this.actorFromSymbol(itemX);
        if (typeof objectActor === 'function') {
          const actor = new objectActor(new Vector(x, y));
          if (actor instanceof Actor) {
            previewElement.push(actor);
          }
        }
      });
      return previewElement;
    }, []);
  };

  parse(arryString) {
    return new Level(this.createGrid(arryString), this.createActors(arryString));
  };
};
/////////////////////////////////////////////////////////////////////////////////
class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
  act(time, grid) {
    const nextPos = this.getNextPosition(time);
    if (grid.obstacleAt(nextPos, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPos
    };
  };
};
////////////////////////////////////////////////////////////////
class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0));
  };
};
/////////////////////////////////////////////////////////////
class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2));
  };
};
//////////////////////////////////////////////////////////
class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3));
    this.startPos = this.pos;
  }
  handleObstacle() {
    this.pos = this.startPos;
  };
};
/////////////////////////////////////////////////////////
class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.spring = Math.random() * (Math.PI * 2);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.startPos = this.pos;
  }
  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist)
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}
/////////////////////////////////////////////////////////////

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
  }

  get type() {
    return 'player';
  }
}

const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball

};
const pars = new LevelParser(actorDict);
/////////////////////////////////////////////////////

loadLevels()
  .then((res) => {
    runGame(JSON.parse(res), pars, DOMDisplay)
      .then(() => alert('Вы выиграли!'))
  });
  ////////////////////////////////////////////////////
