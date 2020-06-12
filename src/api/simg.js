import request from '@/utils/request'

export function uploadsImg(data) {
  return request({
    url: '/back/simg/',
    method: 'post',
    headers: {'content-type': 'multipart/form-data'},
    data
  })
}

export function getsImg(data) {
  return request({
    url: '/back/simg/',
    method: 'get',
    params: data
  })
}

export function deletesImg(data) {
  return request({
    url: '/back/simg/',
    method: 'delete',
    data
  })
}
