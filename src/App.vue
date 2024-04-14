<script setup>
import UserView from '@/views/UserView.vue'
import HomeView from '@/views/HomeView.vue'
</script>

<template>
    <HomeView v-if="!showUserView"
              :userInfo="userInfo" :wss="wss" :pingResult="pingResult"
              :player="player"
              v-bind="$attrs"
              @openUserView="openUserView"
    />
    <UserView v-else
              :wss="wss"
              v-bind="$attrs"
              @openUserView="openUserView"
    />

    <el-dialog title="游戏结束" v-model="gameOverDialog" :before-close="nextGame">
        <div style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
            <div class="winner-avatar">
                <el-avatar :src="winner.metadata.head" :size="80">{{ winner.name }}</el-avatar>
            </div>
            <div>{{ winner.name }} 是赢家</div>
        </div>
    </el-dialog>
</template>

<script>
import { generateId } from '@/utils/user.js'

export default {
    data() {
        return {
            showUserView: true,
            gameOverDialog: false,
            gameOverDialogText: "",
            userInfo: {
                name: "",
                id: "",
                ready: false,
                offline: false,
                metadata: {
                    head: ""
                },
            },
            roomId: "",
            wss: null,
            pingResult: [],
            player: [],
            game: {},
            lastOp: {},
            winner: {},
            rank: [],
        }
    },
    methods: {
        /**
         * 是否打开用户信息页面
         *
         * @param {Boolean} open 是否打开
         * @return void
         * @author ChiyukiRuon
         * */
        openUserView(open) {
            if (!open) {
                this.userInfo = JSON.parse(localStorage.getItem('UserInfo'))
                if (this.wss === null) this.startWss()
            }
            this.showUserView = open
        },

        nextGame() {
            this.game = []
            this.gameOverDialog = false
        },

        /**
         * 启动WebSocket连接
         *
         * @return void
         * @author ChiyukiRuon
         * */
        startWss() {
            // this.wss = new WebSocket('ws://zxy19.e2.luyouxia.net:20307')
            this.wss = new WebSocket('ws://127.0.0.1:19981')

            this.wss.onopen = () => {
                console.info('WebSocket连接已建立')
            }

            this.wss.onmessage = (event) => {
                console.info('收到WebSocket消息：', JSON.parse(event.data))
                const type = JSON.parse(event.data).type
                switch (type) {
                    case 'ping':
                        this.wss.send(JSON.stringify(
                            { "type": "pong", }
                        ))
                        break
                    case 'pingResult':
                        this.pingResult = JSON.parse(event.data).ping
                        break
                    case 'room':
                        this.player = JSON.parse(event.data).player
                        break
                    case 'start':
                        this.game = JSON.parse(event.data).game
                        this.player = JSON.parse(event.data).game.players

                        this.$store.commit('updateGame', this.game)
                        break
                    case 'stage':
                        this.game.current = JSON.parse(event.data).current
                        if (JSON.parse(event.data).lastOp.type === 'wall') {
                            this.player[JSON.parse(event.data).lastOp.player].wallRest -= 1
                            this.game.players[JSON.parse(event.data).lastOp.player].wallRest -= 1
                        }
                        this.lastOp = JSON.parse(event.data).lastOp

                        this.$store.commit('updateGame', this.game)
                        this.$store.commit('updateLastOp', this.lastOp)
                        break
                    case 'won':
                        this.winner = this.player[JSON.parse(event.data).player]
                        this.rank = JSON.parse(event.data).rank
                        this.gameOverDialog = true
                        break
                    case 'end':
                        this.player = JSON.parse(event.data).players
                        this.rank = JSON.parse(event.data).rank
                        this.game = {}

                        this.$store.commit('updateGame', this.game)
                        break
                }
            }

            this.wss.onclose = () => {
                // this.ws = null
                console.warn('WebSocket连接已关闭')
                this.$message.warning('WebSocket连接已关闭')
            }

            this.wss.onerror = (error) => {
                console.error('WebSocket错误：', error)
                this.$message.error(`WebSocket错误：${error}`)
            }
        },

        /**
         * 重连
         *
         * @return void
         * @author ChiyukiRuon
         * */
        reconnectWss() {
            // TODO 断线重连
        }
    },
    mounted() {
        if (localStorage.getItem('UserInfo')) {
            this.userInfo = JSON.parse(localStorage.getItem('UserInfo'))
            if (this.userInfo.id === '') this.userInfo.id = generateId(this.userInfo.name)
            this.$store.commit('updateUserInfo', this.userInfo)
            this.showUserView = false
            this.startWss()
        }
    },
    beforeUnmount() {
        this.wss.close()
    }
}
</script>

<style scoped>
.main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.side {
    margin-left: 20px;
}

.winner-avatar {
}
</style>
