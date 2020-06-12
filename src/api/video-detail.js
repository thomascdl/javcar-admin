import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/back/detail/',
    method: 'get',
    params: query
  })
}

export function getFh(query) {
  return request({
    url: '/back/video/search/',
    method: 'get',
    params: query
  })
}

export function getActor(query) {
  return request({
    url: '/back/actor/search/',
    method: 'get',
    params: query
  })
}

export function createVideoDetail(data) {
  return request({
    url: '/back/detail/',
    method: 'post',
    data
  })
}

export function updateVideoDetail(data) {
  return request({
    url: '/back/detail/',
    method: 'put',
    data
  })
}

export function deleteVideoDetail(data) {
  return request({
    url: '/back/detail/',
    method: 'delete',
    data
  })
}
