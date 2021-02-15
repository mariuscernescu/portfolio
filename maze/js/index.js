'use strict';


const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;


const selectionDiv = document.querySelector(".start");
const startbtn = document.querySelector("#startbtn");
let level;

const startGame = function () {
  document.querySelector(".currentlvl").classList.remove("hidden");

  if (!level) {
    document.querySelector(".instructions").classList.remove("hidden");
    setTimeout(function () {
      document.querySelector(".instructions").classList.add("hidden");
    }, 4500);
  }

  setTimeout(function () {
    document.querySelector(".currentlvl").classList.add("hidden");
  }, 4500);

  if (!selectionDiv.classList.contains("hidden")) {
    selectionDiv.classList.add("hidden");
  }

  if (!level) {
    level = Number(document.querySelector("#level").value);
    document.querySelector(".currentlvl__lvl").innerHTML = level;
  } else {
    document.querySelector(".currentlvl__lvl").innerHTML = level;
  }

  const cellsVertical = 4 + 2 * level;
  const cellsHorizontal = 5 + 2 * (level * 2);

  const width = window.innerWidth * 1;
  const height = window.innerHeight * 0.995;
  let speed;
  let negSpeed;

  if (level < 9) {
    speed = 10 - level;
    negSpeed = -10 + level;

    // console.log({speed}, {negSpeed});
  } else {
    speed = 10 - level + 2;
    negSpeed = -10 + level - 2;

    // console.log({speed}, {negSpeed});
  }

  const unitLenghtX = width / cellsHorizontal;
  const unitLenghtY = height / cellsVertical;

  const engine = Engine.create();
  engine.world.gravity.y = 0;
  const { world } = engine;
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: false,
      width,
      height,
      background: "#c6d7c7",
    },
  });

  // console.log({level});
  // console.log({cellsVertical});
  // console.log({cellsHorizontal});

  Render.run(render);
  let runner = Runner.create();
  Runner.run(runner, engine);

  // Walls
  const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
  ];
  World.add(world, walls);

  // Maze generation

  const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
      const index = Math.floor(Math.random() * counter);

      counter--;

      const temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
    }

    return arr;
  };

  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

  const horisontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);

  const stepThroughCell = (row, column) => {
    // If I have visited the cell return
    if (grid[row][column]) {
      return;
    }
    // Mark this cell as being visited
    grid[row][column] = true;
    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
      [row - 1, column, "up"],
      [row, column + 1, "right"],
      [row + 1, column, "down"],
      [row, column - 1, "left"],
    ]);

    // For each neighbor..
    for (let neighbor of neighbors) {
      const [nextRow, nextColumn, direction] = neighbor;

      // See if neighbor is out of bounds, if we have visited that neighbor
      if (
        [nextRow, nextColumn].some((axis) => axis < 0)
        || nextRow >= cellsVertical
        || nextColumn >= cellsHorizontal
        || grid[nextRow][nextColumn]
      ) {
        continue;
      }

      // Remove a wall
      if (direction === "left") {
        verticals[row][column - 1] = true;
      } else if (direction === "right") {
        verticals[row][column] = true;
      } else if (direction === "up") {
        horisontals[row - 1][column] = true;
      } else if (direction == "down") {
        horisontals[row][column] = true;
      }

      stepThroughCell(nextRow, nextColumn);
    }
  };

  stepThroughCell(startRow, startColumn);

  horisontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLenghtX + unitLenghtX / 2,
        rowIndex * unitLenghtY + unitLenghtY,
        unitLenghtX,
        5,
        {
          label: "wall",
          isStatic: true,
          render: {
            fillStyle: "#595959",
          },
        }
      );
      World.add(world, wall);
    });
  });

  verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLenghtX + unitLenghtX,
        rowIndex * unitLenghtY + unitLenghtY / 2,
        5,
        unitLenghtY,
        {
          label: "wall",
          isStatic: true,
          render: {
            fillStyle: "#595959",
          },
        }
      );
      World.add(world, wall);
    });
  });

  // Goal

  const goal = Bodies.rectangle(
    width - unitLenghtX / 2,
    height - unitLenghtY / 2,
    unitLenghtX * 0.7,
    unitLenghtY * 0.7,
    {
      label: "goal",
      isStatic: true,
      render: {
        fillStyle: "#3b755f",
      },
    }
  );
  World.add(world, goal);

  // Ball

  const ballRadius = Math.min(unitLenghtX, unitLenghtY) / 3;
  const ball = Bodies.circle(unitLenghtX / 2, unitLenghtY / 2, ballRadius, {
    label: "ball",
    render: {
      fillStyle: "#ed4a31",
    },
  });
  World.add(world, ball);

  // Make the ball move when you press key
  document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity;

    if (event.key === "ArrowUp") {
      Body.setVelocity(ball, { x, y: negSpeed });
    }
    if (event.key === "ArrowRight") {
      Body.setVelocity(ball, { x: speed, y });
    }
    if (event.key === "ArrowDown") {
      Body.setVelocity(ball, { x, y: speed });
    }
    if (event.key === "ArrowLeft") {
      Body.setVelocity(ball, { x: negSpeed, y });
    }
  });

  // Make the ball stop when you lift you finger
  document.addEventListener("keyup", (event) => {
    const { x, y } = ball.velocity;

    if (event.key === "ArrowUp") {
      Body.setVelocity(ball, { x, y: 0 });
    }
    if (event.key === "ArrowRight") {
      Body.setVelocity(ball, { x: 0, y });
    }
    if (event.key === "ArrowDown") {
      Body.setVelocity(ball, { x, y: 0 });
    }
    if (event.key === "ArrowLeft") {
      Body.setVelocity(ball, { x: 0, y });
    }
  });

  // Win Condition

  Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const labels = ["ball", "goal"];

      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        if (level == 10) {
          document.querySelector(".winner").classList.remove("hidden");
          world.gravity.y = 1;
          world.bodies.forEach((body) => {
            if (body.label === "wall") {
              Body.setStatic(body, false);
            }
          });
        } else {
          // Win effect

          world.gravity.y = 1;
          world.bodies.forEach((body) => {
            if (body.label === "wall") {
              Body.setStatic(body, false);
            }
          });

          // Stop the current game after delay
          document.querySelector(".winner2").classList.remove("hidden");
          setTimeout(function () {
            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            Matter.Render.stop(render);
            Runner.stop(runner);
            render.canvas.remove();
            render.canvas = null;
            render.context = null;
            render.textures = {};
            level += 1;
            document.querySelector(".winner2").classList.add("hidden");
            startGame();
          }, 1700);
        }
      }
    });
  });
};

startbtn.addEventListener("click", startGame);
