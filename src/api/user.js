import request from '@/utils/request'

export function login(data) {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/login/',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    baseURL: 'http://127.0.0.1:8001',
    url: '/login/',
    method: 'get',
    // params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
