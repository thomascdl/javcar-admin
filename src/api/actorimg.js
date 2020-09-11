import request from '@/utils/request'

export function uploadActorImg(data) {
  return request({
    url: '/back/actorimg/',
    method: 'post',
    headers: {'content-type': 'multipart/form-data'},
    data
  })
}

export function getActorImg(data) {
  return request({
    url: '/back/actorimg/',
    method: 'get',
    params: data
  })
}

export function deleteActorImg(data) {
  return request({
    url: '/back/actorimg/',
    method: 'delete',
    data
  })
}
