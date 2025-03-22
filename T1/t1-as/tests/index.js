import {describe, it} from 'node:test';
import assert from 'node:assert';
import {greedy_snake_move} from "../build/release.js";

function greedy_snake_fn_checker(snake, food) {
    let now_snake = [...snake];
    let turn = 1;
    const steps = [];
    while (true) {
        const result = greedy_snake_move(now_snake, food);
        steps.push(result);
        const dx = result === 3 ? 1 : result === 1 ? -1 : 0;
        const dy = result === 0 ? 1 : result === 2 ? -1 : 0;
        const newX = now_snake[0] + dx;
        const newY = now_snake[1] + dy;

        if (newX < 1 || newX > 8 || newY < 1 || newY > 8) {
            return {code: -1, steps};
        }

        for (let i = 2; i < now_snake.length - 2; i += 2) {
            if (newX === now_snake[i] && newY === now_snake[i + 1]) {
                return {code: -2, steps};
            }
        }

        if (newX === food[0] && newY === food[1]) {
            return {code: turn, steps};
        }

        const new_snake = [newX, newY];
        for (let i = 0; i < now_snake.length - 2; i++) {
            new_snake.push(now_snake[i]);
        }
        now_snake = new_snake;

        if (turn++ >= 200) {
            return {code: -3, steps};
        }
    }
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

describe('Greedy Snake Random Tests', () => {
    const testCount = 300000;
    for (let i = 0; i < testCount; i++) {
        it(`should pass random test ${i + 1}`, () => {
            const snake = generateRandomSnake();
            const food = generateFood(snake);
            const result = greedy_snake_fn_checker(snake, food);
            assert.ok(result.code >= 0, `
                Test failed for:
                Snake: [${snake}]
                Food: [${food}]
                Result code: ${result.code}
                Steps taken: ${result.steps.join(', ')}
            `);
        });
    }
});
