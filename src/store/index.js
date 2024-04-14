import { createStore } from 'vuex'


export default createStore({
    state: {
        // 在这里定义你的状态
        game: {},
        lastOp: {},
        roomId: "",
        userInfo: {
            name: "",
            id: "",
            ready: false,
            offline: false,
            metadata: {
                head: ""
            },
        },
        msgList: [],
        playerList: [],
    },
    mutations: {
        // 在这里定义同步修改状态的方法(mutations)
        updateGame(state, game) {
            state.game = game
            console.log('game updated', game)
        },

        updateLastOp(state, lastOp) {
            state.lastOp = lastOp
            console.log('lastOp updated', lastOp)
        },

        updateRoomId(state, roomId) {
            state.roomId = roomId
            console.log('roomId updated', roomId)
        },
        updatePlayerList(state, playerList) {
            state.playerList = playerList
            console.log('playerList updated', playerList)
        },
        updateUserInfo(state, userInfo) {
            state.userInfo = userInfo
            console.log('userInfo updated', userInfo)
        },

        addMsg(state, msgItem) {
            state.msgList.push(msgItem)
            console.log('msgList updated', msgItem)
        },
    },
    actions: {
        // 在这里定义异步操作或提交mutations的方法(actions)
    },
    getters: {
        // 在这里定义计算属性(getters)
    }
})