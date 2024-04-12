import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // {
        //     path: '/',
        //     name: 'home',
        //     component: HomeView
        // },
        // {
        //     path: '/user',
        //     name: 'user',
        //     // route level code-splitting
        //     // this generates a separate chunk (About.[hash].js) for this route
        //     // which is lazy-loaded when the route is visited.
        //     component: () => import('../views/UserView.vue')
        // },
        {
            path: '/oauth',
            name: 'oauth',
            component: () => import('../views/KOOKOauthView.vue'),
            meta: {
                title: 'KOOK 授权|步步为营'
            }
        }
    ]
})

export default router
