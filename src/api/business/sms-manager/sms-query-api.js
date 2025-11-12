/**
 * 短信查询 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2024-10-31
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const smsQueryApi = {

  /**
   * 分页查询短信发送记录  @author  Claude Code
   * @param {Object} param - 查询参数
   * @param {number} param.pageNum - 页码
   * @param {number} param.pageSize - 每页数量
   * @param {number} param.sendStatus - 发送状态(可选)
   * @param {string} param.phoneNumber - 手机号(可选)
   * @param {string} param.signName - 签名名称(可选)
   * @param {string} param.templateCode - 模板代码(可选)
   * @param {string} param.smsContent - 短信内容(可选)
   * @param {string} param.sendDateStart - 发送开始日期(可选)
   * @param {string} param.sendDateEnd - 发送结束日期(可选)
   * @param {string} param.receiveDateStart - 接收开始日期(可选)
   * @param {string} param.receiveDateEnd - 接收结束日期(可选)
   */
  queryPage: (param) => {
    return postRequest('/smsSendRecord/queryPage', param);
  },

  /**
   * 分页查询发送记录  @author  Claude Code
   */
  querySendRecords: (param) => {
    return postRequest('/sms/query/sendRecords', param);
  },

  /**
   * 获取发送统计  @author  Claude Code
   */
  getSendStatistics: (param) => {
    return postRequest('/sms/query/statistics', param);
  },

  /**
   * 查询发送状态  @author  Claude Code
   */
  querySendStatus: (param) => {
    return postRequest('/sms/query/sendStatus', param);
  },

  /**
   * 导出发送记录  @author  Claude Code
   */
  exportSendRecords: (param) => {
    return postRequest('/sms/query/exportSendRecords', param);
  },

  /**
   * 导出发送状态  @author  Claude Code
   */
  exportSendStatus: (param) => {
    return postRequest('/sms/query/exportSendStatus', param);
  },

  /**
   * 批量重发  @author  Claude Code
   */
  batchResend: (idList) => {
    return postRequest('/sms/query/batchResend', idList);
  },

  /**
   * 单条重发  @author  Claude Code
   */
  resendSingle: (id) => {
    return postRequest(`/sms/query/resend/${id}`);
  },

};