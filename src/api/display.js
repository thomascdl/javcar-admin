import request from '@/utils/request'

export function getVideoRank() {
  return request({
    url: '/back/videorank/',
    method: 'get'
  })
}

export function getPanel() {
  return request({
    url: '/back/panel/',
    method: 'get'
  })
}
