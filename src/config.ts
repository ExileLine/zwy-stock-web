/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// API 基础地址
export const API_BASE_URL = 'http://localhost:123/api/v1';

// 接口地址配置
export const API_ENDPOINTS = {
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
