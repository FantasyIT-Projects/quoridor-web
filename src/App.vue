<script setup>
import UserView from '@/views/UserView.vue'
import HomeView from '@/views/HomeView.vue'
</script>

<template>
    <HomeView v-if="!showUserView"
              :userInfo="userInfo" :wss="wss" :pingResult="pingResult"
              :player="player" :game="game" :lastOp="lastOp"
              v-bind="$attrs"
              v-on="$emit"
              @openUserView="openUserView"
    />
    <UserView v-else
              @openUserView="openUserView"
    />
</template>

<script>
export default {
    data() {
        return {
            showUserView: true,
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
            game: [],
            lastOp: {},
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
            this.showUserView = open
        }
    },
    mounted() {
        // 创建WebSocket实例，指定WSS URL
        if (localStorage.getItem('UserInfo')) {
            this.userInfo = JSON.parse(localStorage.getItem('UserInfo'))
            this.showUserView = false
            this.wss = new WebSocket('ws://zxy19.e2.luyouxia.net:20307');

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
                        break
                    case 'stage':
                        this.game.current = JSON.parse(event.data).current
                        this.lastOp = JSON.parse(event.data).lastOp
                }
            }

            this.wss.onclose = () => {
                // this.ws = null
                console.warn('WebSocket连接已关闭')

            }

            this.wss.onerror = (error) => {
                console.error('WebSocket错误：', error)
            }
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
</style>
