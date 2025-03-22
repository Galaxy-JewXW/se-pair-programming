function is_valid_direction(snake: i32[], idx: i32, idy: i32): bool {
    // 检查是否与身体其他部分碰撞
    for (let i = 0; i < snake.length - 2; i += 2) {
        if (snake[0] + idx === snake[i] && snake[1] + idy === snake[i + 1]) {
            return false;
        }
    }
    // 检查边界有效性
    const newX = snake[0] + idx;
    const newY = snake[1] + idy;
    return newX >= 1 && newX <= 8 && newY >= 1 && newY <= 8;
}

export function greedy_snake_move(snake: i32[], food: i32[]): i32 {
    // 各方向有效性
    const up = is_valid_direction(snake, 0, 1);
    const down = is_valid_direction(snake, 0, -1);
    const left = is_valid_direction(snake, -1, 0);
    const right = is_valid_direction(snake, 1, 0);
    // 各方向权值
    const up_val = up ? (food[1] > snake[1] ? 1 : 0) : -1;
    const down_val = down ? (food[1] < snake[1] ? 1 : 0) : -1;
    const left_val = left ? (food[0] < snake[0] ? 1 : 0) : -1;
    const right_val = right ? (food[0] > snake[0] ? 1 : 0) : -1;
    // 比较寻找最优方向
    let maxVal = up_val;
    let maxCode: i32 = 0;
    if (left_val > maxVal) {
        maxVal = left_val;
        maxCode = 1;
    }
    if (down_val > maxVal) {
        maxVal = down_val;
        maxCode = 2;
    }
    if (right_val > maxVal) {
        maxCode = 3;
    }
    return maxCode;
}
