import { request } from '@/utils/index'
export default {
  login(params) {
    return request({
      url: '/login',
      method: 'post',
      data: params
    })
  },
  getMenuList(params) {
    return request({
      url: '/menu/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  getPermissionList() {
    return request({
      url: '/users/permissionList',
      method: 'get',
      data: {},
      mock: false
    })
  },
  getUserList(params) {
    return request({
      url: '/users/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  getAllUserList() {
    return request({
      url: '/users/all/list',
      method: 'get',
      data: {},
      mock: false
    })
  },
  userDel(params) {
    return request({
      url: '/users/delete',
      method: 'post',
      data: params,
      mock: false
    })
  },
  getRoleAllList() {
    return request({
      url: '/roles/all/list',
      method: 'get',
      data: {},
      mock: false
    })
  },
  getRoleList(params) {
    return request({
      url: '/roles/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  getDepartmentList(params) {
    return request({
      url: '/department/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  departmentOperate(params) {
    return request({
      url: '/department/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  userSubmit(params) {
    return request({
      url: '/users/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  menuSubmit(params) {
    return request({
      url: '/menu/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  roleOperate(params) {
    return request({
      url: '/roles/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  updatePermission(params) {
    return request({
      url: '/roles/update/permission',
      method: 'post',
      data: params,
      mock: false
    })
  },
  getLeaveList(params) {
    return request({
      url: '/leave/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  getRatifyList(params) {
    return request({
      url: '/leave/ratify/list',
      method: 'get',
      data: params,
      mock: false
    })
  },
  leaveOperate(params) {
    return request({
      url: '/leave/operate',
      method: 'post',
      data: params,
      mock: false
    })
  },
  leaveApprove(params) {
    return request({
      url: '/leave/approve',
      method: 'post',
      data: params,
      mock: false
    })
  },
  noticeCount(params) {
    return request({
      url: '/leave/approve/notice',
      method: 'get',
      data: {},
      mock: false
    })
  }
}
