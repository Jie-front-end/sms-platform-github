/**
 * 通讯录管理 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2025-11-06
 */
import { postRequest, getRequest, request } from '/@/lib/axios';

export const contactApi = {

  /**
   * 分页查询联系人  @author  Claude Code
   */
  queryPage: (param) => {
    return postRequest('/smsContact/page', param);
  },

  /**
   * 新增联系人  @author  Claude Code
   */
  add: (param) => {
    return postRequest('/smsContact/add', param);
  },

  /**
   * 更新联系人  @author  Claude Code
   */
  update: (param) => {
    return request({
      url: '/smsContact/update',
      method: 'put',
      data: param
    });
  },

  /**
   * 批量删除联系人  @author  Claude Code
   */
  batchDelete: (idList) => {
    return request({
      url: '/smsContact/batchDelete',
      method: 'delete',
      data: idList
    });
  },

};
