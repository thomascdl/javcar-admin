import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/vue-element-admin/video/list',
    method: 'get',
    params
  })
}
