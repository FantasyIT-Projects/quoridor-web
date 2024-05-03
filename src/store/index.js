import { createStore } from 'vuex'


export default createStore({
    state: {
        // 在这里定义你的状态
        isMobile: false,
        connectStatus: 0, //0 连接中, 1 已连接, 2 连接断开
        game: {},
        inGameChess: [],
        inGameWalls: [],
        currentPlayer: -1,
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
        isUserInGame: false,
        opHistoryList: [],
        msgList: [],
        playerList: [],
    },
    mutations: {
        // 在这里定义同步修改状态的方法(mutations)
        updateIsMobile(state, isMobile) {
            state.isMobile = isMobile
        },

        updateConnectStatus(state, connectStatus) {
            state.connectStatus = connectStatus
        },

        updateGame(state, game) {
            state.game = JSON.parse(JSON.stringify(game))
            state.inGameChess = JSON.parse(JSON.stringify(game)).chesses
            state.inGameWalls = JSON.parse(JSON.stringify(game)).walls
        },

        updateInGameChess(state, inGameChess) {
            state.inGameChess = inGameChess
        },

        changeInGameChess(state, chess) {
            state.inGameChess[chess.player] = chess
        },

        updateInGameWalls(state, inGameWalls) {
            state.inGameWalls = inGameWalls
        },

        addInGameWall(state, newWall) {
            state.inGameWalls.push(newWall)
        },

        updateCurrentPlayer(state, currentPlayer) {
            state.currentPlayer = currentPlayer
        },

        updateLastOp(state, lastOp) {
            state.lastOp = lastOp
        },

        updateRoomId(state, roomId) {
            state.roomId = roomId
        },

        updatePlayerList(state, playerList) {
            state.playerList = playerList
        },

        updateUserInfo(state, userInfo) {
            state.userInfo = userInfo
        },

        updateIsUserReady(state, isUserReady) {
            state.isUserReady = isUserReady
        },

        updateIsUserInRoom(state, isUserInRoom) {
            state.isUserInRoom = isUserInRoom
        },

        updateIsUserInGame(state, isUserInGame) {
            state.isUserInGame = isUserInGame
        },

        updateEnableNotify(state, enableNotify) {
            state.enableNotify = enableNotify
        },

        updateOpHistoryList(state, opHistoryList) {
            state.opHistoryList = opHistoryList
        },

        addMsg(state, msgItem) {
            state.msgList.push(msgItem)
        },

        gameOver(state) {
            state.game = {}
            state.inGameChess = []
            state.inGameWalls = []
            state.currentPlayer = -1
            state.lastOp = {}
            state.isUserReady = false
            state.isUserInGame = false
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