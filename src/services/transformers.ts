/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 驼峰转下划线
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// 下划线转驼峰
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 对象键名转换：驼峰 -> 下划线
export function objectCamelToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = obj[key];
    }
  }
  return result;
}

// 对象键名转换：下划线 -> 驼峰
export function objectSnakeToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = obj[key];
    }
  }
  return result;
}

// 数组对象键名转换：下划线 -> 驼峰
export function arraySnakeToCamel<T extends Record<string, any>>(arr: T[]): Record<string, any>[] {
  return arr.map((item) => objectSnakeToCamel(item));
}

// 库存字段映射：前端 -> 后端
export function stockToApi(data: Record<string, any>): Record<string, any> {
  const result = objectCamelToSnake(data);
  return result;
}

// 库存字段映射：后端 -> 前端
export function stockFromApi(data: Record<string, any>): Record<string, any> {
  return objectSnakeToCamel(data);
}

// 出库字段映射：前端 -> 后端
export function outboundToApi(data: Record<string, any>): Record<string, any> {
  const result = objectCamelToSnake(data);
  return result;
}

// 出库字段映射：后端 -> 前端
export function outboundFromApi(data: Record<string, any>): Record<string, any> {
  return objectSnakeToCamel(data);
}
