/**
 * 短信模板详情 api 封装
 *
 * @Author:    xiong
 * @Date:      2025-09-25 15:21:00
 * @Copyright  xiong
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const smsTemplateApi = {

  /**
   * 分页查询  @author  xiong
   */
  queryPage: (param) => {
    return postRequest('/smsTemplate/queryPage', param);
  },

  /**
   * 增加  @author  xiong
   */
  add: (param) => {
    return postRequest('/smsTemplate/add', param);
  },

  /**
   * 修改  @author  xiong
   */
  update: (param) => {
    return postRequest('/smsTemplate/update', param);
  },


  /**
   * 删除  @author  xiong
   */
  delete: (id) => {
    return getRequest(`/smsTemplate/delete/${id}`);
  },

  /**
   * 批量删除  @author  xiong
   */
  batchDelete: (idList) => {
    return postRequest('/smsTemplate/batchDelete', idList);
  },

  /**
   * 启用/禁用
   * @param {*} param 
   * @returns 
   */
  enable: (param) =>{
    return getRequest(`/smsTemplate/enable/${param.templateCode}`,param);
  },

  /**
   * 根据模板名称模糊查询模板列表
   * @param {*} templateName 
   * @returns 
   */
  queryFuzzyByName: (templateName) => {
    return getRequest('/smsTemplate/queryFuzzy',templateName);
  },

};
