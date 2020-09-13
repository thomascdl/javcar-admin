import request from '@/utils/request'

export function fetchVideo(query) {
  return request({
    url: '/back/video/fetch/',
    method: 'get',
    timeout: 10000,
    params: query
  })
}
