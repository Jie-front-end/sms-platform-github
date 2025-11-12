/**
 * 发送短信 api 封装
 *
 * @Author:    xiong
 * @Date:      2025-09-25 15:21:00
 * @Copyright  xiong
 */

import { postRequest, getRequest, postDownload, getDownload } from '/@/lib/axios';

export const smsSendApi = {

  /**
   * 模板发送  @author  xiong
   */
  templateSend: (params) => {
    return postRequest('/smsSend/templateSend',params);
  },

  /**
   * 批量发送  @author  xiong
   */
  batchSend: (params) => {
    return postRequest('/smsSend/batchSend',params);
  },

  /**
   * 下载文件发送模板  @author  Claude Code
   */
  downloadFileSendTemplate: () => {
    return getDownload('/smsSend/fileSendTemplate', {});
  },

  /**
   * 文件批量发送  @author  Claude Code
   * @param {File} file - 要上传的文件
   */
  fileSend: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return postRequest('/smsSend/fileSend', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 快速发送  @author  Claude Code
   */
  quickSend: (params) => {
    return postRequest('/smsSend/quickSend', params);
  },

};
