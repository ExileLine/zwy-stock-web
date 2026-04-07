/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockItem, OutboundItem } from '../types';
import { mockStockData, mockOutboundData } from './mockData';
import { API_ENDPOINTS } from '../config';

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

// 库存记录分页查询参数类型
// Swagger Schema: StockInboundPageQuery
export interface StockPageQuery {
  page?: number;                      // 页码（默认1，最小值1）
  size?: number;                      // 每页数量（默认20，最小值1，最大值200）
  keyword?: string;                   // 全局关键字
  major_category?: string;            // 大类
  product_type?: string;              // 产品类型
  product_name?: string;              // 产品名称
  product_brand?: string;             // 产品品牌
  product_spec?: string;              // 产品规格
  pn_code?: string;                   // PN码
  material_code?: string;             // 物料编码
  serial_number?: string;             // 序列号
  applicable_device_type?: string;    // 适用设备类型
  applicable_device_model?: string;   // 适用设备型号
  purchase_order_no?: string;         // 采购单号
  inbound_room?: string;              // 入库机房
  storage_location?: string;          // 存放位置
}

// 出库记录分页查询参数类型
// Swagger Schema: StockOutboundPageQuery
export interface OutboundPageQuery {
  page?: number;                      // 页码（默认1，最小值1）
  size?: number;                      // 每页数量（默认20，最小值1，最大值200）
  keyword?: string;                   // 全局关键字
  product_serial_number?: string;     // 产品序列号
  product_name?: string;              // 产品名称
  product_brand?: string;             // 产品品牌
  product_spec?: string;              // 产品规格
  pn_code?: string;                   // PN码
  material_code?: string;             // 物料编码
  usage_purpose?: string;             // 用途
  target_device_serial_number?: string;  // 用于设备序列号
  target_room?: string;               // 用于机房
  target_device_location?: string;    // 用于设备位置
  owner_org?: string;                 // 设备归属用户单位
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
              item.product_name?.includes(query.keyword!) ||
              item.product_brand?.includes(query.keyword!) ||
              item.material_code?.includes(query.keyword!)
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
      records: (result.records || []) as StockItem[],
      total: result.total || 0,
    };
  },

  async add(isMock: boolean, item: Omit<StockItem, 'id'>): Promise<StockItem> {
    if (isMock) {
      const newItem = { ...item, id: Math.floor(Math.random() * 1000000) };
      currentStockData = [newItem as StockItem, ...currentStockData];
      return newItem as StockItem;
    }

    const result = await request<any>(API_ENDPOINTS.STOCK_CREATE, 'POST', item);
    return result as StockItem;
  },

  async update(isMock: boolean, id: string, item: Partial<StockItem>): Promise<StockItem> {
    if (isMock) {
      const index = currentStockData.findIndex((i) => i.id.toString() === id);
      if (index !== -1) {
        currentStockData[index] = { ...currentStockData[index], ...item };
        return currentStockData[index];
      }
      throw new Error('Item not found');
    }

    const apiData = { ...item, id: parseInt(id) };
    const result = await request<any>(API_ENDPOINTS.STOCK_UPDATE, 'POST', apiData);
    return result as StockItem;
  },

  async delete(isMock: boolean, id: string): Promise<void> {
    if (isMock) {
      currentStockData = currentStockData.filter((i) => i.id.toString() !== id);
      return;
    }

    await request<void>(API_ENDPOINTS.STOCK_DELETE, 'POST', { id: parseInt(id) });
  },
};

// 出库创建参数类型（基于入库记录）
// Swagger Schema: StockOutboundCreateFromInbound
export interface OutboundCreateParams {
  inbound_record_id: number;  // 入库记录ID（必填）
  outbound_qty: number;       // 领用数量（必填，最小值1）
  outbound_date?: string;     // 领用日期（格式：date）
  usage_purpose?: string;     // 用途
  target_device_serial_number?: string;  // 用于设备序列号
  target_room?: string;       // 用于机房
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
              item.product_name?.includes(query.keyword!) ||
              item.material_code?.includes(query.keyword!) ||
              item.usage_purpose?.includes(query.keyword!)
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
      records: (result.records || []) as OutboundItem[],
      total: result.total || 0,
    };
  },

  // 基于入库记录创建出库
  async add(isMock: boolean, params: OutboundCreateParams): Promise<OutboundItem> {
    if (isMock) {
      // Mock 模式：从入库数据中查找对应的记录
      const stockItem = currentStockData.find((item) => item.id === params.inbound_record_id);
      if (!stockItem) {
        throw new Error('入库记录不存在');
      }
      const newItem: OutboundItem = {
        id: Math.floor(Math.random() * 1000000),
        outbound_date: params.outbound_date || new Date().toISOString().split('T')[0],
        product_serial_number: stockItem.serial_number || '',
        product_name: stockItem.product_name,
        product_brand: stockItem.product_brand || '',
        product_spec: stockItem.product_spec || '',
        pn_code: stockItem.pn_code || '',
        material_code: stockItem.material_code || '',
        outbound_qty: params.outbound_qty,
        usage_purpose: params.usage_purpose || '',
        target_room: params.target_room || '',
        owner_org: params.owner_org || '',
        target_device_serial_number: params.target_device_serial_number,
        target_device_location: params.target_device_location,
        remark: params.remark,
      };
      currentOutboundData = [newItem as OutboundItem, ...currentOutboundData];
      return newItem as OutboundItem;
    }

    const result = await request<any>(API_ENDPOINTS.OUTBOUND_CREATE, 'POST', params);
    return result as OutboundItem;
  },

  // 出库更新接口（swagger 中未定义，保留原逻辑用于 mock 模式）
  async update(isMock: boolean, id: string, item: Partial<OutboundItem>): Promise<OutboundItem> {
    if (isMock) {
      const index = currentOutboundData.findIndex((i) => i.id.toString() === id);
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
      currentOutboundData = currentOutboundData.filter((i) => i.id.toString() !== id);
      return;
    }

    // 如果后端实现了删除接口，可以在这里调用
    throw new Error('出库记录删除接口暂未实现');
  },
};
