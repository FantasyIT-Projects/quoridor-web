<template>
    <div class="main">
        <el-avatar :src="userInfo.metadata.head" :size="80" />
    </div>
    <el-form>
        <el-form-item label="用户名" label-width="100">
            <el-input v-model="userInfo.name" clearable @change="checkUsername" />
        </el-form-item>
        <el-form-item label="头像链接" label-width="100">
            <el-input v-model="userInfo.metadata.head" clearable />
        </el-form-item>
    </el-form>
    <div class="oauth">
        <!-- KOOK 登录 -->
        <el-tooltip effect="dark" content="使用KOOK信息" placement="bottom">
            <img src="/kook.png" alt="使用KOOK信息"
                 style="width: 40px; margin: 1px; border-radius: 100%"
                 @click.prevent="loginWithKook"
            >
        </el-tooltip>

        <!-- Google 登录 -->
        <el-tooltip effect="dark" content="使用Google信息" placement="bottom">
            <img src="/google.png" alt="使用Google信息"
                 style="width: 35px; height: 35px; margin-top: 5px; margin-left: 10px; border-radius: 100%"
                 @click.prevent="loginWithGoogle"
            >
        </el-tooltip>

        <!-- QQ 登录 -->
        <el-tooltip effect="dark" content="使用QQ信息" placement="bottom">
            <img src="/qq.png" alt="使用QQ信息"
                 style="width: 42px; margin-left: 10px;"
                 @click.prevent="QQDialog = true"
            >
        </el-tooltip>

        <!-- 清除用户数据 -->
        <el-tooltip effect="dark" content="清除用户数据" placement="bottom">
            <img src="../../src/assets/img/delete.png" alt="清除用户数据"
                 style="width: 42px; margin-left: 10px;"
                 @click.prevent="clearUserInfo"
            >
        </el-tooltip>
    </div>

    <div class="button">
        <el-button type="primary" :disabled="isUsernameOK" @click="openUserView">确定</el-button>
    </div>

    <!-- QQ 获取信息对话框 -->
    <el-dialog
        v-model="QQDialog"
        title="获取QQ信息"
        width="250"
    >
        <el-input v-model="qq" placeholder="请输入QQ号" />
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="QQDialog = false">取消</el-button>
                <el-button type="primary" :loading="isGettingQQInfo"
                           @click="getUserInfoFromQQ(qq)"
                >
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import axios from 'axios'
import { generateId } from '@/utils/user.js'

export default {
    name: "UserView",
    data() {
        return {
            QQDialog: false,
            isGettingQQInfo: false,
            isUsernameOK: false,
            qq: '',
            userInfo: {
                name: "",
                id: "",
                ready: false,
                offline: false,
                metadata: {
                    head: ""
                },
            },
        }
    },
    watch: {
        'userInfo.name'(newVal) {
            if (this.isUsernameOK && newVal !== this.$store.state.userInfo.name) {
                this.userInfo.id = generateId(newVal)
                this.$store.commit('updateUserInfo', this.userInfo)
                localStorage.setItem('UserInfo', JSON.stringify(this.userInfo))
            }
        },
        'userInfo.metadata.head'(newVal) {
            if (newVal !== this.$store.state.userInfo.metadata.head) {
                this.$attrs.wss.send(JSON.stringify({
                    'type': 'metadata',
                    'metadata': {
                        'head': this.userInfo.metadata.head
                    }
                }))
                this.$store.commit('updateUserInfo', this.userInfo)
                localStorage.setItem('UserInfo', JSON.stringify(this.userInfo))
            }
        }
    },
    methods: {
        /**
         * 检测用户名合法性
         */
        checkUsername() {
            this.isUsernameOK = !(this.userInfo.name.replace(/\s+/g, "").length > 0)
        },

        /**
         * 使用KOOK登录
         */
        loginWithKook() {
            window.location.href = 'https://www.kookapp.cn/app/oauth2/authorize?id=24532&client_id=XG7IAyXh63KhEYAE&redirect_uri=https%3A%2F%2Fquoridor.chiyukiruon.top%2Foauth&response_type=code&scope=get_user_info'
        },

        /**
         * 使用Google登录
         */
        loginWithGoogle() {
            /* global google */
            const client = google.accounts.oauth2.initTokenClient({
                client_id: '292706659748-rnhd48f440th8o9vp5fsav4tndcs9qvn.apps.googleusercontent.com',
                scope: 'openid profile',
                callback: (response) => {
                    const accessToken = response.access_token
                    this.fetchGoogleUserInfo(accessToken)
                },
            })
            client.requestAccessToken()
        },

        /**
         * 使用QQ号获取信息
         */
        getUserInfoFromQQ(qq) {
            this.isGettingQQInfo = true
            axios.get(`https://api.qjqq.cn/api/qqinfo?qq=${qq}`).then(res => {
                if (res.data.code === 200) {
                    this.userInfo.name = res.data.name
                    this.userInfo.metadata.head = res.data.imgurl
                    this.userInfo.id = generateId(res.data.name)

                    localStorage.setItem('UserInfo', JSON.stringify(this.userInfo))
                    this.$store.commit('updateUserInfo', this.userInfo)
                    this.isGettingQQInfo = false
                    this.QQDialog = false
                    this.openUserView()
                } else {
                    this.$message.error('获取信息失败')
                    this.isGettingQQInfo = false
                }
            }).catch(error => {
                this.$message.error(error.message)
                this.isGettingQQInfo = false
            })
        },

        /**
         * 获取Google用户信息
         */
        async fetchGoogleUserInfo(token) {
            try {
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = res.data
                this.userInfo.name = data.name
                this.userInfo.metadata.head = data.picture
                this.userInfo.id = generateId(data.email || data.sub)

                localStorage.setItem('UserInfo', JSON.stringify(this.userInfo))
                this.$store.commit('updateUserInfo', this.userInfo)
                this.$message.success('Google 登录成功')
                this.openUserView()
            } catch (e) {
                console.error(e)
                this.$message.error('获取 Google 用户信息失败')
            }
        },

        async checkAvatar(url) {
            try {
                const res = await fetch(url, { method: 'HEAD' });
                if (!res.ok) throw new Error();
                return url;
            } catch {
                return `https://gavatar.chiyukiruon.com/?url=${encodeURIComponent(url)}`;
            }
        },

        /**
         * 清除用户数据
         */
        clearUserInfo() {
            this.userInfo = {
                name: "",
                id: "",
                ready: false,
                offline: false,
                metadata: { head: "" },
            }
            localStorage.clear()
            this.$store.commit('updateUserInfo', this.userInfo)
            this.isUsernameOK = true
        },

        /**
         * 关闭用户信息页面
         */
        openUserView() {
            if (this.userInfo.id === '') {
                this.userInfo.id = generateId(this.userInfo.name)
            }

            localStorage.setItem('UserInfo', JSON.stringify(this.userInfo))
            this.$store.commit('updateUserInfo', this.userInfo)
            this.$emit('openUserView', false)
        }
    },
    mounted() {
        if (localStorage.getItem("UserInfo")) {
            this.userInfo = JSON.parse(localStorage.getItem("UserInfo"))
            this.checkAvatar(this.userInfo.metadata.head).then(url => {
                this.userInfo.metadata.head = url
            })
        } else {
            this.checkUsername()
        }
    }
}
</script>

<style scoped>
.main {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px;
}

.oauth {
    display: flex;
    justify-content: center;
}

.button {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>
