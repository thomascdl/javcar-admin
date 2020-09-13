import request from '@/utils/request'

export function fetchVideo(query) {
  return request({
    url: '/back/video/fetch/',
    method: 'get',
    timeout: 10000,
    params: query
  })
}

export function checkVideo(query) {
  return request({
    url: '/back/video/check/',
    method: 'get',
    params: query
  })
}

export function getImgOrActor(query) {
  return request({
    url: '/back/video/getImgOrActor/',
    method: 'get',
    params: query
  })
}
