<script setup>
import GameBoard from '@/components/GameBoard.vue'
import PlayerCard from '@/components/PlayerCard.vue'
import ChatBox from '@/components/ChatBox.vue'
import HistoryBox from '@/components/HistoryBox.vue'
</script>

<template>
    <div class="header">
        <div class="user-card" @click.prevent="openUserView">
            <el-avatar :src="userInfo.metadata.head" size="large" class="avatar" style="" >{{ userInfo.name }}</el-avatar>
            <div style="margin-left: 20px">{{ $attrs.userInfo.name }}</div>
        </div>
        <div style="display: flex; align-items: center">
            <div class="room-id">
                <el-form inline>
                    <el-form-item label="" style="margin: 0">
                        <el-input v-model="roomId" placeholder="房间号" :disabled="isUserInRoom" />
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
        connectStatus() {
            return this.$store.state.connectStatus
        },
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
        connectStatus(newVal) {
            const avatar = document.querySelector('.avatar')
            switch (newVal) {
                case 0:
                    // 连接中
                    this.$nextTick(() => {
                        avatar.style.animation = 'connecting 1.5s infinite alternate'
                    })
                    break
                case 1:
                    // 连接成功
                    this.$nextTick(() => {
                        avatar.style.animation = ''
                        avatar.style.border = '2px solid #409EFF'
                    })
                    break
                case 2:
                    // 连接断开
                    this.$nextTick(() => {
                        avatar.style.animation = 'disconnected 0.5s infinite alternate'
                    })
                    break
                default:
                    break
            }
        },
        roomId(newVal) {
            this.isRoomIdOK = newVal !== this.currentRoomId && newVal.replace(/\s+/g, '').length > 0
        },
        game(newVal) {
            if (Object.keys(newVal).length === 0) {
                this.$store.commit('updateIsUserReady', false)
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

    }
}
</script>

<style scoped>
.header {
    @media (max-width: 650px) {

    }

    @media (min-width: 651px) {
        height: auto;
        margin-top: 10px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    }
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

    @media (max-width: 650px) {
        margin-top: 5px;
        margin-bottom: 5px;
    }

    @media (min-width: 651px) {
        margin-left: 20px;
    }
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
<style>
.avatar {
    border: 2px solid #409EFF;
}

@keyframes connecting {
    0% {
        border: 2px solid rgba(255, 165, 0, 0.5);
        box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.3);
    }
    100% {
        border: 2px solid rgba(255, 165, 0, 0.9);
        box-shadow: 0 0 3px 3px rgba(255, 165, 0, 0.6);
    }
}

@keyframes disconnected {
    0% {
        border: 2px solid rgba(245,108,108, 0.5);
        box-shadow: 0 0 0 0 rgba(245,108,108, 0.3);
    }
    100% {
        border: 2px solid rgba(245,108,108, 0.9);
        box-shadow: 0 0 3px 3px rgba(245,108,108, 0.6);
    }
}
</style>
