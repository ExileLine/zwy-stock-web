/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockItem, OutboundItem } from '../types';
import { mockStockData, mockOutboundData } from './mockData';
import { API_ENDPOINTS } from '../config';
import { stockToApi, stockFromApi, outboundToApi, outboundFromApi, arraySnakeToCamel } from './transformers';

// In-memory mock storage
let currentStockData = [...mockStockData];
let currentOutboundData = [...mockOutboundData];

// API 响应类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 分页响应类型
interface PageResult<T = any> {
  records: T[];
  now_page: number;
  total: number;
}

// 通用请求函数
async function request<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const result: ApiResponse<T> = await response.json();

  if (result.code !== 200 && result.code !== 201) {
    throw new Error(result.message || '请求失败');
  }

  return result.data as T;
}

// 分页查询参数类型
export interface StockPageQuery {
  page?: number;
  size?: number;
  keyword?: string;
  major_category?: string;
  product_type?: string;
  product_name?: string;
  product_brand?: string;
  product_spec?: string;
  pn_code?: string;
  material_code?: string;
  serial_number?: string;
  applicable_device_type?: string;
  applicable_device_model?: string;
  purchase_order_no?: string;
  inbound_room?: string;
  storage_location?: string;
}

export interface OutboundPageQuery {
  page?: number;
  size?: number;
  keyword?: string;
  product_serial_number?: string;
  product_name?: string;
  product_brand?: string;
  product_spec?: string;
  pn_code?: string;
  material_code?: string;
  usage_purpose?: string;
  target_device_serial_number?: string;
  target_room?: string;
  target_device_location?: string;
  owner_org?: string;
}

export const stockService = {
  async getList(isMock: boolean, query?: StockPageQuery): Promise<{ records: StockItem[]; total: number }> {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredData = [...currentStockData];
          // Mock 简单过滤
          if (query?.keyword) {
            filteredData = filteredData.filter((item) =>
              item.productName.includes(query.keyword!) ||
              item.brand.includes(query.keyword!) ||
              item.materialCode.includes(query.keyword!)
            );
          }
          resolve({
            records: filteredData.slice(0, query?.size || 10),
            total: filteredData.length,
          });
        }, 300);
      });
    }

    const params = { page: 1, size: 20, ...query };
    const result = await request<PageResult>(API_ENDPOINTS.STOCK_PAGE, 'POST', params);
    return {
      records: arraySnakeToCamel(result.records || []) as StockItem[],
      total: result.total || 0,
    };
  },

  async add(isMock: boolean, item: Omit<StockItem, 'id'>): Promise<StockItem> {
    if (isMock) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      currentStockData = [newItem, ...currentStockData];
      return newItem;
    }

    const apiData = stockToApi(item);
    const result = await request<any>(API_ENDPOINTS.STOCK_CREATE, 'POST', apiData);
    return stockFromApi(result) as StockItem;
  },

  async update(isMock: boolean, id: string, item: Partial<StockItem>): Promise<StockItem> {
    if (isMock) {
      const index = currentStockData.findIndex((i) => i.id === id);
      if (index !== -1) {
        currentStockData[index] = { ...currentStockData[index], ...item };
        return currentStockData[index];
      }
      throw new Error('Item not found');
    }

    const apiData = { ...stockToApi(item), id };
    const result = await request<any>(API_ENDPOINTS.STOCK_UPDATE, 'POST', apiData);
    return stockFromApi(result) as StockItem;
  },

  async delete(isMock: boolean, id: string): Promise<void> {
    if (isMock) {
      currentStockData = currentStockData.filter((i) => i.id !== id);
      return;
    }

    await request<void>(API_ENDPOINTS.STOCK_DELETE, 'POST', { id });
  },
};

// 出库创建参数类型（基于入库记录）
export interface OutboundCreateParams {
  inbound_record_id: number;  // 入库记录ID（必填）
  outbound_qty: number;       // 领用数量（必填）
  outbound_date?: string;     // 领用日期
  usage_purpose?: string;     // 用途
  target_device_serial_number?: string;  // 用于设备序列号
  target_room?: string;        // 用于机房
  target_device_location?: string;  // 用于设备位置
  owner_org?: string;         // 设备归属用户单位
  remark?: string;            // 备注
}

export const outboundService = {
  async getList(isMock: boolean, query?: OutboundPageQuery): Promise<{ records: OutboundItem[]; total: number }> {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredData = [...currentOutboundData];
          // Mock 简单过滤
          if (query?.keyword) {
            filteredData = filteredData.filter((item) =>
              item.productName.includes(query.keyword!) ||
              item.materialCode.includes(query.keyword!) ||
              item.purpose.includes(query.keyword!)
            );
          }
          resolve({
            records: filteredData.slice(0, query?.size || 10),
            total: filteredData.length,
          });
        }, 300);
      });
    }

    const params = { page: 1, size: 20, ...query };
    const result = await request<PageResult>(API_ENDPOINTS.OUTBOUND_PAGE, 'POST', params);
    return {
      records: arraySnakeToCamel(result.records || []) as OutboundItem[],
      total: result.total || 0,
    };
  },

  // 基于入库记录创建出库
  async add(isMock: boolean, params: OutboundCreateParams): Promise<OutboundItem> {
    if (isMock) {
      // Mock 模式：从入库数据中查找对应的记录
      const stockItem = currentStockData.find((item) => item.id === params.inbound_record_id.toString());
      if (!stockItem) {
        throw new Error('入库记录不存在');
      }
      const newItem: OutboundItem = {
        id: Math.random().toString(36).substr(2, 9),
        date: params.outbound_date || new Date().toISOString().split('T')[0],
        serialNumber: stockItem.serialNumber,
        productName: stockItem.productName,
        brand: stockItem.brand,
        spec: stockItem.spec,
        materialCode: stockItem.materialCode,
        quantity: params.outbound_qty,
        purpose: params.usage_purpose || '',
        warehouse: params.target_room || '',
        department: params.owner_org || '',
        pnCode: stockItem.pnCode,
        appliedDeviceSerial: params.target_device_serial_number,
        location: params.target_device_location,
        remark: params.remark,
      };
      currentOutboundData = [newItem, ...currentOutboundData];
      return newItem;
    }

    const result = await request<any>(API_ENDPOINTS.OUTBOUND_CREATE, 'POST', params);
    return outboundFromApi(result) as OutboundItem;
  },

  // 出库更新接口（swagger 中未定义，保留原逻辑用于 mock 模式）
  async update(isMock: boolean, id: string, item: Partial<OutboundItem>): Promise<OutboundItem> {
    if (isMock) {
      const index = currentOutboundData.findIndex((i) => i.id === id);
      if (index !== -1) {
        currentOutboundData[index] = { ...currentOutboundData[index], ...item };
        return currentOutboundData[index];
      }
      throw new Error('Item not found');
    }

    // 如果后端实现了更新接口，可以在这里调用
    throw new Error('出库记录更新接口暂未实现');
  },

  // 出库删除接口（swagger 中未定义，保留原逻辑用于 mock 模式）
  async delete(isMock: boolean, id: string): Promise<void> {
    if (isMock) {
      currentOutboundData = currentOutboundData.filter((i) => i.id !== id);
      return;
    }

    // 如果后端实现了删除接口，可以在这里调用
    throw new Error('出库记录删除接口暂未实现');
  },
};
