<script setup>
import GameBoard from "@/components/GameBoard.vue";
</script>

<template>
    <div class="header">Header</div>
    <div class="main">
        <GameBoard />
        <div class="side">
            <div>History</div>
            <div>Chat</div>
        </div>
    </div>
</template>

<style scoped>
.main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.side {
    margin-left: 20px;
}
</style>
