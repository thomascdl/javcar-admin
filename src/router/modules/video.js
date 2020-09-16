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
      path: 'detail',
      component: () => import('@/views/video/video-detail'),
      name: 'detail',
      meta: { title: '影片详情' }
    },
    {
      path: 'fetch',
      component: () => import('@/views/video/fetch-video'),
      name: 'fetch',
      meta: { title: '获取影片' }
    }
  ]
}
export default tableRouter
