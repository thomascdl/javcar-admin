import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/back/actor/',
    method: 'get',
    params: query
  })
}


export function createActor(data) {
  return request({
    url: '/back/actor/',
    method: 'post',
    data
  })
}

export function updateActor(data) {
  return request({
    url: '/back/actor/',
    method: 'put',
    data
  })
}

export function deleteActor(data) {
  return request({
    url: '/back/actor/',
    method: 'delete',
    data
  })
}
