/** When your routing video is too long, you can split it into small modules **/

import Layout from '@/layout'

const displayRouter = {
  path: '/display',
  component: Layout,
  redirect: '/display/data',
  name: 'Display',
  meta: {
    title: '数据展示',
    icon: 'table'
  },
  children: [
    {
      path: 'data',
      component: () => import('@/views/display/data-show'),
      name: 'data',
      meta: { title: '数据展示' }
    }
  ]
}
export default displayRouter
