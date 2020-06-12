import request from '@/utils/request'

export function uploadbImg(data) {
  return request({
    url: '/back/bimg/',
    method: 'post',
    headers: {'content-type': 'multipart/form-data'},
    data
  })
}

export function getbImg(data) {
  return request({
    url: '/back/bimg/',
    method: 'get',
    params: data
  })
}

export function deletebImg(data) {
  return request({
    url: '/back/bimg/',
    method: 'delete',
    data
  })
}
