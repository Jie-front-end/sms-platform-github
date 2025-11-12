/**
 * 增强版：校验多个手机号，返回详细结果（含错误号码）
 * @param {string} input - 输入的字符串
 * @returns {object} - { isValid: boolean, errorPhones: array }
 */
export function validateMultiPhoneWithDetails(input) {
  const result = {
    isValid: true,       // 整体是否合法
    errorPhones: []      // 无效的手机号码列表
  };

  if (!input.trim()) {
    result.isValid = false;
    result.errorPhones.push("（输入不能为空）");
    return result;
  }

  // 拆分号码并过滤空项（trim后为空的项直接排除，不加入错误列表）
  const phoneList = input.split(/[,|\n]/).filter(phone => phone.trim());
  const phoneReg = /^1[3-9]\d{9}$/;

  // 逐一号码校验，收集无效号码
  phoneList.forEach(phone => {
    const trimmedPhone = phone.trim();
    if (!phoneReg.test(trimmedPhone)) {
      result.isValid = false;
      result.errorPhones.push(trimmedPhone);
    }
  });

  return result;
}

/**
 * 增强版：统一分隔符 + 校验手机号格式 + 去重
 * @param {string} input - 原始输入
 * @returns {string} - 仅含合法、唯一手机号的半角逗号分隔字符串
 */
export function processPhones(input) {
  if (!input || typeof input !== 'string') return '';

  // 1. 拆分 + 过滤空项（同基础版）
  const phoneArray = input.split(/,|\n/);
  const trimmedPhones = phoneArray.map(phone => phone.trim()).filter(phone => phone !== '');

  // 2. 手机号格式校验正则（国内11位手机号：13-19开头）
  const phoneReg = /^1[3-9]\d{9}$/;

  // 3. 过滤无效手机号 + 去重（用 Set 自动去重）
  const validUniquePhones = [...new Set(
    trimmedPhones.filter(phone => phoneReg.test(phone))
  )];

  // 4. 用半角逗号拼接
  return validUniquePhones.join(',');
}