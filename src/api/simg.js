import request from '@/utils/request'

export function uploadsImg(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/simg/',
    method: 'post',
    headers: { 'content-type': 'multipart/form-data' },
    data
  })
}

export function getsImg(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/simg/',
    method: 'get',
    params: data
  })
}

export function deletesImg(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/simg/',
    method: 'delete',
    data
  })
}
