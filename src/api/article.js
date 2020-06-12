import request from '@/utils/request'

export function fetchList(query) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/fh/',
    method: 'get',
    params: query
  })
}

export function createArticle(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/',
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

export function updateArticle(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/',
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
