/**
 * 违禁词管理 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2025-11-03
 * @Update:    2025-11-06
 */
import { postRequest, getRequest, request } from '/@/lib/axios';

export const forbiddenWordsApi = {

  /**
   * 分页查询违禁词  @author  Claude Code
   */
  queryPage: (param) => {
    return postRequest('/shield/sensitiveWord/page', param);
  },

  /**
   * 添加违禁词  @author  Claude Code
   */
  add: (param) => {
    return postRequest('/shield/sensitiveWord/add', param);
  },

  /**
   * 更新违禁词  @author  Claude Code
   */
  update: (param) => {
    return postRequest('/shield/sensitiveWord/update', param);
  },

  /**
   * 批量删除违禁词  @author  Claude Code
   */
  batchDelete: (idList) => {
    return request({
      url: '/shield/sensitiveWord/batch',
      method: 'delete',
      data: idList
    });
  },

  /**
   * 通过文件导入违禁词  @author  Claude Code
   */
  importFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request({
      url: '/shield/sensitiveWord/import',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 下载违禁词导入模板  @author  Claude Code
   */
  downloadTemplate: () => {
    return request({
      url: '/shield/sensitiveWord/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    }).then((response) => {
      handleDownload(response, '违禁词导入模板.xlsx');
    });
  },

  /**
   * 导出违禁词  @author  Claude Code
   * @param {Object} param - 查询参数
   * @param {string} param.word - 违禁词内容（模糊查询）
   * @param {string} param.wordType - 违禁词标签
   * @param {number} param.status - 状态 0-停用 1-在用
   * @param {string} param.createTimeStart - 录入时间起始
   * @param {string} param.createTimeEnd - 录入时间终止
   * @param {string} param.updateTimeStart - 更新时间起始
   * @param {string} param.updateTimeEnd - 更新时间终止
   */
  export: (param) => {
    return request({
      url: '/shield/sensitiveWord/export',
      method: 'post',
      data: param,
      responseType: 'blob'
    }).then((response) => {
      handleDownload(response, '违禁词列表.xlsx');
    });
  },

  /**
   * 检查文本是否包含违禁词  @author  Claude Code
   */
  checkText: (text) => {
    return postRequest('/sms/firewall/forbiddenWords/check', { text });
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
