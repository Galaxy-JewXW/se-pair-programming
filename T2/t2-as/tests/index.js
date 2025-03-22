import {describe, it} from 'node:test';
import assert from 'node:assert';
import {greedySnakeMoveBarriers} from "../build/release.js";

function greedy_snake_barriers_checker(initial_snake, food_num, foods, barriers, access) {
    if (initial_snake.length !== 8) throw "Invalid snake length";

    let current_snake = [...initial_snake];
    let current_foods = [...foods];
    const barriers_list = [];
    for (let i = 0; i < barriers.length; i += 2) {
        const x = barriers[i];
        const y = barriers[i + 1];
        if (x !== -1 && y !== -1) {
            barriers_list.push({x, y});
        }
    }
    let turn = 1;

    while (turn <= 200) {
        const direction = greedySnakeMoveBarriers(current_snake, current_foods, barriers);

        if (access === 0) {
            if (direction !== -1) {
                return -5;
            } else {
                return 1;
            }
        }

        // invalid direction
        if (direction < 0 || direction > 3) {
            return -4;
        }

        let new_snake = [
            current_snake[0] + (direction == 3) - (direction == 1),
            current_snake[1] + (direction == 0) - (direction == 2),
            current_snake[0],
            current_snake[1],
            current_snake[2],
            current_snake[3],
            current_snake[4],
            current_snake[5],
        ];


        // out of range
        if (new_snake[0] < 1 || new_snake[0] > 8 || new_snake[1] < 1 || new_snake[1] > 8) {
            console.log("out of range");
            return -1;
        }

        // hit a barrier
        if (barriers_list.some(ob => ob.x === new_snake[0] && ob.y === new_snake[1])) {
            console.log("hit a barrier");
            return -2;
        }

        // eat food
        let ate_index = -1;
        for (let i = 0; i < current_foods.length; i += 2) {
            if (new_snake[0] === current_foods[i] && new_snake[1] === current_foods[i + 1]) {
                ate_index = i;
                break;
            }
        }

        if (ate_index !== -1) {
            current_foods.splice(ate_index, 2);
            food_num -= 1;
        }

        if (food_num === 0) {
            console.log("Total turn: " + turn);
            return turn;
        }

        current_snake = new_snake;
        turn++;
    }

    // timeout
    console.log("timeout");
    return -3;
}

function generateRandomSnake() {
    const direction = Math.floor(Math.random() * 4);
    let headX, headY;
    const snake = [];
    switch (direction) {
        case 0:
            headX = Math.floor(Math.random() * 5) + 1;
            headY = Math.floor(Math.random() * 8) + 1;
            for (let i = 0; i < 4; i++) {
                snake.push(headX + i, headY);
            }
            break;
        case 1:
            headX = Math.floor(Math.random() * 5) + 4;
            headY = Math.floor(Math.random() * 8) + 1;
            for (let i = 0; i < 4; i++) {
                snake.push(headX - i, headY);
            }
            break;
        case 2:
            headY = Math.floor(Math.random() * 5) + 1;
            headX = Math.floor(Math.random() * 8) + 1;
            for (let i = 0; i < 4; i++) {
                snake.push(headX, headY + i);
            }
            break;
        case 3:
            headY = Math.floor(Math.random() * 5) + 4;
            headX = Math.floor(Math.random() * 8) + 1;
            for (let i = 0; i < 4; i++) {
                snake.push(headX, headY - i);
            }
            break;
    }
    return snake;
}

function generateFood(snake) {
    const occupied = new Set();
    for (let i = 0; i < snake.length; i += 2) {
        occupied.add(`${snake[i]},${snake[i + 1]}`);
    }
    let food;
    do {
        food = [
            Math.floor(Math.random() * 8) + 1,
            Math.floor(Math.random() * 8) + 1,
        ];
    } while (occupied.has(`${food[0]},${food[1]}`));
    return food;
}

function isPositionOccupied(x, y, snake, food) {
    for (let i = 0; i < snake.length; i += 2) {
        if (snake[i] === x && snake[i + 1] === y) {
            return true;
        }
    }
    return food[0] === x && food[1] === y;
}

