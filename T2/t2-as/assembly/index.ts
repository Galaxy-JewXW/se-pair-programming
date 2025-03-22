const GRID_SIZE: i32 = 9;
const dx: i32[] = [0, 1, 0, -1];
const dy: i32[] = [-1, 0, 1, 0];

function is_valid_coordinate(x: i32, y: i32): bool {
    return x >= 1 && x <= 8 && y >= 1 && y <= 8;
}

function is_barrier(barriers: i32[], x: i32, y: i32): bool {
    for (let i = 0; i < barriers.length / 2; i++) {
        if (barriers[i * 2] == x && barriers[i * 2 + 1] == y) {
            return true;
        }
    }
    return false;
}

class Position {
    x: i32;
    y: i32;

    constructor(x: i32, y: i32) {
        this.x = x;
        this.y = y;
    }
}

class Queue<T> {
    private items: Array<T>;

    constructor() {
        this.items = new Array<T>();
    }

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | null {
        if (this.items.length > 0) {
            return this.items.shift();
        }
        return null;
    }

    isEmpty(): bool {
        return this.items.length === 0;
    }
}

function findShortestPath(
    startX: i32,
    startY: i32,
    endX: i32,
    endY: i32,
    firstForbiddenX: i32,
    firstForbiddenY: i32,
    barriers: i32[]
): i32[] {
    // BFS
    let visited = new Int8Array(GRID_SIZE * GRID_SIZE);
    let parentX = new Int32Array(GRID_SIZE * GRID_SIZE);
    let parentY = new Int32Array(GRID_SIZE * GRID_SIZE);

    let queue = new Queue<Position>();
    queue.enqueue(new Position(startX, startY));

    visited[startY * GRID_SIZE + startX] = 1;
    let found = false;

    while (!queue.isEmpty()) {
        let current = queue.dequeue();
        if (current == null) continue;

        let x = current.x;
        let y = current.y;

        if (x == endX && y == endY) {
            found = true;
            break;
        }

        for (let i = 0; i < 4; i++) {
            let newX = x + dx[i];
            let newY = y + dy[i];
            if (x == startX && y == startY && newX == firstForbiddenX && newY == firstForbiddenY) {
                continue;
            }
            if (is_valid_coordinate(newX, newY) && !is_barrier(barriers, newX, newY)) {
                if (visited[newY * GRID_SIZE + newX] == 0) {
                    visited[newY * GRID_SIZE + newX] = 1;
                    parentX[newY * GRID_SIZE + newX] = x;
                    parentY[newY * GRID_SIZE + newX] = y;
                    queue.enqueue(new Position(newX, newY));
                }
            }
        }
    }

    let path: i32[] = [];
    if (found) {
        let x = endX;
        let y = endY;
        while (!(x == startX && y == startY)) {
            path.unshift(y);
            path.unshift(x);

            let parentIndex = y * GRID_SIZE + x;
            let tempX = parentX[parentIndex];
            let tempY = parentY[parentIndex];
            x = tempX;
            y = tempY;
        }
        path.unshift(startY);
        path.unshift(startX);
    }
    return path;
}

export function greedySnakeMoveBarriers(snake: i32[], food: i32[], barriers: i32[]): i32 {
    // 各方向有效性
    const visited: i32[][] = new Array<Array<i32>>(10);
    for (let i = 0; i <= 9; i++) {
        visited[i] = new Array<i32>(10).fill(0);
    }
    for (let i = 0; i < barriers.length; i += 2) {
        visited[barriers[i]][barriers[i + 1]] = -1;
    }
    visited[snake[0]][snake[1]] = 1;

    for (let i = 0; i <= 16; i++) {
        for (let j = 1; j <= 8; j++) {
            for (let k = 1; k <= 8; k++) {
                if (visited[j][k] >= 0) {
                    if (visited[j - 1][k] == 1 || visited[j + 1][k] == 1 || visited[j][k - 1] == 1 || visited[j][k + 1] == 1) {
                        visited[j][k] = 1;
                    }
                }
            }
        }
    }
    if (visited[food[0]][food[1]] < 1) {
        return -1;
    }
    const path = findShortestPath(snake[0], snake[1], food[0], food[1], snake[2], snake[3], barriers);
    if (path[2] == snake[0]) {
        if (path[3] > snake[1]) return 0;
        else return 2;
    } else {
        if (path[2] > snake[0]) return 3;
        else return 1;
    }
}
