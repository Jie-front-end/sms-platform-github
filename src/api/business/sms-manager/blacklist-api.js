/**
 * 黑名单管理 api 封装
 *
 * @Author:    Claude Code
 * @Date:      2024-10-31
 * @Update:    2025-11-06
 */
import { postRequest, getRequest, request } from '/@/lib/axios';

export const blacklistApi = {

  /**
   * 分页查询黑名单  @author  Claude Code
   */
  queryPage: (param) => {
    return postRequest('/shield/blacklist/page', param);
  },

  /**
   * 新增黑名单号码  @author  Claude Code
   */
  add: (param) => {
    return postRequest('/shield/blacklist', param);
  },

  /**
   * 修改黑名单号码  @author  Claude Code
   */
  update: (id, param) => {
    return request({
      url: `/shield/blacklist/${id}`,
      method: 'put',
      data: param
    });
  },

  /**
   * 批量添加黑名单  @author  Claude Code
   * @deprecated 建议使用 add 方法单个添加
   */
  batchAdd: (param) => {
    return postRequest('/shield/blacklist', param);
  },

  /**
   * 从黑名单移除  @author  Claude Code
   */
  remove: (id) => {
    return request({
      url: '/shield/blacklist/batch',
      method: 'delete',
      data: [id]
    });
  },

  /**
   * 批量删除黑名单  @author  Claude Code
   */
  batchDelete: (idList) => {
    return postRequest('/sms/blacklist/batchDelete', idList);
  },

  /**
   * 通过文件导入黑名单  @author  Claude Code
   */
  importFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request({
      url: '/shield/blacklist/import',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 下载黑名单导入模板  @author  Claude Code
   */
  downloadTemplate: () => {
    return request({
      url: '/shield/blacklist/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    }).then((response) => {
      handleDownload(response, '黑名单导入模板.xlsx');
    });
  },

  /**
   * 导出黑名单  @author  Claude Code
   */
  export: (param) => {
    return request({
      url: '/shield/blacklist/export',
      method: 'post',
      params: param,
      responseType: 'blob'
    }).then((response) => {
      handleDownload(response, '黑名单列表.xlsx');
    });
  },

  /**
   * 检查手机号是否在黑名单  @author  Claude Code
   */
  checkMobile: (mobile) => {
    return getRequest(`/sms/blacklist/check/${mobile}`);
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