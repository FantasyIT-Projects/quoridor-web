import { createStore } from 'vuex'


export default createStore({
    state: {
        // 在这里定义你的状态
        game: {},
        inGameWalls: [],
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
        enableNotify: false,
        isUserReady: false,
        isUserInRoom: false,
        opHistoryList: [],
        msgList: [],
        playerList: [],
    },
    mutations: {
        // 在这里定义同步修改状态的方法(mutations)
        updateGame(state, game) {
            state.game = game
            // console.log('game updated', game)
        },

        updateInGameWalls(state, inGameWalls) {
            state.inGameWalls = inGameWalls
            // console.log('inGameWalls updated', inGameWalls)
        },

        addInGameWall(state, newWall) {
            state.inGameWalls.push(newWall)
            // console.log('inGameWalls updated', inGameWalls)
        },

        updateLastOp(state, lastOp) {
            state.lastOp = lastOp
            // console.log('lastOp updated', lastOp)
        },

        updateRoomId(state, roomId) {
            state.roomId = roomId
            // console.log('roomId updated', roomId)
        },

        updatePlayerList(state, playerList) {
            state.playerList = playerList
            // console.log('playerList updated', playerList)
        },

        updateUserInfo(state, userInfo) {
            state.userInfo = userInfo
            // console.log('userInfo updated', userInfo)
        },

        updateIsUserReady(state, isUserReady) {
            state.isUserReady = isUserReady
            // console.log('isUserReady updated', isUserReady)
        },

        updateIsUserInRoom(state, isUserInRoom) {
            state.isUserInRoom = isUserInRoom
            // console.log('isUserInRoom updated', isUserInRoom)
        },

        updateEnableNotify(state, enableNotify) {
            state.enableNotify = enableNotify
            // console.log('enableNotify updated', enableNotify)
        },

        updateOpHistoryList(state, opHistoryList) {
            state.opHistoryList = opHistoryList
            // console.log('opHistoryList updated', opHistoryList)
        },

        addMsg(state, msgItem) {
            state.msgList.push(msgItem)
            // console.log('msgList updated', msgItem)
        },

        gameOver(state) {
            state.game = {}
            state.inGameWalls = []
            state.lastOp = {}
            state.isUserReady = false
            state.opHistoryList = []
        },
    },
    actions: {
        // 在这里定义异步操作或提交mutations的方法(actions)
    },
    getters: {
        // 在这里定义计算属性(getters)
    }
})