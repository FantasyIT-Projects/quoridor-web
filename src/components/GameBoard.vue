<template>
    <div class="board">
        <div v-for="row in 9" :key="row" class="row">
            <div v-for="column in 9" :key="column" class="column">
                <div style="display: flex">
                    <div class="cell" :ref="(column-1)+','+(9-row)"
                         @click.prevent="moveChess(column - 1, 9 - row)"
                         @mouseover="mouseOnSquare(column - 1, 9 - row)"
                         @mouseleave="mouseLeaveSquare(column - 1, 9 - row)"
                    ></div>
                    <div class="column-gap" v-if="column !== 9" @click.prevent="judgeWall('right', 9 - row, column - 1)"></div>
                </div>
                <div style="display: flex">
                    <div class="row-gap" v-if="row !== 9" @click.prevent="judgeWall('bottom', 9 - row, column - 1)"></div>
                    <div class="cross" v-if="row !== 9 && column !== 9"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GameBoard',
    watch: {
        'status.currentPlayer': {
            handler(newVal, oldVal) {
                const currentPlayer = document.getElementById(newVal)
                const prePlayer = document.getElementById(oldVal)

                prePlayer.className = 'chess'
                currentPlayer.className = 'chess current-player'
            },
        }
    },
    data() {
        return {
            columnNo: 'ABCDEFGHI',
            players: [
                {
                    name: 'ChiyukiRuon',
                    id: 1,
                    ingame: 0,
                    metadata: {
                        head: 'https://chiyukiruon.com/images/arimakana.JPG'
                    }
                },
                {
                    name: 'xypp',
                    id: 2,
                    ingame: 1,
                    metadata: {
                        head: 'https://q1.qlogo.cn/g?b=qq&nk=2952795729&s=100'
                    }
                }
            ],
            ops: [
                {
                    player: 0,
                    type: "CHESS",
                    position: [
                        [4,0]
                    ]
                },
                {
                    player: 1,
                    type: "CHESS",
                    position: [
                        [4,8]
                    ]
                }
            ],
            status: {
                currentPlayer: 1,
                playersPos: {},
                wallPos: [],
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
            const currentSquare = this.$refs[[columnIndex, rowIndex]][0].children

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

                // 沿当前方向查找是否有棋子
                while (x >= 0 && x < 9 && y >= 0 && y < 9) {
                    if (this.$refs[[x, y]][0].children.length === 0) {
                        // 如果遇到空格，跳出循环继续检查下一个方向
                        break
                    } else if (this.$refs[[x, y]][0].children[0] === this.status.playersPos[this.status.currentPlayer]) {
                        // 如果遇到当前玩家的棋子，则说明可以落子
                        return true
                    } else {
                        // 如果遇到对手的棋子，则沿当前方向继续查找
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
                    chessDiv.style.backgroundImage = `url('${this.players[this.status.currentPlayer].metadata.head}')`
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
         * 移动棋子
         *
         * @param {Number} x 格子的X值
         * @param {Number} y 格子的Y值
         * @return void
         * @author ChiyukiRuon
         * */
        moveChess(x, y) {
            if (this.judgeChess(x, y)) {
                this.updateChessPos(this.status.currentPlayer, [x, y], this.players[this.status.currentPlayer])
                this.status.currentPlayer = this.status.currentPlayer === 1?0:1
            }
        },

        /**
         * 判断是否能建墙
         *
         * @param {String} position 墙相对于棋子坐标系的位置
         * @param {Number} rowIndex Y坐标
         * @param {Number} columnIndex X坐标
         * @return void
         * @author ChiyukiRuon
         * */
        judgeWall(position, rowIndex, columnIndex) {
            let startX,startY,endX,endY

            if (position === 'right') {
                if (rowIndex === 8) {
                    startY = rowIndex - 1
                    endY = rowIndex + 1
                }else {
                    startY = rowIndex
                    endY = rowIndex + 2
                }

                startX = columnIndex + 1
                endX = columnIndex + 1
            }else {
                if (columnIndex === 8) {
                    startX = columnIndex - 1
                    endX = columnIndex + 1
                }else {
                    startX = columnIndex
                    endX = columnIndex + 2
                }

                startY = rowIndex
                endY = rowIndex
            }

            console.log(`wall set (${startX},${startY}) to (${endX},${endY})`)
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
                chessDiv.id = player.ingame
                chessDiv.className = 'chess'
                chessDiv.style.backgroundImage = `url('${player.metadata.head}')`
                container[0].appendChild(chessDiv)
            }

            if (this.status.playersPos[id]) this.status.playersPos[id].remove()

            this.status.playersPos[id] = chessDiv
        }
    },
    mounted() {
        this.$nextTick(() => {
            for (let i = 0; i < this.ops.length; i++) {
                if (this.ops[i].type === 'CHESS') {
                    this.updateChessPos(this.ops[i].player, this.ops[i].position, this.players[i])
                }
            }

            const currentPlayer = document.getElementById(this.status.currentPlayer)
            if (currentPlayer) {
                currentPlayer.className = 'chess current-player'
            }
        })
    }
}
</script>

<style scoped>
.board {
    padding: 20px;
    border-radius: 20px;
    background-color: #B0A092;
}

.row {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 0;
}

.column {
    //display: flex;
}

.cell {
    width: var(--cell-size);
    height: var(--cell-size);
    border-radius: 5px;
    background-color: #A18E80;
    display: flex;
    justify-content: center;
    align-items: center;
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
</style>