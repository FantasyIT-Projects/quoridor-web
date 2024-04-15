// 棋盘操作逻辑

const CHESS_INITIAL_POS = [
    [4,0],
    [0,4],
    [4,8],
    [8,4],
]

/**
 * 更新棋子在棋盘操作数组中的位置
 *
 * @param {Number} id 玩家的局内id
 * @param {Array} board 棋盘操作数组
 * @param {Array} newXY 新棋子的坐标
 * @param {Array} [oldXY] 旧棋子的坐标
 * @return {Array} 更新后的棋盘操作数组
 * @author ChiyukiRuon
 * */
export function updateChessInBoard(id, board, newXY, oldXY) {
    const newX = newXY[0] * 2 + 1
    const newY = newXY[1] * 2 + 1
    let gameBoard = JSON.parse(JSON.stringify(board))
    if (oldXY) {
        const oldX = oldXY[0] * 2 + 1
        const oldY = oldXY[1] * 2 + 1

        gameBoard[oldX][oldY] = -1
    }

    try {
        gameBoard[newX][newY] = id
    }catch (e) {
        console.error(e)
    }

    return gameBoard
}

/**
 * 更新棋盘操作数组中的墙
 *
 * @param {Array} board 棋盘操作数组
 * @param {Array} position 墙的起始与结束位置
 * @return {Array} 更新后的棋盘操作数组
 * @author ChiyukiRuon
 * */
export function updateWallInBoard(board, position) {
    let gameBoard = JSON.parse(JSON.stringify(board))
    let startX = position[0][0] * 2
    let startY = position[0][1] * 2
    let endX = position[1][0] * 2
    let endY = position[1][1] * 2

    if (startX === endX) {
        for (let i = startY + 1; i <= endY - 1; i++) {
            gameBoard[startX][i] = -2
        }
    } else if (startY === endY) {
        for (let i = startX + 1; i <= endX - 1; i++) {
            gameBoard[i][startY] = -2
        }
    }

    return gameBoard
}

/**
 * 计算墙的起始坐标与终点坐标
 *
 * @param {String} position 墙相对于棋子坐标系的位置
 * @param {Number} x X坐标
 * @param {Number} y Y坐标
 * @return {Array} 起始坐标与终点坐标
 * @author ChiyukiRuon
 * */
export function calcWall(position, x, y) {
    let startX, startY, endX, endY

    if (position === 'right') {
        if (y === 8) {
            startY = y - 1
            endY = y + 1
        } else {
            startY = y
            endY = y + 2
        }

        startX = x + 1
        endX = x + 1
    } else {
        if (x === 8) {
            startX = x - 1
            endX = x + 1
        } else {
            startX = x
            endX = x + 2
        }

        startY = y
        endY = y
    }

    return [[startX, startY], [endX, endY]]
}

/**
 * 判断是否能建墙
 *
 * @param {Number} startX 墙的起始X坐标
 * @param {Number} startY 墙的起始Y坐标
 * @param {Number} endX 墙的终点X坐标
 * @param {Number} endY 墙的终点Y坐标
 * @param {Array} gameBoard 棋盘详情
 * @return {Boolean} 能否建墙
 * @author ChiyukiRuon
 * */
export function judgeWall(startX, startY, endX, endY, gameBoard) {
    startX = startX * 2
    startY = startY * 2
    endX = endX * 2
    endY = endY * 2

    let allTrue = true
    for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) {
            if (gameBoard[i][j] === -1) {
                allTrue = false
                break
            }
        }

        if (!allTrue) break
    }

    if (allTrue) return false

    //墙条件1：长度必须为2
    if (endX - startX + endY - startY !== 2 * 2) {
        return false
    }
    //墙条件2：平行于x or y
    if (!(startX === endX || startY === endY)) {
        return false
    }

    if (startX === endX) {
        for (let i = startY + 1; i <= endY - 1; i++) {
            if (gameBoard[startX][i] !== -1) {
                return false
            }
        }
    } else if (startY === endY) {
        for (let i = startX + 1; i <= endX - 1; i++) {
            if (gameBoard[i][startY] !== -1) {
                return false
            }
        }
    }

    return true
}

/**
 * 两个点之间是否有墙间隔
 *
 * @param {Number} x1 点1x
 * @param {Number} y1 点1y
 * @param {Number} x2 点2x
 * @param {Number} y2 点2y
 * @param {Array} gameBoard 棋盘详情
 * @return {Boolean} 是否有墙间隔
 * @author xypp
 */
export function isWallBetween(x1, y1, x2, y2, gameBoard) {
    if (x1 > x2)
        [x1, x2] = [x2, x1];
    if (y1 > y2)
        [y1, y2] = [y2, y1];
    x1 = (x1 * 2 + 1);
    y1 = (y1 * 2 + 1);
    x2 = (x2 * 2 + 1);
    y2 = (y2 * 2 + 1);
    if (x1 === x2) {
        for (let i = y1 + 1; i <= y2; i += 2) {
            if (gameBoard[x1][i] !== -1)
                return true;
        }
    } else if (y1 === y2) {
        for (let i = x1 + 1; i <= x2; i += 2) {
            if (gameBoard[i][y1] !== -1)
                return true;
        }
    }
    return false;
}

const _dxy = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
]
/**
 * 判断未来棋盘是否构成围死状况
 *
 * @param {Array} game 玩家起始位置及当前位置数组
 * @param {Array} gameBoard 未来棋盘对象
 * @param {Array} wallPos 墙位置
 * @returns {Boolean} 是否围死
 * @author xypp
 */
export function isNoPathOut(game, gameBoard, wallPos) {
    const nextPad = updateWallInBoard(gameBoard, wallPos)

    let reachable = [];
    for (let i = 0; i < 9; i++) {
        reachable.push([]);
        for (let j = 0; j < 9; j++) {
            reachable[i].push(-1);
        }
    }

    const dfsCheck = (x, y, checkId) => {
        if (x < 0 || x >= 9 || y < 0 || y >= 9) {
            return;
        }
        if (reachable[x][y] === checkId) {
            return;
        }
        reachable[x][y] = checkId;

        for (let i = 0; i < 4; i++) {
            if (x + _dxy[i][0] < 0 || x + _dxy[i][0] >= 9 || y + _dxy[i][1] < 0 || y + _dxy[i][1] >= 9)
                continue;
            if (!isWallBetween(x, y, x + _dxy[i][0], y + _dxy[i][1], nextPad))
                dfsCheck(x + _dxy[i][0], y + _dxy[i][1], checkId);
        }
    }

    for (let idx = 0; idx < game.length; idx++) {
        const player = game[idx].start;
        let chessOk = false;
        let xRange = [0, 8];
        let yRange = [0, 8];
        switch (player.join(',')) {
            case CHESS_INITIAL_POS[0].join(','):/*[4,0]*/yRange = [8, 8];break;
            case CHESS_INITIAL_POS[1].join(','):/*[0,4]*/xRange = [8, 8];break;
            case CHESS_INITIAL_POS[2].join(','):/*[4,8]*/yRange = [0, 0];break;
            case CHESS_INITIAL_POS[3].join(','):/*[8,4]*/xRange = [0, 0];break;
            default:continue;
        }
        const [cx,cy] = game[idx].position;
        for (let i = xRange[0]; i <= xRange[1]; i++) {
            for (let j = yRange[0]; j <= yRange[1]; j++) {
                dfsCheck(i, j, idx);
                if(reachable[cx][cy] === idx){
                    chessOk = true;
                    break;
                }
            }
            if(chessOk) break;
        }
        if(!chessOk){
            return true;
        }
    }
    return false;
}