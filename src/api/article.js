import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/back/video/',
    method: 'get',
    params: query
  })
}

export function createVideo(data) {
  return request({
    url: '/back/video/',
    method: 'post',
    data
  })
}

export function multiUpload(data) {
  return request({
    url: '/back/video/batchadd/',
    method: 'post',
    data
  })
}

export function updateVideo(data) {
  return request({
    url: '/back/video/',
    method: 'put',
    data
  })
}

export function deleteVideo(data) {
  return request({
    url: '/back/video/',
    method: 'delete',
    data
  })
}
