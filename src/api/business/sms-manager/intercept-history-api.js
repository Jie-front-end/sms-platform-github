/**
 * 拦截历史管理 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2025-11-06
 */
import { postRequest, getRequest, request } from '/@/lib/axios';

export const interceptHistoryApi = {

  /**
   * 分页查询拦截历史  @author  Claude Code
   * @param {Object} param - 查询参数
   * @param {number} param.pageNum - 页码(必填)
   * @param {number} param.pageSize - 每页数量(必填)
   * @param {string} param.phoneNumber - 手机号码
   * @param {string} param.interceptType - 拦截类型
   * @param {string} param.scene - 业务场景
   * @param {string} param.clientIp - 客户端IP
   * @param {string} param.sender - 短信发送人
   * @param {number} param.status - 状态：1-有效，0-无效
   * @param {string} param.interceptReason - 拦截原因关键词
   * @param {Date|string} param.startTime - 开始时间
   * @param {Date|string} param.endTime - 结束时间
   * @param {boolean} param.searchCount - 是否查询总条数
   * @param {Array} param.sortItemList - 排序字段集合
   */
  queryPage: (param) => {
    return getRequest('/shield/interceptHistory/page', param);
  },

  /**
   * 获取拦截统计  @author  Claude Code
   */
  getStatistics: (param) => {
    return getRequest('/shield/interceptHistory/statistics', param);
  },

  /**
   * 获取拦截历史详情  @author  Claude Code
   */
  getDetail: (id) => {
    return getRequest(`/shield/interceptHistory/${id}`);
  },

  /**
   * 导出拦截记录  @author  Claude Code
   * @param {Object} param - 导出参数
   * @param {string} param.phoneNumber - 手机号码
   * @param {string} param.interceptType - 拦截类型
   * @param {string} param.scene - 业务场景
   * @param {string} param.clientIp - 客户端IP
   * @param {string} param.startTime - 开始时间
   * @param {string} param.endTime - 结束时间
   * @param {number} param.status - 状态：1-有效，0-无效
   * @param {string} param.interceptReason - 拦截原因关键词
   * @param {string} param.sender - 短信发送人
   */
  export: (param) => {
    return request({
      url: '/shield/interceptHistory/export',
      method: 'post',
      data: param,
      responseType: 'blob'
    }).then((response) => {
      handleDownload(response, '拦截历史记录.xlsx');
    });
  },

  /**
   * 批量删除拦截记录  @author  Claude Code
   */
  batchDelete: (idList) => {
    return request({
      url: '/shield/interceptHistory/batch',
      method: 'delete',
      data: idList
    });
  },

  /**
   * 释放拦截（改为无效状态）  @author  Claude Code
   * @param {number|string} id - 拦截记录ID
   * @param {string} remark - 放行备注（可选）
   */
  release: (id, remark) => {
    const params = {}
    if (remark) {
      params.remark = remark
    }
    return postRequest(`/shield/interceptHistory/release/${id}`, null, params);
  },

};

/**
 * 处理文件下载
 */
function handleDownload(response, defaultFilename) {
  if (!response || !response.data) {
    return;
  }

  // 获取返回类型
  const contentType = response.headers['content-type'] || response.headers['Content-Type'];

  // 构建下载数据
  const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;

  // 从消息头获取文件名
  let filename = defaultFilename;
  const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
    }
  }

  link.setAttribute('download', filename);

  // 触发点击下载
  document.body.appendChild(link);
  link.click();

  // 下载完释放
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
