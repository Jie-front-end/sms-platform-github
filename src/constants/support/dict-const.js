/**
 * 字典key 编码 常量
 *
 * 该常量来自于 字典管理中的数据，写在该文件目的是为了统一引用，将来好修改
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2024-09-03 22:09:10
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

export const DICT_SPLIT = ',';

export const DICT_CODE_ENUM = {
  GOODS_PLACE: 'GOODS_PLACE',
};

/**
 * 短信相关字典
 */
export const DICT_SMS_ENUM = {
  SMS_OUTER_TEMPLATE_TYPE: 'sms_outer_template_type',//短信-对外使用模板类型
  SMS_TEMPLATE_TYPE: 'sms_template_type',//短信-模板类型
  SMS_AUDIT_STATUS: 'sms_audit_status',//短信-模板审核状态
  SMS_TEMPLATE_ENABLED: 'sms_template_enabled',//短信-模板启用状态
};
/**
 * 通用字典
 */
export const DICT_GENERAL_ENUM = {
  GENERAL_DELETED_FLAG: 'general_deleted_flag',//通用-删除状态
};

export default {
  DICT_CODE_ENUM,
  DICT_SMS_ENUM,
  DICT_GENERAL_ENUM,
};
