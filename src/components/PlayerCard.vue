<template>
    <div v-if="size === 'default'" class="player-card" ref="player-card">
        <div style="width: 40px; height: 40px;">
            <el-avatar :src="player.metadata?player.metadata.head:''" :size="40" >{{ player.name.substring(0, 2) }}</el-avatar>
        </div>
        <div class="player-detail">
            <el-text size="large" tag="b" style="max-width: 123px" truncated>{{ player.name }}</el-text>
            <el-text type="info">剩余墙：{{ player.wallRest?player.wallRest:0 }}</el-text>
        </div>
        <div class="player-delay">
            <el-text type="success" v-if="delay <= 100">{{ delay }}ms</el-text>
            <el-text type="warning" v-else-if="delay > 100 & delay < 500">{{ delay }}ms</el-text>
            <el-text type="danger" v-else>{{ delay }}ms</el-text>
        </div>
        <div class="player-status">
            <img src="../../src/assets/img/ready.png" v-if="player.ready && Object.keys(game).length === 0" alt="玩家准备">
            <img src="../../src/assets/img/offline.png" v-if="player.offline" alt="玩家掉线">
            <img src="../../src/assets/img/thinking.gif" v-if="!player.offline && inGameId === current" alt="玩家思考中">
            <div v-if="!player.ready && inGameId !== current && !player.offline" style="width: 28px"></div>
        </div>
    </div>
    <div v-else-if="size === 'mini'" style="display: flex; align-items: center;">
        <div style="width: 20px; height: 20px; display: flex; align-items: center">
            <el-avatar :src="player.metadata.head" :size="20" >{{ player.name.substring(0, 2) }}</el-avatar>
        </div>
        <div style="margin-left: 5px; margin-right: 5px; font-size: small">{{ player.name }}</div>
    </div>
</template>

<script>
export default {
    name: "PlayerCard",
    props: {
        size: {
            type: String,
            default: 'default'
        },
        player: {},
        delay: {
            type: Number,
            default: 0
        },
        inGameId: -1,
    },
    computed: {
        game() {
            return this.$store.state.game;
        },
        current() {
            return this.$store.state.currentPlayer
        }
    },
    data() {
        return {

        }
    },
    watch: {
        'current': {
            handler() {
                if (this.size !== 'default') return
                if (!this.player.offline && this.inGameId === this.current) {
                    this.$refs['player-card'].style.border = '2px solid #67C23A'
                }else {
                    this.$refs['player-card'].style.border = '2px solid rgba(0,0,0,0)'
                }
            },
            deep: true
        }
    },
    mounted() {
        if (this.size === 'default' && !this.player.offline && this.inGameId === this.current) {
            this.$refs['player-card'].style.border = '2px solid #67C23A'
        }
    }
}
</script>

<style scoped>
img {
    width: 28px;
}

.player-card {
    width: 274px;
    display: flex;
    align-items: center;
    background-color: #FFF;
    border: 2px solid rgba(0,0,0,0);
    border-radius: 50px;
    padding-left: 10px;
    padding-top: 3px;
    padding-bottom: 3px;
    margin: 4px;
}

.player-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 10px
}

.player-delay {
    margin-left: auto;
    margin-right: 10px;
}

.player-status {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: 15px;

    img {
        border-radius: 100%;
    }
}
</style>