<template>
    <div class="board" :key="refresh">
        <div v-for="row in 9" :key="row" class="row">
            <div v-for="column in 9" :key="column" class="column">
                <div style="display: flex">
                    <div v-if="column === 1" class="number">{{ 10 - row }}</div>
                    <div class="cell" :ref="(column - 1) + ',' + (9 - row)"
                        @click.prevent="moveChess(column - 1, 9 - row)" @mouseover="mouseOnSquare(column - 1, 9 - row)"
                        @mouseleave="mouseLeaveSquare(column - 1, 9 - row)"></div>
                    <div class="column-gap" v-if="column !== 9"
                        :ref="(column) + ',' + (9 - row) + 'to' + (column) + ',' + (10 - row)"
                        @mouseover="mouseOnGap('right', column - 1, 9 - row)"
                        @mouseleave="mouseLeaveGap('right', column - 1, 9 - row)"
                        @click.prevent="setWall('right', column - 1, 9 - row)"></div>
                </div>
                <div style="display: flex; justify-content: flex-end">
                    <div class="row-gap" v-if="row !== 9"
                        :ref="(column - 1) + ',' + (9 - row) + 'to' + (column) + ',' + (9 - row)"
                        @mouseover="mouseOnGap('bottom', column - 1, 9 - row)"
                        @mouseleave="mouseLeaveGap('bottom', column - 1, 9 - row)"
                        @click.prevent="setWall('bottom', column - 1, 9 - row)"></div>
                    <div class="cross" v-if="row !== 9 && column !== 9" :ref="'cross' + (column) + ',' + (9 - row)">
                    </div>
                </div>
                <div v-if="row === 9 && column !== 9" class="number" style="float: right; margin-right: 25px">{{
            columnNo[column - 1] }}</div>
                <div v-if="row === 9 && column === 9" class="number" style="float: right; margin-right: 15px">{{
            columnNo[column - 1] }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { calcWall, isWallBetween, judgeWall } from '@/utils/gameBoard.js'

export default {
    name: 'GameBoard',
    watch: {
        'game.chesses': {
            handler() {
                for (let i = 0; i < this.game.chesses.length; i++) {
                    this.updateChessPos(this.game.chesses[i].player, this.game.chesses[i].position, this.game.players[i])
                }
            },
            deep: true
        },
        // 'game.current': {
        //     handler(newVal, oldVal) {
        //         if (this.status.current < 0) {
        //             this.status.current += 1
        //         }
        //         const currentPlayer = document.getElementById(newVal)
        //         const prePlayer = document.getElementById(oldVal)
        //
        //         prePlayer.className = 'chess'
        //         currentPlayer.className = 'chess current-player'
        //     }
        // },
        'lastOp': {
            handler(newVal) {
                if (newVal.type === 'chess') {
                    this.updateChessPos(this.lastOp.player, this.lastOp.position, this.game.players[this.lastOp.player])
                }else if (newVal.type === 'wall') {
                    const pos = this.lastOp.position
                    const crossPos = [(pos[0][0] + pos[1][0]) / 2, (pos[0][1] + pos[1][1]) / 2]

                    const wall1 = this.$refs[[[pos[0][0]], [pos[0][1]]] + 'to' + crossPos][0]
                    const wall2 = this.$refs[crossPos + 'to' + [pos[1][0], pos[1][1]]][0]
                    const cross = this.$refs['cross' + crossPos][0]

                    cross.className = 'cross wall'
                    if (pos[1][0] === pos[0][0]) {
                        wall1.className = 'column-gap wall'
                        wall2.className = 'column-gap wall'
                    } else {
                        wall1.className = 'row-gap wall'
                        wall2.className = 'row-gap wall'
                    }

                    let startX = pos[0][0] * 2
                    let startY = pos[0][1] * 2
                    let endX = pos[1][0] * 2
                    let endY = pos[1][1] * 2

                    if (startX === endX) {
                        for (let i = startY + 1; i <= endY - 1; i++) {
                            this.status.gameBoard[startX][i] = 1
                        }
                    } else if (startY === endY) {
                        for (let i = startX + 1; i <= endX - 1; i++) {
                            this.status.gameBoard[i][startY] = 1
                        }
                    }
                }
            }
        },
    },
    props: {
        refresh: {
            type: Number,
            default: 0
        },
        game: {},
        lastOp: {},
    },
    data() {
        return {
            columnNo: 'ABCDEFGHI',
            userInfo: {},
            status: {
                current: -1,
                gameBoard: [],
                playersPos: {},
                currentPos: [],
            },

        }
    },
    methods: {
        /**
         * 判断当前格子是否能够落子
         *
         * @param {Number} columnIndex X坐标
         * @param {Number} rowIndex Y坐标
         * @return {Boolean} 能否落子
         * @author ChiyukiRuon
         * */
        judgeChess(columnIndex, rowIndex) {
            if (Object.keys(this.game).length === 0) return false

            const currentSquare = this.$refs[[columnIndex, rowIndex]][0].children

            // 判断是否轮到当前玩家
            if (this.userInfo.id !== this.game.players[this.game.current].id) return false

            // 判断当前格子是否已经有棋子
            if (currentSquare.length === 1) {
                if (currentSquare[0].id !== 'preview') return false
            }

            // 定义方向数组，表示上下左右四个方向
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

            // 遍历四个方向
            for (const [dx, dy] of directions) {
                let x = columnIndex + dx
                let y = rowIndex + dy
                let num = 0 // 记录当前方向上对手棋子的数量，超过两个不能落子

                // 沿当前方向查找是否有棋子
                while (x >= 0 && x < 9 && y >= 0 && y < 9 && num < 2) {
                    if (this.$refs[[x, y]][0].children.length === 0) {
                        // 如果遇到空格，跳出循环继续检查下一个方向
                        break
                    } else if (this.$refs[[x, y]][0].children[0] === this.status.playersPos[this.game.current]) {
                        // 如果遇到当前玩家的棋子，且中间没有墙则说明可以落子
                        return !isWallBetween(x, y, columnIndex, rowIndex, this.status.gameBoard);
                    } else {
                        // 如果遇到对手的棋子，则沿当前方向继续查找

                        // 不能连续跳过两位玩家
                        num += 1
                        if (num === 2) break

                        // 若当前玩家与其它玩家相邻且跳过棋子的后方是墙，且两侧没有墙，则可以跳到相邻玩家两侧的位置
                        let ax, ay, bx, by
                        if (dy === 0) {
                            ax = x
                            ay = y - 1
                            bx = x
                            by = y + 1
                        }else {
                            ax = x - 1
                            ay = y
                            bx = x + 1
                            by = y
                        }
                        if (this.$refs[[ax, ay]][0].children[0] === this.status.playersPos[this.game.current] && isWallBetween(bx, by, x, y, this.status.gameBoard)) {
                            if (!isWallBetween(columnIndex, rowIndex, x, y, this.status.gameBoard)) return true
                        }else if (this.$refs[[bx, by]][0].children[0] === this.status.playersPos[this.game.current] && isWallBetween(ax, ay, x, y, this.status.gameBoard)) {
                            if (!isWallBetween(columnIndex, rowIndex, x, y, this.status.gameBoard)) return true
                        }

                        x += dx
                        y += dy
                    }
                }
            }

            // 如果所有方向都没有找到当前玩家的棋子，则不能落子
            return false
        },

        /**
         * 鼠标移到棋格上时判断能否落子以显示棋子预览
         *
         * @param {Number} x 格子的X值
         * @param {Number} y 格子的Y值
         * @return void
         * @author ChiyukiRuon
         * */
        mouseOnSquare(x, y) {
            if (this.judgeChess(x, y)) {
                const container = this.$refs[[x, y]]
                let chessDiv

                if (container[0] && container[0].children.length === 0) {
                    chessDiv = document.createElement('div')
                    chessDiv.id = 'preview'
                    chessDiv.className = 'preview-chess'
                    chessDiv.style.backgroundImage = `url('${this.game.players[this.game.current].metadata.head}')`
                    container[0].appendChild(chessDiv)
                }
            }
        },

        /**
         * 鼠标移出棋格时清除棋子预览
         *
         * @param {Number} x 格子的X值
         * @param {Number} y 格子的Y值
         * @return void
         * @author ChiyukiRuon
         * */
        mouseLeaveSquare(x, y) {
            const square = this.$refs[[x, y]]

            if (square && square[0].children.length === 1) {
                if (square[0].children[0].id === 'preview') square[0].children[0].remove()
            }
        },

        /**
         * 更新棋子位置
         *
         * @param {Number} id 玩家ID
         * @param {Array} xy 新棋子XY
         * @param {Object} player 玩家信息
         * @return void
         * @author ChiyukiRuon
         * */
        updateChessPos(id, xy, player) {
            const container = this.$refs[xy]
            let chessDiv

            if (container[0]) {
                if (container[0].children.length !== 0) container[0].children[0].remove()
                chessDiv = document.createElement('div')
                chessDiv.id = id.toString()
                chessDiv.className = 'chess'
                chessDiv.style.backgroundImage = `url('${player.metadata.head}')`
                container[0].appendChild(chessDiv)
            }

            if (this.status.playersPos[id]) this.status.playersPos[id].remove()

            this.status.playersPos[id] = chessDiv
        },

        /**
         * 移动棋子
         *
         * @param {Number} x 格子的X值
         * @param {Number} y 格子的Y值
         * @return void
         * @author ChiyukiRuon
         * */
        moveChess(x, y) {
            if (this.judgeChess(x, y)) {
                this.updateChessPos(this.game.current, [x, y], this.game.players[this.game.current])

                // TODO 本地调试用
                this.status.currentPlayer = this.game.current % this.game.players.length
                this.$attrs.wss.send(JSON.stringify({
                    'type': 'chess',
                    'position': [x, y]
                }))
            }
        },

        /**
         * 鼠标移到棋格的空隙时判断能否建墙以显示预览
         *
         * @param {String} position 墙相对于棋子坐标系的位置
         * @param {Number} x X坐标
         * @param {Number} y Y坐标
         * @return void
         * @author ChiyukiRuon
         * */
        mouseOnGap(position, x, y) {
            const pos = calcWall(position, x, y)

            if (Object.keys(this.game).length === 0 || this.userInfo.id !== this.game.players[this.game.current].id) return
            if (judgeWall(pos[0][0], pos[0][1], pos[1][0], pos[1][1], this.status.gameBoard)) {
                const crossPos = [(pos[0][0] + pos[1][0]) / 2, (pos[0][1] + pos[1][1]) / 2]

                const wall1 = this.$refs[[[pos[0][0]], [pos[0][1]]] + 'to' + crossPos][0]
                const wall2 = this.$refs[crossPos + 'to' + [pos[1][0], pos[1][1]]][0]
                const cross = this.$refs['cross' + crossPos][0]

                cross.className = 'cross preview-wall'
                if (position === 'right') {
                    wall1.className = 'column-gap preview-wall'
                    wall2.className = 'column-gap preview-wall'
                } else {
                    wall1.className = 'row-gap preview-wall'
                    wall2.className = 'row-gap preview-wall'
                }
            }
        },

        /**
         * 鼠标移出棋格的空隙时移除预览
         *
         * @param {String} position 墙相对于棋子坐标系的位置
         * @param {Number} x X坐标
         * @param {Number} y Y坐标
         * @return void
         * @author ChiyukiRuon
         * */
        mouseLeaveGap(position, x, y) {
            const pos = calcWall(position, x, y)

            const crossPos = [(pos[0][0] + pos[1][0]) / 2, (pos[0][1] + pos[1][1]) / 2]

            const wall1 = this.$refs[[[pos[0][0]], [pos[0][1]]] + 'to' + crossPos][0]
            const wall2 = this.$refs[crossPos + 'to' + [pos[1][0], pos[1][1]]][0]
            const cross = this.$refs['cross' + crossPos][0]

            if (!cross.className.split(' ').includes('wall')) {
                cross.className = 'cross'
            }
            if (position === 'right') {
                wall1.className = wall1.className.split(' ').includes('wall') ? wall1.className : 'column-gap'
                wall2.className = wall2.className.split(' ').includes('wall') ? wall2.className : 'column-gap'
            } else {
                wall1.className = wall1.className.split(' ').includes('wall') ? wall1.className : 'row-gap'
                wall2.className = wall2.className.split(' ').includes('wall') ? wall2.className : 'row-gap'
            }
        },

        /**
         * 建墙
         *
         * @param {String} position 墙相对于棋子坐标系的位置
         * @param {Number} x X坐标
         * @param {Number} y Y坐标
         * @return void
         * @author ChiyukiRuon
         * */
        setWall(position, x, y) {
            const pos = calcWall(position, x, y)

            if (Object.keys(this.game).length === 0 || this.userInfo.id !== this.game.players[this.game.current].id) return

            if (judgeWall(pos[0][0], pos[0][1], pos[1][0], pos[1][1], this.status.gameBoard)) {
                const crossPos = [(pos[0][0] + pos[1][0]) / 2, (pos[0][1] + pos[1][1]) / 2]

                const wall1 = this.$refs[[[pos[0][0]], [pos[0][1]]] + 'to' + crossPos][0]
                const wall2 = this.$refs[crossPos + 'to' + [pos[1][0], pos[1][1]]][0]
                const cross = this.$refs['cross' + crossPos][0]

                cross.className = 'cross wall'
                if (position === 'right') {
                    wall1.className = 'column-gap wall'
                    wall2.className = 'column-gap wall'
                } else {
                    wall1.className = 'row-gap wall'
                    wall2.className = 'row-gap wall'
                }

                let startX = pos[0][0] * 2
                let startY = pos[0][1] * 2
                let endX = pos[1][0] * 2
                let endY = pos[1][1] * 2

                if (startX === endX) {
                    for (let i = startY + 1; i <= endY - 1; i++) {
                        this.status.gameBoard[startX][i] = 1
                    }
                } else if (startY === endY) {
                    for (let i = startX + 1; i <= endX - 1; i++) {
                        this.status.gameBoard[i][startY] = 1
                    }
                }

                this.status.currentPlayer = this.game.current % this.game.players.length
                this.$attrs.wss.send(JSON.stringify({
                    'type': 'wall',
                    'position': [[pos[0][0], pos[0][1]], [pos[1][0], pos[1][1]]]
                }))
            }
        },
    },
    created() {
        // 初始化棋盘每个位置上的状态
        for (let i = 0; i < 9 * 2 + 1; i++) {
            this.status.gameBoard.push([]);
            for (let j = 0; j < 9 * 2 + 1; j++) {
                this.status.gameBoard[i].push(-1);
            }
        }

        this.userInfo = JSON.parse(localStorage.getItem('UserInfo'))
    },
    mounted() {
        this.$nextTick(() => {
            if (Object.keys(this.game).length !== 0) {
                for (let i = 0; i < this.game.chesses.length; i++) {
                    this.updateChessPos(this.game.chesses[i].player, this.game.chesses[i].position, this.game.players[i])
                }

                this.status.currentPlayer = this.game.current % this.game.players.length
                // const currentPlayer = document.getElementById(this.status.currentPlayer)
                // if (currentPlayer) {
                //     currentPlayer.className = 'chess current-player'
                // }
            }
        })
    }
}
</script>

<style scoped>
.board {
    padding: 20px;
    border-radius: 20px;
    background-color: var(--border-bg-color);
}

.row {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 0;
}

.column {
    /*display: flex;*/
}

.cell {
    width: var(--cell-size);
    height: var(--cell-size);
    border-radius: 5px;
    background-color: var(--square-color);
    display: flex;
    justify-content: center;
    align-items: center;
}

.number {
    width: 20px;
    height: var(--cell-size);
    margin-right: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: large;
    font-weight: bold;
    color: var(--font-color-on-bg);
}

.column-gap {
    width: var(--gap-size);
    height: var(--cell-size);
}

.row-gap {
    width: var(--cell-size);
    height: var(--gap-size);
}

.cross {
    width: var(--gap-size);
    height: var(--gap-size);
}
</style>

<style>
.chess {
    width: var(--chess-size);
    height: var(--chess-size);
    border: 1px solid #FFFFFF;
    border-radius: 100%;
    background-size: var(--chess-size);
}

.preview-chess {
    width: var(--chess-size);
    height: var(--chess-size);
    border: 1px solid #FFFFFF;
    border-radius: 100%;
    background-size: var(--chess-size);
    opacity: 0.5;
}

.current-player {
    border: 1px solid #67C23A;
    box-shadow: 4px 4px 4px #808080;
    transition: box-shadow 0.5s;
}

.wall {
    background-color: #5E564F;
    transition: background-color 0.5s;
}

.preview-wall {
    background-color: #5E564F;
    opacity: 0.5;
}
</style>