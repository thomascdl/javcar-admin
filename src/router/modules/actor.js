/** When your routing video is too long, you can split it into small modules **/

import Layout from '@/layout'

const imageRouter = {
  path: '/actor',
  component: Layout,
  redirect: '/actor/list',
  name: 'Actor',
  meta: {
    title: '演员管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/actor/actor-list'),
      name: 'actorTable',
      meta: {title: '演员列表'}
    }
  ]
}
export default imageRouter
