/** When your routing video is too long, you can split it into small modules **/

import Layout from '@/layout'

const imageRouter = {
  path: '/image',
  component: Layout,
  redirect: '/image/simg',
  name: 'Image',
  meta: {
    title: '图片管理',
    icon: 'table'
  },
  children: [
    {
      path: 'simg',
      component: () => import('@/views/image/sImg'),
      name: 'SimgTable',
      meta: { title: '小图管理' }
    },
    {
      path: 'bimg',
      component: () => import('@/views/image/bImg'),
      name: 'BimgTable',
      meta: { title: '大图管理' }
    }
  ]
}
export default imageRouter
