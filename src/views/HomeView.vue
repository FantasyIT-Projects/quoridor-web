<script setup>
import GameBoard from '@/components/GameBoard.vue'
import PlayerCard from '@/components/PlayerCard.vue'
</script>

<template>
    <div class="header">
        <div class="user-card" @click.prevent="openUserView">
            <el-avatar :src="$attrs.userInfo.metadata.head" size="large" style="border: 2px solid #409EFF" >{{ $attrs.userInfo.name }}</el-avatar>
            <div style="margin-left: 20px">{{ $attrs.userInfo.name }}</div>
        </div>
        <div class="room-id">
            <el-form inline>
                <el-form-item label="房间号" style="margin: 0">
                    <el-input v-model="roomId" :disabled="isUserInRoom" />
                </el-form-item>
                <el-button type="primary" style="margin-left: 10px"
                           v-if="!isUserInRoom"
                           :disabled="!isRoomIdOK" :refresh="refresh"
                           @click="joinRoom"
                >加入房间
                </el-button>
            </el-form>
        </div>
        <div style="margin-left: 10px;" v-if="isUserInRoom && Object.keys($attrs.game).length === 0">
            <el-button type="success" @click="getReady" v-if="!isUserReady">准备</el-button>
            <el-button type="warning" @click="getReady" v-else>取消准备</el-button>
        </div>
    </div>
    <div class="main">
        <GameBoard v-bind="$attrs" :game="$attrs.game" :last-op="$attrs.lastOp" />
        <div class="side">
            <div class="player-list">
                <div class="player-list-title"><span>玩家列表 #{{ currentRoomId }}</span></div>
                <div class="player-card-list" v-if="$attrs.player">
                    <span v-for="(player, index) in $attrs.player" :key="index">
                        <PlayerCard :player="player" :delay="$attrs.pingResult[index]"
                                    :game="$attrs.game" :in-game-id="index"
                        />
                    </span>
                </div>
            </div>
            <div>History</div>
            <div>Chat</div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isRoomIdOK: false,
            isUserReady: false,
            isUserInRoom: false,
            refresh: 0,
            roomId: this.$attrs.roomId ? this.$attrs.roomId : '',
            currentRoomId: '',
        }
    },
    watch: {
        roomId(newVal) {
            this.isRoomIdOK = newVal !== this.currentRoomId && newVal.replace(/\s+/g, '').length > 0
        }
    },
    methods: {
        /**
         * 打开用户信息页面
         *
         * @return void
         * @author ChiyukiRuon
         * */
        openUserView() {
            this.$emit('openUserView', true)
        },

        /**
         * 加入房间
         *
         * @return void
         * @author ChiyukiRuon
         * */
        joinRoom() {
            this.$attrs.wss.send(JSON.stringify({
                'type': 'room',
                'roomId': this.roomId,
                'player': this.$attrs.userInfo
            }))

            this.currentRoomId = this.roomId
            this.isRoomIdOK = false
            this.isUserInRoom = true
        },

        getReady() {
            this.refresh += 1
            this.isUserReady = !this.isUserReady
            this.$attrs.wss.send(JSON.stringify({
                'type': 'ready',
                'ready': this.isUserReady
            }))
        }
    },
    mounted() {
        console.log(this.$attrs)
    }
}
</script>

<style scoped>
.header {
    height: auto;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.user-card {
    display: flex;
    align-items: center;
}

.user-card:hover {
    cursor: pointer;
}

.room-id {
    display: flex;
    align-items: center;
    margin-left: 20px;
}

.main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.side {
    margin-left: 35px;
}

.player-list {
    border-radius: 20px;
    min-height: 150px;
    height: auto !important;
    padding-bottom: 5px;
    background-color: var(--border-bg-color);
}

.player-list-title {
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

.player-card-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
</style>
