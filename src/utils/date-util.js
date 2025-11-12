/**
 * 日期时间工具函数
 *
 * @Author:    Claude Code
 * @Date:      2024-11-05
 */
import dayjs from 'dayjs'

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateTime) {
    return '-'
  }
  return dayjs(dateTime).format(format)
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) {
    return '-'
  }
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param {string|Date} time - 时间
 * @param {string} format - 格式化模板，默认 'HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, format = 'HH:mm:ss') {
  if (!time) {
    return '-'
  }
  return dayjs(time).format(format)
}

/**
 * 获取当前日期时间
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 当前日期时间字符串
 */
export function now(format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs().format(format)
}

/**
 * 获取今天的开始时间
 * @returns {string} 今天的开始时间
 */
export function getTodayStart() {
  return dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取今天的结束时间
 * @returns {string} 今天的结束时间
 */
export function getTodayEnd() {
  return dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 计算两个日期之间的天数差
 * @param {string|Date} startDate - 开始日期
 * @param {string|Date} endDate - 结束日期
 * @returns {number} 天数差
 */
export function daysBetween(startDate, endDate) {
  return dayjs(endDate).diff(dayjs(startDate), 'day')
}

/**
 * 在指定日期上增加天数
 * @param {string|Date} date - 日期
 * @param {number} days - 增加的天数
 * @param {string} format - 格式化模板
 * @returns {string} 新日期字符串
 */
export function addDays(date, days, format = 'YYYY-MM-DD') {
  return dayjs(date).add(days, 'day').format(format)
}

/**
 * 在指定日期上减少天数
 * @param {string|Date} date - 日期
 * @param {number} days - 减少的天数
 * @param {string} format - 格式化模板
 * @returns {string} 新日期字符串
 */
export function subtractDays(date, days, format = 'YYYY-MM-DD') {
  return dayjs(date).subtract(days, 'day').format(format)
}

/**
 * 判断日期是否在指定范围内
 * @param {string|Date} date - 要判断的日期
 * @param {string|Date} startDate - 开始日期
 * @param {string|Date} endDate - 结束日期
 * @returns {boolean} 是否在范围内
 */
export function isBetween(date, startDate, endDate) {
  const targetDate = dayjs(date)
  return targetDate.isAfter(dayjs(startDate)) && targetDate.isBefore(dayjs(endDate))
}

/**
 * 判断是否是今天
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否是今天
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否是昨天
 * @param {string|Date} date - 日期
 * @returns {boolean} 是否是昨天
 */
export function isYesterday(date) {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}
