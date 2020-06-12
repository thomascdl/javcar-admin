import request from '@/utils/request'

export function uploadbImg(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/bimg/',
    method: 'post',
    headers: { 'content-type': 'multipart/form-data' },
    data
  })
}

export function getbImg(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/bimg/',
    method: 'get',
    params: data
  })
}

export function deletebImg(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/video/bimg/',
    method: 'delete',
    data
  })
}
