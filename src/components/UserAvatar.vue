<template>
    <img
        v-if="showTextAvatar"
        :src="userInfo.metadata.head"
        class="avatar"
        :onerror="onAvatarError"
        alt="Avatar"
        :style="`width: ${size}px`"
    />
    <div v-else class="avatar">{{ userInfo.name }}</div>
</template>

<script>
export default {
    name: 'UserAvatar',
    props: {
        size: {
            type: Number,
            default: 50
        },
        userInfo: {}
    },
    computed: {
        game() {
            return this.$store.state.game
        },
        current() {
            return this.$store.state.currentPlayer
        }
    },
    data() {
        return {
            showTextAvatar: true
        }
    },
    methods: {
        onAvatarError(e) {
            const img = e.target;
            const original = this.userInfo.metadata.head;
            if (!original) {
                this.showTextAvatar = false;
                return;
            }
            if (!original.includes('googleusercontent.com') || original.includes('gavatar.chiyukiruon.com')) return;
            img.src = `https://gavatar.chiyukiruon.com/?url=${encodeURIComponent(original)}`;
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
    }
}
</script>

<style scoped>
.avatar {
    border-radius: 50px;
    width: 50px;
    height: 50px;
}
</style>
