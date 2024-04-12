<template>
    <div class="player-card">
        <el-avatar :src="player.metadata.head" :size="40" />
        <div class="player-detail">
            <el-text size="large" tag="b" style="max-width: 150px" truncated>{{ player.name }}</el-text>
            <el-text type="info">剩余墙：{{ player.wallRest?player.wallRest:0 }}</el-text>
        </div>
        <div class="player-delay">
            <el-text type="success" v-if="delay <= 100">{{ delay }}ms</el-text>
            <el-text type="warning" v-else-if="delay > 100 & delay < 500">{{ delay }}ms</el-text>
            <el-text type="danger" v-else>{{ delay }}ms</el-text>
        </div>
        <div class="player-status">
            <img src="../../src/assets/img/ready.png" v-if="player.ready" alt="玩家准备">
            <img src="../../src/assets/img/offline.png" v-if="player.offline" alt="玩家掉线">
        </div>
    </div>
</template>

<script>
export default {
    name: "PlayerCard",
    props: {
        player: {},
        delay: {
            type: Number,
            default: 0
        },
    }
}
</script>

<style scoped>
img {
    width: 28px;
}

.player-card {
    width: 260px;
    display: flex;
    align-items: center;
    background-color: #FFF;
    border-radius: 50px;
    padding-left: 10px;
    padding-top: 3px;
    padding-bottom: 3px;
    margin: 5px;
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
}
</style>