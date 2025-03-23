export function greedy_snake_step(n: i32, snake: i32[], snake_num: i32, snakes: i32[], food_num: i32, foods: i32[], round: i32): i32 {
    const grid = new Array<Array<i32>>(n + 1);
    const food_value = new Array<i32>(food_num);
    const gamma = 0.5;
    const base_value = 10000;
    for (let i = 0; i <= n; i++) {
        grid[i] = new Array<i32>(n + 1).fill(0);
    }
    for (let i = 0; i < food_num; i++) {
        food_value[i] = base_value;
    }

    for (let i = 2; i < 6; i += 2) {
        grid[snake[i]][snake[i + 1]] = i32.MIN_VALUE / 2;
    }

    for (let i = 0; i < snakes.length - 1; i += 8) {
        const x1 = snakes[i];
        const y1 = snakes[i + 1];
        grid[x1][y1] = i32.MIN_VALUE / 2;
        for (let dir = 0; dir < 4; dir++) {
            const direction = [[-1, 0], [1, 0], [0, -1], [0, 1]][dir];
            const dx = direction[0];
            const dy = direction[1];
            const nx = x1 + dx;
            const ny = y1 + dy;
            if (nx >= 1 && nx <= n && ny >= 1 && ny <= n) {
                const randValue = Math.random();
                if (randValue > 0.3 || snake_num >= 2)
                    grid[nx][ny] -= (base_value * 4) as i32;
                else
                    grid[nx][ny] -= (base_value * 0.4) as i32;
            }
        }

        // 处理第二个节点 (x2,y2)
        const x2 = snakes[i + 2];
        const y2 = snakes[i + 3];
        grid[x2][y2] = i32.MIN_VALUE / 2;
        // 处理第三个节点 (x3,y3)
        const x3 = snakes[i + 4];
        const y3 = snakes[i + 5];
        grid[x3][y3] = i32.MIN_VALUE / 2;
    }

    for (let k = 0; k < snake_num; ++k) {
        const decrease: f64 = (base_value / 2 as f64) / (snake_num as f64);
        const snakeX = snakes[8 * k];
        const snakeY = snakes[8 * k + 1];

        const foodInfos = new Array<Array<f64>>(food_num);
        for (let id = 0; id < food_num; id++) {
            const foodX = foods[2 * id];
            const foodY = foods[2 * id + 1];

            const distance = abs(foodX - snakeX) + abs(foodY - snakeY);
            foodInfos[id] = [id as f64, distance as f64];
        }

        foodInfos.sort((a, b) => {
            return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
        });

        for (let t = 0; t < foodInfos.length; t++) {
            const foodId = foodInfos[t][0] as i32;
            const decay = Math.pow(gamma, t as f64);
            const reduction = decrease * decay;

            food_value[foodId] -= Math.round(reduction) as i32;
        }
    }

    for (let x: i32 = 1; x <= n; x++) {
        for (let y: i32 = 1; y <= n; y++) {
            if (grid[x][y] === i32.MIN_VALUE / 2) continue;

            const foodDistances = new Array<Array<f64>>(food_num);
            for (let id = 0; id < food_num; id++) {
                const fx = foods[2 * id];
                const fy = foods[2 * id + 1];
                const dist = abs(fx - x) + abs(fy - y);
                foodDistances[id] = [id as f64, dist as f64];
            }
            let count = 0;
            let snake = 0;
            if (x == 1 || x == n) count++;
            if (y == 1 || y == n) count++;
            for (let i = 0; i < snakes.length; i += 2) {
                if (i % 8 != 6) {
                    if (abs(x - snakes[i]) + abs(y - snakes[i + 1]) <= 1) {
                        count++;
                        snake = 1;
                    }
                }
            }
            if (count == 3) grid[x][y] -= 4 * base_value;
            else if (count == 2 && snake == 1) grid[x][y] -= 3 * base_value;

            if (food_num > 0) {
                foodDistances.sort((a, b) =>
                    a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0
                );

                let total = 0.0;
                const takeNum = Math.min(4, food_num) as i32;
                for (let t = 0; t < takeNum; t++) {
                    const foodId = foodDistances[t][0] as i32;
                    const dist = foodDistances[t][1];

                    total += (food_value[foodId] as f64) *
                        Math.exp(-dist);
                }

                grid[x][y] += Math.round(total) as i32;
            }
        }
    }
    // for (let i = 1; i <= n; i++) {
    //     grid[n][i] -= Math.round(base_value * 0.2) as i32;
    //     grid[1][i] -= Math.round(base_value * 0.2) as i32;
    //     grid[i][n] -= Math.round(base_value * 0.2) as i32;
    //     grid[i][1] -= Math.round(base_value * 0.2) as i32;
    // }

    const corners = [
        [1, 1],    // 左上
        [1, n],    // 右上
        [n, 1],    // 左下
        [n, n]     // 右下
    ];

    for (let c = 0; c < corners.length; c++) {
        const cornerX = corners[c][0];
        const cornerY = corners[c][1];

        for (let k = 0; k < snake_num; k++) {
            const snakeHeadX = snakes[8 * k];
            const snakeHeadY = snakes[8 * k + 1];
            const dist = abs(snakeHeadX - cornerX) + abs(snakeHeadY - cornerY);
            if (dist <= 2) {
                grid[cornerX][cornerY] -= base_value * 3;
                for (let k = 0; k < food_num; ++k)
                    if (foods[2 * k] == cornerX && foods[2 * k + 1] == cornerY) {
                        food_value[k] /= 2;
                    }
                break;
            }
            if (dist <= 4){
                for (let k = 0; k < food_num; ++k)
                    if (foods[2 * k] == cornerX && foods[2 * k + 1] == cornerY) {
                        food_value[k] = Math.round(food_value[k] * 0.8) as i32;
                    }
            }
        }
    }

    const lcorners = [
        [1, 2],
        [1, n - 1],
        [2, 1],
        [2, n],
        [n - 1, 1],
        [n - 1, n],
        [n, 2],
        [n, n - 1]
    ];

    for (let c = 0; c < lcorners.length; c++) {
        const cornerX = lcorners[c][0];
        const cornerY = lcorners[c][1];

        for (let k = 0; k < snake_num; k++) {
            const snakeHeadX = snakes[8 * k];
            const snakeHeadY = snakes[8 * k + 1];
            const dist = abs(snakeHeadX - cornerX) + abs(snakeHeadY - cornerY);
            if (dist <= 1) {
                grid[cornerX][cornerY] -= base_value;
                break;
            } else if (dist <= 2) {
                grid[cornerX][cornerY] -= Math.round(base_value * 0.7) as i32;
                break;
            }
        }
    }


    const headX = snake[0];
    const headY = snake[1];

    let maxValue = i32.MIN_VALUE;
    let bestDir = 0;

    if (headY < n) {
        const value = grid[headX][headY + 1];
        if (value > maxValue) {
            maxValue = value;
            bestDir = 0;
        }
    }

    if (headX > 1) {
        const value = grid[headX - 1][headY];
        if (value > maxValue) {
            maxValue = value;
            bestDir = 1;
        }
    }

    if (headY > 1) {
        const value = grid[headX][headY - 1];
        if (value > maxValue) {
            maxValue = value;
            bestDir = 2;
        }
    }

    if (headX < n) {
        const value = grid[headX + 1][headY];
        if (value > maxValue) {
            bestDir = 3;
        }
    }

    return bestDir;

}   
