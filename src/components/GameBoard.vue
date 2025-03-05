<template>
<!--    <div class="board-mask"></div>-->
    <div class="board" ref="board">
        <div v-for="row in 9" :key="row" class="row">
            <div v-for="column in 9" :key="column" class="column">
                <div style="display: flex;">
                    <div v-if="column === 1" class="number">{{ 10 - row }}</div>
<!--                    <div class="board-mask"></div>-->
                    <div class="cell" :ref="(column - 1) + ',' + (9 - row)"
                         @click.prevent="(e) => changeConfirmText(e,`于${columnNo[column - 1]}${10 - row}落子`, [(column - 1), (9 - row)])"
                         @mouseover="mouseOnSquare(column - 1, 9 - row)"
                         @mouseleave="mouseLeaveSquare(column - 1, 9 - row)"></div>
                    <div class="column-gap" v-if="column !== 9"
                        :ref="(column) + ',' + (9 - row) + 'to' + (column) + ',' + (10 - row)"
                        @mouseover="mouseOnGap('right', column - 1, 9 - row)"
                        @mouseleave="mouseLeaveGap('right', column - 1, 9 - row)"
                        @click.prevent="(e) => changeConfirmText(e, `纵向放墙操作`, [column - 1, 9 - row], 'right')"></div>
                </div>
                <div style="display: flex; justify-content: flex-end">
                    <div class="row-gap" v-if="row !== 9"
                        :ref="(column - 1) + ',' + (9 - row) + 'to' + (column) + ',' + (9 - row)"
                        @mouseover="mouseOnGap('bottom', column - 1, 9 - row)"
                        @mouseleave="mouseLeaveGap('bottom', column - 1, 9 - row)"
                        @click.prevent="(e) => changeConfirmText(e, `横向放墙操作`, [column - 1, 9 - row], 'bottom')"></div>
                    <div class="cross" v-if="row !== 9 && column !== 9" :ref="'cross' + (column) + ',' + (9 - row)">
                    </div>
                </div>
                <div v-if="row === 9 && column !== 9" class="number" style="float: right; margin-right: 25px">{{
            columnNo[column - 1] }}</div>
                <div v-if="row === 9 && column === 9" class="number" style="float: right; margin-right: 15px">{{
            columnNo[column - 1] }}</div>
            </div>
        </div>

        <el-popover
            ref="popoverRef"
            title=""
            :virtual-ref="previewRef"
            :visible="popoverVisible"
            virtual-triggering
            persistent
        >
            <span>{{ confirmText }}</span>
            <div style="display: flex; justify-items: flex-end;">
                <el-button size="small" @click="popoverVisible = false">取消</el-button>
                <el-button type="primary" size="small" @click="confirmOperate">确定</el-button>
            </div>
        </el-popover>
    </div>
</template>

<script>
import {
    calcWall,
    isNoPathOut,
    isWallBetween,
    judgeWall,
    updateChessInBoard,
    updateWallInBoard
} from '@/utils/gameBoard.js'

