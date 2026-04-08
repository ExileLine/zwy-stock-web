/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// API 基础地址
// 开发环境：使用相对路径，由 Vite 代理到后端
// 生产环境：使用相对路径，由 nginx 代理到后端
export const API_BASE_URL = '/api/v1';

// 接口地址配置
export const API_ENDPOINTS = {
  // 登录相关
  LOGIN: `${API_BASE_URL}/acc/login`,
  LOGOUT: `${API_BASE_URL}/acc/logout`,

  // 库存相关
  STOCK_PAGE: `${API_BASE_URL}/stock/page`,
  STOCK_CREATE: `${API_BASE_URL}/stock/create`,
  STOCK_UPDATE: `${API_BASE_URL}/stock/update`,
  STOCK_DELETE: `${API_BASE_URL}/stock/delete`,

  // 出库相关
  OUTBOUND_PAGE: `${API_BASE_URL}/stock/outbound/page`,
  OUTBOUND_CREATE: `${API_BASE_URL}/stock/outbound/create`,
  OUTBOUND_UPDATE: `${API_BASE_URL}/stock/outbound/update`,
  OUTBOUND_DELETE: `${API_BASE_URL}/stock/outbound/delete`,
} as const;
