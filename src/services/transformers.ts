/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 注意：前端已统一使用下划线命名，与后端 API 保持一致
// 因此不再需要驼峰/下划线转换逻辑

// 直接返回原始数据（保留用于兼容性）
export function stockToApi(data: Record<string, any>): Record<string, any> {
  return data;
}

// 直接返回原始数据（保留用于兼容性）
export function stockFromApi(data: Record<string, any>): Record<string, any> {
  return data;
}

// 直接返回原始数据（保留用于兼容性）
export function outboundToApi(data: Record<string, any>): Record<string, any> {
  return data;
}

// 直接返回原始数据（保留用于兼容性）
export function outboundFromApi(data: Record<string, any>): Record<string, any> {
  return data;
}

// 数组直接返回（保留用于兼容性）
export function arraySnakeToCamel<T extends Record<string, any>>(arr: T[]): T[] {
  return arr;
}
