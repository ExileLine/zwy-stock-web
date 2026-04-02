/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// API 基础地址
export const API_BASE_URL = 'http://localhost:123/api';

// 接口地址配置
export const API_ENDPOINTS = {
  // 库存相关
  STOCK: `${API_BASE_URL}/stock`,

  // 出库相关
  OUTBOUND: `${API_BASE_URL}/outbound`,
} as const;
