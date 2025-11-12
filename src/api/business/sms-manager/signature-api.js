/*
 * 短信签名管理 API
 *
 * @Author:    Claude
 * @Date:      2025-11-04
 */

import { getRequest, postRequest, deleteRequest } from '/@/lib/axios';

export const signatureApi = {
  // 查询签名列表
  queryPage: (params) => {
    return postRequest('/smsSign/querySignList', params);
  },

  // 添加签名
  add: (data) => {
    return postRequest('/smsSign/add', data);
  },

  // 更新签名
  update: (data) => {
    return postRequest('/smsSign/update', data);
  },

  // 删除签名
  delete: (signatureId) => {
    return deleteRequest(`/smsSign/delete/${signatureId}`);
  },

  // 批量删除签名
  batchDelete: (signatureIds) => {
    return postRequest('/smsSign/batchDelete', signatureIds);
  },

  // 启用/禁用签名
  updateStatus: (params) => {
    return postRequest('/smsSign/updateStatus', params);
  },

  // 获取签名详情
  queryById: (signatureId) => {
    return getRequest(`/smsSign/queryById/${signatureId}`);
  },

  // 审核签名
  audit: (params) => {
    return postRequest('/smsSign/audit', params);
  }
};