/**
 * 防火墙配置 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2024-11-05
 */
import { postRequest, getRequest, putRequest, deleteRequest } from '/@/lib/axios';

export const firewallConfigApi = {

  /**
   * 获取所有频率限制配置列表  @author  Claude Code
   */
  getConfigList: () => {
    return getRequest('/shield/rateLimit/list');
  },

  /**
   * 创建配置  @author  Claude Code
   */
  createConfig: (param) => {
    return postRequest('/shield/rateLimit', param);
  },

  /**
   * 更新配置  @author  Claude Code
   */
  updateConfig: (param) => {
    return putRequest('/shield/rateLimit/update', param);
  },

  /**
   * 删除配置  @author  Claude Code
   */
  deleteConfig: (id, scene) => {
    return deleteRequest(`/shield/rateLimit/${id}`, { scene });
  },

};
