/**
 * 短信模板详情 api 封装
 *
 * @Author:    xiong
 * @Date:      2025-09-25 15:21:00
 * @Copyright  xiong
 */

import { postRequest, getRequest } from '/@/lib/axios';

export const smsSignApi = {

  /**
   * 查询短信签名列表  @author  xiong
   */
  querySignList: (params) => {
    return postRequest('/smsSign/querySignList', params);
  },

  /**
   * 更新短信签名  @author  xiong
   */
  updateSignList: (data) => {
    return postRequest('/smsSign/updateSignList', data);
  },

};
