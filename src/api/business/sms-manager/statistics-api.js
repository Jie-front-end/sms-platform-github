/**
 * 短信统计报表 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2025-11-03
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const statisticsApi = {

  /**
   * 获取发送量统计数据  @author  Claude Code
   */
  getSendVolumeStats: (param) => {
    return postRequest('/sms/statistics/sendVolume', param);
  },

  /**
   * 获取成功率统计数据  @author  Claude Code
   */
  getSuccessRateStats: (param) => {
    return postRequest('/sms/statistics/successRate', param);
  },

  /**
   * 按日期范围获取统计数据  @author  Claude Code
   */
  getStatsByDateRange: (param) => {
    return postRequest('/sms/statistics/byDateRange', param);
  },

  /**
   * 获取按运营商统计数据  @author  Claude Code
   */
  getStatsByCarrier: (param) => {
    return postRequest('/sms/statistics/byCarrier', param);
  },

  /**
   * 导出统计数据  @author  Claude Code
   */
  exportStats: (param) => {
    return postRequest('/sms/statistics/export', param);
  },

  /**
   * 获取实时统计概览  @author  Claude Code
   */
  getRealTimeOverview: () => {
    return getRequest('/sms/statistics/overview');
  },

  /**
   * 获取短信发送统计概览  @author  Claude Code
   * @param {Object} param - 查询参数
   * @param {string} param.startDate - 开始日期 (必填)
   * @param {string} param.endDate - 结束日期 (必填)
   * @param {string} param.signName - 签名名称 (可选)
   * @param {string} param.templateCode - 模板代码 (可选)
   * @param {string} param.timeType - 统计时间类型: day-天, week-周, month-月 (必填)
   */
  getStatisticsOverview: (param) => {
    return postRequest('/smsSendRecord/statisticsOverview', param);
  },

  /**
   * 获取短信发送统计详情（图表数据）  @author  Claude Code
   * @param {Object} param - 查询参数
   * @param {string} param.startDate - 开始日期 (必填)
   * @param {string} param.endDate - 结束日期 (必填)
   * @param {string} param.signName - 签名名称 (可选)
   * @param {string} param.templateCode - 模板代码 (可选)
   * @param {string} param.timeType - 统计时间类型: day-天, week-周, month-月 (必填)
   * @returns {Promise} 返回统计详情数组
   */
  getStatisticsDetail: (param) => {
    return postRequest('/smsSendRecord/statisticsDetail', param);
  },

};
