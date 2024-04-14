<template>
    <div class="chat-box">
        <div class="chat-box-title">
            <span>聊天</span>
        </div>
        <div class="chat-box-list" ref="list">
            <div class="chat-box-item" v-for="(item, index) in $store.state.msgList" :key="index">
                <div class="chat-box-item-avatar">
                    <el-avatar :src="fromId2avatar(item.from)" :size="20">
                        {{ fromId2name(item.from) }}
                    </el-avatar>
                </div>
                <div class="chat-box-item-from">
                    <span>{{ fromId2name(item.from) }}</span>
                </div>
                <div class="chat-box-item-content">
                    <span>{{ item.msg }}</span>
                </div>
            </div>
        </div>
        <div class="chat-box-controls">
            <el-form :inline="true" style="padding-left: 15px;" @submit.prevent.stop="sendMsg">
                <el-form-item style="width: calc(100% - 70px);">
                    <el-input v-model="msg" placeholder="请输入消息" size="small"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click.prevent.stop="sendMsg" size="small">发送</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import { nextTick, watch } from 'vue';

export default {
    name: 'ChatBox',
    emits: ["send"],
    data() {
        return {
            msg: ""
        }
    },
    methods: {
        sendMsg() {
            this.$emit("send", { msg: this.msg });
            this.msg = "";
        },
        fromId2name(id) {
            if (!this.$store.state.playerList) return "?";
            if (!this.$store.state.playerList[id]) return "未知";
            return this.$store.state.playerList[id].name;
        },
        fromId2avatar(id) {
            if (!this.$store.state.game || !this.$store.state.playerList) return "";
            if (!this.$store.state.playerList[id]) return "";
            return this.$store.state.playerList[id].metadata.head;
        }
    },
    mounted() {
        watch(() => this.$store.state.msgList, (newVal, oldVal) => {
            nextTick(() => {
                this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
            });
        },{
            deep: true
        })
    }
}
</script>
<style scoped>
.chat-box {
    border-radius: 20px;
    min-height: 150px;
    height: auto !important;
    padding-bottom: 5px;
    background-color: var(--border-bg-color);
    margin-top: 5px;
}

.chat-box-title {
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

.chat-box-list {
    height: 200px;
    overflow-y: auto;
    margin-bottom: 4px;
}

.chat-box-item {
    padding-left: 15px;
    padding-right: 15px;
}

.chat-box-item-avatar {
    width: 20px;
    height: 30px;
    display: inline-block;

    span {
        vertical-align: text-bottom;
    }
}

.chat-box-item-from {
    height: 30px;
    display: inline-block;
}

.chat-box-item-from::after {
    content: ":";
    margin-right: 5px;
    margin-left: 5px;
}

.chat-box-item-content {
    height: 30px;
    display: inline-block;

    span {
        word-break: break-all;
    }
}

.el-form-item {
    margin-bottom: 5px;
    margin-right: 5px;
}
</style>