export default {
    name: 'GameBoard',
    watch: {
        /* game对象仅在游戏开始或结束时更新，监听game对象来初始化棋盘或重连时恢复棋盘 */
        'game': {
            handler() {
                if (Object.keys(this.game).length !== 0 && this.game.players[this.game.current].id === this.userInfo.id) {
                    this.$nextTick(() => {
                        const board = this.$refs.board
                        if (board) {
                            board.style.boxShadow = '0 0 5px 0 rgba(179,225,157, 0.5) inset'
                            board.style.animation = 'breathe 1.5s infinite alternate'
                        }
                    })
                }
            },
            deep: true
        },
        'game.chesses': {
            handler() {
                // console.log('game.chesses changed')
                if (Object.keys(this.game).length === 0) {
                    this.status = {
                        gameBoard: [],
                        playersPos: {},
                        playerPosXY: []
                    }

                    const chess = document.getElementsByClassName('chess')
                    if (chess.length === 0) return
                    while (chess.length !== 0) {
                        chess[0].remove()
                    }

                    for (let i = 0; i < 9 * 2 + 1; i++) {
                        this.status.gameBoard.push([]);
                        for (let j = 0; j < 9 * 2 + 1; j++) {
                            this.status.gameBoard[i].push(-1);
                        }
                    }

                    this.$nextTick(() => {
                        const board = this.$refs.board
                        if (board) {
                            board.style.boxShadow = ''
                            board.style.animation = ''
                        }
                    })

                    return
                }
                if (this.game.chesses.length !== 0) {
                    for (let i = 0; i < this.game.chesses.length; i++) {
                        try {
                            this.status.playerPosXY.push({start: this.game.chesses[i].position, position: []})
                            this.updateChessPos(this.game.chesses[i].player, this.game.chesses[i].position, this.game.players[i])
                        }catch (e) {
                            console.error(e)
                        }

                    }
                }
            },
            deep: true
        },
        'game.walls': {
            handler() {
                // console.log('game.walls changed')
                if (Object.keys(this.game).length === 0) {
                    const wall = document.getElementsByClassName('wall')
                    if (wall.length === 0) return
                    while (wall[0]) {
                        wall[0].classList.remove('wall')
                    }

                    return
                }
                if (this.game.walls.length !== 0) {
                    for (let i = 0; i < this.game.walls.length; i++) {
                        const midpoints = [(this.game.walls[i].position[0][0] + this.game.walls[i].position[1][0]) / 2, (this.game.walls[i].position[0][1] + this.game.walls[i].position[1][1]) / 2]
                        if (this.game.walls[i].position[1][0] === this.game.walls[i].position[0][0]) {
                            this.reConnectSetWall('right', midpoints[0] - 1, midpoints[1] - 1)
                        } else {
                            this.reConnectSetWall('bottom', midpoints[0] - 1, midpoints[1])
                        }
                    }
                }
            }
        },
        /* 在游戏进行中时所有的操作均通过lastOp来更新 */
        'lastOp': {
            handler(newVal) {
                if (Object.keys(this.game).length !== 0 && this.game.players[this.current].id === this.userInfo.id) {
                    this.$nextTick(() => {
                        const board = this.$refs.board
                        if (board) {
                            board.style.boxShadow = '0 0 5px 0 rgba(179,225,157, 0.5) inset'
                            board.style.animation = 'breathe 1.5s infinite alternate'
                        }
                    })
                }else {
                    this.$nextTick(() => {
                        const board = this.$refs.board
                        if (board) {
                            board.style.boxShadow = ''
                            board.style.animation = ''
                        }
                    })
                }

                if (newVal.type === 'chess') {
                    this.updateChessPos(this.lastOp.player, this.lastOp.position[0], this.game.players[this.lastOp.player])
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

                    this.status.gameBoard = updateWallInBoard(this.status.gameBoard, pos)
                }
            },
            deep: true
        },
    },
    props: {

    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile
        },
        userInfo() {
            return this.$store.state.userInfo
        },
        game() {
            return this.$store.state.game
        },
        playerList() {
            return this.$store.state.playerList
        },
        lastOp() {
            return this.$store.state.lastOp
        },
        current() {
            return this.$store.state.currentPlayer
        },
    },
    data() {
        return {
            popoverVisible: false,
            columnNo: 'ABCDEFGHI',
            previewRef: '',
            confirmText: '',
            confirmOp: {},
            status: {
                gameBoard: [],
                playersPos: {},
                playerPosXY: [],
            },
        }
    },
    methods: {
        /**
         * 改变确认弹窗文本
         *
         * @param {Event} e 事件
         * @param {String} text 弹窗文本
         * @param {Array} xy 坐标1
         * @param {String} [position] 位置
         * @return void
         * @author ChiyukiRuon
         * */
        changeConfirmText(e, text, xy, position) {
            if (!this.isMobile) {
                if (!position) {
                    this.moveChess(xy[0], xy[1])
                } else {
                    this.setWall(position, xy[0], xy[1])
                }
            } else {
                this.confirmText = text
                if (e.target) this.previewRef = e.target

                if (!position) {
                    if (this.judgeChess(xy[0], xy[1])) {
                        this.popoverVisible = true
                        this.confirmOp = { type: 'chess', xy: xy}
                    } else {
                        this.popoverVisible = false
                    }
                } else {
                    const xys = calcWall(position, xy[0], xy[1])
                    if (judgeWall(xys[0][0], xys[0][1], xys[1][0], xys[1][1], this.status.gameBoard)) {
                        this.popoverVisible = true
                        this.confirmOp = { type: 'wall', xy: xy, position: position}
                    } else {
                        this.popoverVisible = false
                    }
                }
            }
        },

        /**
         * 二次确认后执行操作
         *
         * @return void
         * @author ChiyukiRuon
         * */
        confirmOperate() {
            if (this.confirmOp.type === 'chess') {
                this.moveChess(this.confirmOp.xy[0], this.confirmOp.xy[1])
                this.previewRef = this.$refs[this.confirmOp.xy][0]
            } else {
                this.setWall(this.confirmOp.position, this.confirmOp.xy[0], this.confirmOp.xy[1])
            }

            this.popoverVisible = false
        },

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
            if (this.userInfo.id !== this.game.players[this.current].id) return false

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
                    } else if (this.$refs[[x, y]][0].children[0] === this.status.playersPos[this.current]) {
                        // 如果遇到当前玩家的棋子，且中间没有墙则说明可以落子
                        return !isWallBetween(x, y, columnIndex, rowIndex, this.status.gameBoard);
                    } else {
                        // 如果遇到对手的棋子，则沿当前方向继续查找
                        // 如果遇到墙，则跳出循环继续检查下一个方向
                        if (isWallBetween(x, y, columnIndex, rowIndex, this.status.gameBoard)) break

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
                        if (this.$refs[[ax, ay]] && this.$refs[[ax, ay]][0].children[0] === this.status.playersPos[this.current] && isWallBetween(bx, by, x, y, this.status.gameBoard)) {
                            if (!isWallBetween(columnIndex, rowIndex, x, y, this.status.gameBoard)) return true
                        }else if (this.$refs[[bx, by]]  && this.$refs[[bx, by]][0].children[0] === this.status.playersPos[this.current] && isWallBetween(ax, ay, x, y, this.status.gameBoard)) {
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
                    if (this.game.players[this.current].metadata.head === '') {
                        chessDiv.innerText = this.game.players[this.current].name
                    }
                    chessDiv.style.backgroundImage = `url('${this.game.players[this.current].metadata.head}')`
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

            if (this.status.playerPosXY[id].position.length !== 0) {
                this.status.gameBoard = updateChessInBoard(id, this.status.gameBoard, xy, this.status.playerPosXY[id].position)
            }else {
                this.status.gameBoard = updateChessInBoard(id, this.status.gameBoard, xy)
            }

            this.status.playerPosXY[id].position = xy

            if (container[0]) {
                if (container[0].children.length !== 0) container[0].children[0].remove()
                chessDiv = document.createElement('div')
                chessDiv.id = id.toString()
                chessDiv.className = 'chess'
                if (player.metadata.head === '') {
                    chessDiv.innerText = player.name
                }
                chessDiv.style.backgroundImage = `url('${player.metadata.head}')`
                chessDiv.addEventListener('mouseenter', () => {
                    this.showPlayerFinal(Number(chessDiv.id), true)
                })
                chessDiv.addEventListener('mouseleave', () => {
                    this.showPlayerFinal(Number(chessDiv.id), false)
                })
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
                this.previewRef = `${x},${y}`

                this.updateChessPos(this.current, [x, y], this.game.players[this.current])
                const chess = {player: this.current, position: [x, y]}
                this.$store.commit('changeInGameChess', chess)

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

            if (Object.keys(this.game).length === 0 || this.userInfo.id !== this.game.players[this.current].id || this.playerList[this.current].wallRest <= 0) return
            if (judgeWall(pos[0][0], pos[0][1], pos[1][0], pos[1][1], this.status.gameBoard)) {
                if (isNoPathOut(this.status.playerPosXY, this.status.gameBoard, pos)) return

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

            if (Object.keys(this.game).length === 0 || this.userInfo.id !== this.game.players[this.current].id || this.playerList[this.current].wallRest <= 0) return

            if (judgeWall(pos[0][0], pos[0][1], pos[1][0], pos[1][1], this.status.gameBoard)) {
                if (isNoPathOut(this.status.playerPosXY, this.status.gameBoard, pos)) return

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

                this.status.gameBoard = updateWallInBoard(this.status.gameBoard, pos)

                this.$attrs.wss.send(JSON.stringify({
                    'type': 'wall',
                    'position': [[pos[0][0], pos[0][1]], [pos[1][0], pos[1][1]]]
                }))
            }
        },

        /**
         * 重连时用于恢复棋盘上的墙
         *
         * @param {String} position 墙相对于棋子坐标系的位置
         * @param {Number} x X坐标
         * @param {Number} y Y坐标
         * @return void
         * @author ChiyukiRuon
         * */
        reConnectSetWall(position, x, y) {
            const pos = calcWall(position, x, y)

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

            this.status.gameBoard = updateWallInBoard(this.status.gameBoard, pos)
        },

        /**
         * 显示玩家的终点区域
         *
         * @param {Number} id 玩家id
         * @param {Boolean} mouseEnter 鼠标是否进入棋盘
         * @return void
         * @author ChiyukiRuon
         * */
        showPlayerFinal(id, mouseEnter) {
            const start = this.game.players[id].startPosition
            let finalSquares = []
            if (start[0] === 0) {
                for (let i = 0; i < 9; i++) {
                    finalSquares.push(this.$refs[[8, i]][0])
                }
            }else if (start[1] === 0) {
                for (let i = 0; i < 9; i++) {
                    finalSquares.push(this.$refs[[i, 8]][0])
                }
            }else if (start[0] === 8) {
                for (let i = 0; i < 9; i++) {
                    finalSquares.push(this.$refs[[0, i]][0])
                }
            }else if (start[1] === 8) {
                for (let i = 0; i < 9; i++) {
                    finalSquares.push(this.$refs[[i, 0]][0])
                }
            }
            if (mouseEnter) {
                for (let i = 0; i < finalSquares.length; i++) {
                    finalSquares[i].className = 'final-square'
                }
            }else {
                for (let i = 0; i < finalSquares.length; i++) {
                    finalSquares[i].className = 'cell'
                }
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
    },
    mounted() {
        if (Object.keys(this.game).length !== 0) {
            if (this.game.players[this.current].id === this.userInfo.id) {
                const board = this.$refs.board
                if (board) {
                    board.style.boxShadow = '0 0 5px 0 rgba(179,225,157, 0.5) inset'
                    board.style.animation = 'breathe 1.5s infinite alternate'
                }
            }

            const chess = this.$store.state.inGameChess
            if (chess.length !== 0) {
                for (let i = 0; i < chess.length; i++) {
                    this.status.playerPosXY.push({start: chess[i].position, position: []})
                    this.updateChessPos(chess[i].player, chess[i].position, this.game.players[i])
                }
            }

            const walls = this.$store.state.inGameWalls
            if (walls.length !== 0) {
                for (let i = 0; i < walls.length; i++) {
                    const midpoints = [(walls[i].position[0][0] + walls[i].position[1][0]) / 2, (walls[i].position[0][1] + walls[i].position[1][1]) / 2]
                    if (walls[i].position[1][0] === walls[i].position[0][0]) {
                        this.reConnectSetWall('right', midpoints[0] - 1, midpoints[1] - 1)
                    } else {
                        this.reConnectSetWall('bottom', midpoints[0] - 1, midpoints[1])
                    }
                }
            }
        }
    },
}
</script>

<style scoped>
.board-mask {
    position: absolute;
    width: 100%;
    max-width: 60px;
    height: 60px;
    border: 1px solid;
}

.board {
    width: 605px;
    height: 620px;
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
    transition: background-color 0.5s;
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
    background-color: #C0C4CC;
    text-align: center;
    line-height: var(--chess-size);
    color: #FFFFFF;
    word-break: break-word;
    overflow: hidden;
}

.preview-chess {
    width: var(--chess-size);
    height: var(--chess-size);
    border: 1px solid #FFFFFF;
    border-radius: 100%;
    background-size: var(--chess-size);
    background-color: #C0C4CC;
    text-align: center;
    line-height: var(--chess-size);
    color: #FFFFFF;
    word-break: break-word;
    overflow: hidden;
    opacity: 0.5;
}

.final-square {
    width: var(--cell-size);
    height: var(--cell-size);
    border-radius: 5px;
    background-color: var(--square-color-final);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.5s;
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

@keyframes breathe {
    0% {
        box-shadow: 0 0 5px 0 rgba(179,225,157, 0.5) inset;
    }
    100% {
        box-shadow: 0 0 8px 10px rgba(179,225,157, 0.9) inset;
    }
}
</style>