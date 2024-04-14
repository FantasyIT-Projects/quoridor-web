<template>
    <div class="history">
        <div class="history-title"><span>操作历史</span></div>
        <div class="history-list" ref="history-list">
            <div class="history-operate" v-for="(lastOp, index) in opHistoryList" :key="index">
                <PlayerCard size="mini" :player="game.players[lastOp.player]" />
                <span v-if="lastOp.type === 'chess'">于 {{ columnNo[lastOp.position[0][0]] }}{{ lastOp.position[0][1] + 1 }} 落子</span>
                <span v-else-if="lastOp.type === 'wall'">于 {{ lastOp.position }} 放置了 {{ lastOp.direction }} 墙</span>
            </div>
        </div>
    </div>
</template>

<script>
import PlayerCard from '@/components/PlayerCard.vue'

export default {
    name: 'HistoryBox',
    components: { PlayerCard },
    computed: {
        game() {
            return this.$store.state.game
        },
        opHistoryList() {
            return this.$store.state.opHistoryList
        },
    },
    data() {
        return {
            columnNo: 'ABCDEFGHI',
        }
    },
    watch: {
        'opHistoryList': {
            handler() {
                this.$nextTick(() => {
                    const historyList = this.$refs['history-list']
                    historyList.scrollTop = historyList.scrollHeight
                })
            },
            deep: true
        }
    }
}
</script>

<style scoped>
.history {
    border-radius: 20px;
    height: 80px;
    padding-bottom: 5px;
    margin-top: 5px;
    background-color: var(--border-bg-color);
}

.history-title {
    background-color: var(--square-color);
    border-radius: 20px 20px 0 0;
    height: 35px;
    line-height: 35px;

    span {
        margin-left: 15px;
        color: var(--font-color-on-bg);
        font-weight: bold;
    }
}

.history-list {
    height: 120px;
    overflow-y: auto;
}

.history-operate {
    display: flex;
    flex-wrap: wrap;
    padding-left: 10px;
    padding-top: 5px;
}

::-webkit-scrollbar {
    display: none;
}
</style>