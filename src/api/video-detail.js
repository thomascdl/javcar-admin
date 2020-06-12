import request from '@/utils/request'

export function fetchList(query) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/videodetail/',
    method: 'get',
    params: query
  })
}

export function getFh(query) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/videodetail/search/',
    method: 'get',
    params: query
  })
}

export function getActor(query) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/actor/search/',
    method: 'get',
    params: query
  })
}



export function createVideoDetail(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/videodetail/',
    method: 'post',
    data
  })
}

export function multiUpload(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/multiUpload/',
    method: 'post',
    data
  })
}

export function updateVideoDetail(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/videodetail/',
    method: 'put',
    data
  })
}

export function deleteArticle(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/',
    method: 'delete',
    data
  })
}
