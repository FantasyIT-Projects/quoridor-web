<template>
    <div v-loading.fullscreen.lock="isLoading" element-loading-text="获取用户信息"></div>
</template>

<script>
import {ElMessage} from "element-plus";
import axios from "axios";
import { generateId } from '@/utils/user.js'
import router from '@/router/index.js'

export default {
    name: "KOOKOauthView",
    data() {
        return {
            isLoading: true,
        }
    },
    methods: {
        /**
         * 格式化玩家信息
         *
         * @param {Object} userObj 从KOOK获取的用户信息
         * @returns {Object} 玩家信息
         * @author ChiyukiRuon
         * */
        extractUserInfo(userObj) {
            const { username, avatar } = userObj;

            return {
                name: username,
                id: generateId(username),
                ready: false,
                offline: false,
                metadata: {
                    head: avatar
                },
            }
        }
    },
    mounted() {
        if (this.$route.query.code) {
            axios.post(`https://bangumi-api.chiyukiruon.top/get_token?code=${this.$route.query.code}`).then(resp => {
                if (!resp.data.code) {
                    axios.post(`https://bangumi-api.chiyukiruon.top/get_user_info?access_token=${resp.data.access_token}`)
                        .then(response => {
                            if (response.data.code === 0) {
                                this.$store.commit('updateUserInfo', this.extractUserInfo(response.data.data))
                                localStorage.setItem('UserInfo', JSON.stringify(this.extractUserInfo(response.data.data)))
                            } else {
                                ElMessage.error('出现错误')
                                console.error(response)
                            }
                            this.isLoading = false

                            router.push('/')
                      })
                }else {
                    ElMessage.error('授权失败')
                }
            }).catch(() => {
                ElMessage.error('授权失败，code无效')
                this.$router.push({
                    path: `/`,
                })
            })
        }else {
            this.$router.push({
                path: `/`,
            })
        }
    }
}
</script>

<style scoped>

</style>