function generateBarriersAccess0(snake, food) {
    const snakeHead = {x: snake[0], y: snake[1]};
    const foodPos = {x: food[0], y: food[1]};

    if (Math.abs(snakeHead.x - foodPos.x) > Math.abs(snakeHead.y - foodPos.y)) {
        const minX = Math.min(snakeHead.x, foodPos.x);
        const maxX = Math.max(snakeHead.x, foodPos.x);
        for (let x = minX + 1; x < maxX; x++) {
            let valid = true;
            for (let y = 1; y <= 8; y++) {
                if (isPositionOccupied(x, y, snake, food)) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                const barriers = [];
                for (let y = 1; y <= 8; y++) {
                    barriers.push(x, y);
                }
                return barriers;
            }
        }
    } else {
        const minY = Math.min(snakeHead.y, foodPos.y);
        const maxY = Math.max(snakeHead.y, foodPos.y);
        for (let y = minY + 1; y < maxY; y++) {
            let valid = true;
            for (let x = 1; x <= 8; x++) {
                if (isPositionOccupied(x, y, snake, food)) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                const barriers = [];
                for (let x = 1; x <= 8; x++) {
                    barriers.push(x, y);
                }
                return barriers;
            }
        }
    }
    return null;
}

function isPathAvailable(snakeHead, food, barriersSet) {
    const visited = new Set();
    const queue = [[snakeHead.x, snakeHead.y]];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        if (x === food[0] && y === food[1]) return true;
        if (visited.has(`${x},${y}`)) continue;
        visited.add(`${x},${y}`);

        for (const [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 1 && nx <= 8 && ny >= 1 && ny <= 8 &&
                !barriersSet.has(`${nx},${ny}`) &&
                !visited.has(`${nx},${ny}`)) {
                queue.push([nx, ny]);
            }
        }
    }
    return false;
}

function generateBarriersAccess1(snake, food) {
    const barriersSet = new Set();
    const occupied = new Set();
    for (let i = 0; i < snake.length; i += 2) {
        occupied.add(`${snake[i]},${snake[i + 1]}`);
    }
    occupied.add(`${food[0]},${food[1]}`);

    for (let attempt = 0; attempt < 100; attempt++) {
        barriersSet.clear();
        const barrierCount = Math.floor(Math.random() * 7) + 1;
        const tempBarriers = [];

        while (tempBarriers.length < barrierCount * 2) {
            const x = Math.floor(Math.random() * 8) + 1;
            const y = Math.floor(Math.random() * 8) + 1;
            const key = `${x},${y}`;
            if (!occupied.has(key) && !barriersSet.has(key)) {
                tempBarriers.push(x, y);
                barriersSet.add(key);
            }
        }

        if (isPathAvailable({x: snake[0], y: snake[1]}, food, new Set([...barriersSet]))) {
            return tempBarriers;
        }
    }

    throw new Error("无法生成有效障碍物");
}

describe('Greedy Snake Barriers Tests', () => {
    const testCount = 10000;
    for (let i = 0; i < testCount; i++) {
        it('should handle access=0 with blocked path', () => {
            let snake, food, barriers;
            for (let attempt = 0; attempt < 100; attempt++) {
                snake = generateRandomSnake();
                food = generateFood(snake);
                barriers = generateBarriersAccess0(snake, food);
                if (barriers) break;
            }
            if (!barriers) throw new Error('Failed to generate access=0 test case');

            try {
                const result = greedy_snake_barriers_checker(snake, 1, food, barriers, 0);
                assert.strictEqual(result, 1);
            } catch (e) {
                console.error("Error in test case (access=0):", e);
                console.log("Snake:", snake);
                console.log("Food:", food);
                console.log("Barriers:", barriers);
                throw e;
            }
        });
    }
    for (let i = 0; i < testCount; i++) {
        it('should handle access=1 with valid path', () => {
            const snake = generateRandomSnake();
            const food = generateFood(snake);
            const barriers = generateBarriersAccess1(snake, food);
            try {
                const result = greedy_snake_barriers_checker(snake, 1, food, barriers, 1);
                assert.ok(result > 0, `Expected positive result, got ${result}`);
            } catch (e) {
                console.error("Error in test case (access=1):", e);
                console.log("Snake:", snake);
                console.log("Food:", food);
                console.log("Barriers:", barriers);
                throw e;
            }
        });
    }
});
