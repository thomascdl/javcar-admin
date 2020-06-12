/** When your routing video is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/video',
  component: Layout,
  redirect: '/video/list',
  name: 'Video',
  meta: {
    title: '影片管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/video/video-list'),
      name: 'VideoTable',
      meta: { title: '影片列表' }
    },
    {
      path: 'multi',
      component: () => import('@/views/video/multi-add'),
      name: 'multi',
      meta: { title: '批量添加' }
    },
    {
      path: 'detail',
      component: () => import('@/views/video/video-detail'),
      name: 'detail',
      meta: { title: '影片详情' }
    }
  ]
}
export default tableRouter
