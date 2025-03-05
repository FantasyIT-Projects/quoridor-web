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

    <router-view v-bind="$attrs" @openUserView="openUserView" ></router-view>

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
import UserView from '@/views/UserView.vue'
import { generateId } from '@/utils/user.js'
import HomeView from '@/views/HomeView.vue'
import { isMobileDevice } from '@/utils/device.js'

export default {
    components: { HomeView, UserView },
    data() {
        return {
            isTabVisible: true,
            showUserView: true,
            gameOverDialog: false,
            gameOverDialogText: '',
            userInfo: {
                name: '',
                id: '',
                ready: false,
                offline: false,
                metadata: {
                    head: ''
                }
            },
            roomId: '',
            wss: null,
            pingResult: [],
            player: [],
            game: {},
            lastOp: {},
            opHistoryList: [],
            winner: {},
            rank: []
        }
    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile
        }
    },
    watch: {
        '$store.state.userInfo': {
            handler() {
                this.userInfo = this.$store.state.userInfo
            },
            deep: true
        },
        '$store.state.lastOp': {
            handler() {
                if (Object.keys(this.game).length === 0) return
                if (!this.isTabVisible && this.game.players[this.game.current].id === this.userInfo.id) {
                    const img = "/favicon.ico";
                    const text = `你的回合！`;
                    new Notification("步步为营", { body: text, icon: img })
                }
            },
            deep: true
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
            this.isTabVisible = !open
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
            let connectAttempts = 0 // 连接尝试次数
            const maxConnectAttempts = 3 // 最大连接尝试次数
            const reconnectInterval = 5000 // 重连间隔（毫秒）

            const connect = () => {
                if (connectAttempts > maxConnectAttempts) return
                console.info('尝试连接WebSocket...')
                this.wss = new WebSocket('wss://xypp.cc:18541')
                // this.wss = new WebSocket('ws://127.0.0.1:19981')

                this.wss.onopen = () => {
                    console.info('WebSocket连接已建立')
                    if (connectAttempts !== 0) this.$message.success('重连成功')
                    this.$store.commit('updateConnectStatus', 1)
                }

                this.wss.onmessage = (event) => {
                    // console.info('收到WebSocket消息：', JSON.parse(event.data))
                    const type = JSON.parse(event.data).type
                    switch (type) {
                        case 'ping':
                            this.wss.send(JSON.stringify(
                                { 'type': 'pong' }
                            ))
                            break
                        case 'pingResult':
                            this.pingResult = JSON.parse(event.data).ping
                            break
                        case 'room':
                            this.player = JSON.parse(event.data).player

                            this.player.forEach(player => {
                                if (player.id === this.userInfo.id) {
                                    this.$store.commit('updateIsUserReady', player.ready)
                                }
                            })

                            this.$store.commit('updatePlayerList', this.player)
                            break
                        case 'start':
                            this.game = JSON.parse(event.data).game
                            this.player = JSON.parse(event.data).game.players

                            this.$store.commit('updateGame', this.game)
                            this.$store.commit('updatePlayerList', this.player)
                            this.$store.commit('updateCurrentPlayer', this.game.current)
                            this.$store.commit('updateIsUserInGame', true)
                            break
                        case 'stage':
                            if (JSON.parse(event.data).lastOp.type === 'wall') {
                                this.player[JSON.parse(event.data).lastOp.player].wallRest -= 1

                                this.$store.commit('addInGameWall', JSON.parse(event.data).lastOp)
                            }else if (JSON.parse(event.data).lastOp.type === 'chess') {
                                this.$store.commit('changeInGameChess', JSON.parse(event.data).lastOp)
                            }
                            this.lastOp = JSON.parse(event.data).lastOp
                            this.opHistoryList.push(this.lastOp)

                            this.$store.commit('updateCurrentPlayer', JSON.parse(event.data).current)
                            this.$store.commit('updateLastOp', this.lastOp)
                            this.$store.commit('updatePlayerList', this.player)
                            this.$store.commit('updateOpHistoryList', this.opHistoryList)
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

                            this.$store.commit('gameOver')
                            this.$store.commit('updatePlayerList', this.player)
                            break
                        case 'msg':
                            this.$store.commit('addMsg', JSON.parse(event.data))
                            break
                        case 'fail':
                            this.$message.error('非法操作')
                            break
                    }
                }

                this.wss.onclose = () => {
                    console.warn('WebSocket连接已断开')
                    this.$store.commit('updateConnectStatus', 2)
                    if (connectAttempts === 0) this.$message.warning(`WebSocket连接已断开, 将在 ${(reconnectInterval / 1000)} 秒后尝试重新连接...`)

                    connectAttempts++ // 增加连接尝试次数
                    if (connectAttempts <= maxConnectAttempts) {
                        console.warn(`将在 ${(reconnectInterval / 1000)} 秒后尝试第 ${connectAttempts}/${maxConnectAttempts} 次重连`)
                        setTimeout(() => {
                            this.$store.commit('updateConnectStatus', 0)
                            this.$message.warning(`尝试第 ${connectAttempts}/${maxConnectAttempts} 次重连`)
                            connect()
                        }, reconnectInterval)
                    } else {
                        this.$store.commit('updateConnectStatus', 2)
                        this.$message.error('连接失败')
                        console.error('已达到最大连接尝试次数，停止重新连接。')
                    }
                }

                this.wss.onerror = (error) => {
                    console.error('WebSocket错误：', error)
                    // this.$message.error(`WebSocket错误：${error}`)
                }
            }

            connect()
        },

        /**
         * 监听页面是否可见
         *
         * @return void
         * @author ChiyukiRuon
         * */
        tabVisibility() {
            document.title = document.title.replaceAll('[后台]', '');
            // 用户息屏、或者切到后台运行 （离开页面）
            if (document.visibilityState === 'hidden') {
                document.title = '[后台]' + document.title;
                this.isTabVisible = false
            }
            // 用户打开或回到页面
            if (document.visibilityState === 'visible') {
                this.isTabVisible = true
            }
        },
    },
    mounted() {
        this.$store.commit('updateIsMobile', isMobileDevice())

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

        if (localStorage.getItem('UserInfo')) {
            this.userInfo = JSON.parse(localStorage.getItem('UserInfo'))
            if (this.userInfo.id === '') this.userInfo.id = generateId(this.userInfo.name)
            this.$store.commit('updateUserInfo', this.userInfo)
            this.showUserView = false
            this.startWss()
        }

        document.addEventListener('visibilitychange', this.tabVisibility)
    },
    beforeUnmount() {
        this.wss.close()
        document.removeEventListener('visibilitychange', this.tabVisibility)
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
