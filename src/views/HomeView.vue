<script setup>
import GameBoard from '@/components/GameBoard.vue'
import PlayerCard from '@/components/PlayerCard.vue'
import ChatBox from '@/components/ChatBox.vue'
import HistoryBox from '@/components/HistoryBox.vue'
</script>

<template>
    <div class="header">
        <div class="user-card" @click.prevent="openUserView">
            <el-avatar :src="userInfo.metadata.head" size="large" style="border: 2px solid #409EFF" >{{ userInfo.name }}</el-avatar>
            <div style="margin-left: 20px">{{ $attrs.userInfo.name }}</div>
        </div>
        <div class="room-id">
            <el-form inline>
                <el-form-item label="房间号" style="margin: 0">
                    <el-input v-model="roomId" :disabled="isUserInRoom" />
                </el-form-item>
                <el-button type="primary" style="margin-left: 10px"
                           v-if="!isUserInRoom" :disabled="!isRoomIdOK"
                           @click="joinRoom"
                >加入房间
                </el-button>
            </el-form>
        </div>
        <div style="margin-left: 10px;" v-if="isUserInRoom && Object.keys(game).length === 0">
            <el-button type="success" @click="getReady" v-if="!isUserReady">准备</el-button>
            <el-button type="warning" @click="getReady" v-else>取消准备</el-button>
        </div>
    </div>
    <div class="main">
        <GameBoard v-bind="$attrs" />
        <div class="side">
            <div class="history">
                <div class="player-list-title"><span>玩家列表 #{{ $store.state.roomId }}</span></div>
                <div class="history-operate" v-if="playerList">
                    <span v-for="(player, index) in playerList" :key="index">
                        <PlayerCard :player="player" :delay="$attrs.pingResult[index]"
                                    :in-game-id="index"
                        />
                    </span>
                </div>
            </div>
            <div><history-box /></div>
            <div>
                <ChatBox @send="$attrs.wss.send(JSON.stringify(Object.assign({type:'msg'},$event)))"/>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    // props: {
    //     game: {},
    // },
    name: 'HomeView',
    data() {
        return {
            isRoomIdOK: false,
            isUserInRoom: this.$store.state.isUserInRoom,
            roomId: this.$store.state.roomId,
            currentRoomId: '',
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        isUserReady() {
            return this.$store.state.isUserReady
        },
        game() {
            return this.$store.state.game
        },
        playerList() {
            return this.$store.state.playerList
        },
    },
    watch: {
        roomId(newVal) {
            this.isRoomIdOK = newVal !== this.currentRoomId && newVal.replace(/\s+/g, '').length > 0
        },
        game(newVal) {
            if (Object.keys(newVal).length === 0) {
                this.isUserReady = false
            }
        },
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

            this.$store.commit('updateRoomId', this.roomId)
            this.currentRoomId = this.roomId
            this.isRoomIdOK = false
            this.isUserInRoom = true
            this.$store.commit('updateIsUserInRoom', true)
        },

        /**
         * 玩家准备/取消准备
         *
         * @return void
         * @author ChiyukiRuon
         * */
        getReady() {
            this.$store.commit('updateIsUserReady', !this.isUserReady)
            this.$attrs.wss.send(JSON.stringify({
                'type': 'ready',
                'ready': this.isUserReady
            }))
        },
    },
    mounted() {
        if (!("Notification" in window)) {
            console.warn("此浏览器不支持通知")
        }else if (Notification.permission === 'default') {
            // 检查并请求通知权限
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    new Notification("步步为营", { body: '浏览器通知测试' })
                }
            })
        }
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

.history {
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

.history-operate {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
</style>
