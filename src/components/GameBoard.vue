<template>
    <div class="board">
        <div v-for="row in 9" :key="row" class="row">
            <div v-for="column in 9" :key="column" class="column">
                <div style="display: flex">
                    <div class="cell" :ref="(9-row)+','+(column-1)" @click.prevent="judgeChess(9 - row, column - 1)">
                        <div class="chess"></div>
                    </div>
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
    data() {
        return {
            columnNo: 'ABCDEFGHI',
            players: [],
            ops: [
                {
                    player: 1,
                    type: "CHESS",
                    position: [
                        [4,0]
                    ]
                },
                {
                    player: 2,
                    type: "CHESS",
                    position: [
                        [4,8]
                    ]
                }
            ]
        }
    },
    methods: {
        /**
         * 判断是否能够落子
         *
         * @param {Number} rowIndex Y坐标
         * @param {Number} columnIndex X坐标
         * @return void
         * */
        judgeChess(rowIndex, columnIndex) {
            console.log(`click at (${columnIndex}, ${rowIndex})`)
        },

        /**
         * 判断是否能建墙
         *
         * @param {String} position 墙相对于棋子坐标系的位置
         * @param {Number} rowIndex Y坐标
         * @param {Number} columnIndex X坐标
         * @return void
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
        }
    },
    mounted() {
        this.$nextTick(() => {
            const s = '1,1'
            console.log(this.$refs[s])
        })
    }
}
</script>

<style scoped>
.board {
    border: 1px solid;
    padding: 20px;
    border-radius: 20px;
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
    border: 1px solid black;
    border-radius: 5px;
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

.chess {
    width: var(--chess-size);
    height: var(--chess-size);
    border: 1px solid;
    border-radius: 100%;
}
</style>