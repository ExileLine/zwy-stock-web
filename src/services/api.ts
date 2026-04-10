/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockItem, OutboundItem } from '../types';
import { API_ENDPOINTS } from '../config';

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
  // 从 localStorage 获取 token
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 添加 token header (后端期望的字段名是 "token")
  if (token) {
    headers['token'] = token;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const result: ApiResponse<T> = await response.json();

  if (result.code >= 300) {
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
  async getList(query?: StockPageQuery): Promise<{ records: StockItem[]; total: number }> {
    const params = { page: 1, size: 20, ...query };
    const result = await request<PageResult>(API_ENDPOINTS.STOCK_PAGE, 'POST', params);
    return {
      records: (result.records || []) as StockItem[],
      total: result.total || 0,
    };
  },

  async add(item: Omit<StockItem, 'id'>): Promise<StockItem> {
    const result = await request<any>(API_ENDPOINTS.STOCK_CREATE, 'POST', item);
    return result as StockItem;
  },

  async update(id: string, item: Partial<StockItem>): Promise<StockItem> {
    const apiData = { ...item, id: parseInt(id) };
    const result = await request<any>(API_ENDPOINTS.STOCK_UPDATE, 'POST', apiData);
    return result as StockItem;
  },

  async delete(id: string): Promise<void> {
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
  supplier?: string;          // 供应商
  warranty_period?: string;   // 维保期
}

// 大类统计项类型
export interface MajorCategoryStatItem {
  major_category: string;
  record_count: number;
  total_inbound_qty: number;
}

// 大类统计查询参数
export interface MajorCategoryStatQuery {
  page?: number;
  size?: number;
  model_config?: string;
}

export const outboundService = {
  async getList(query?: OutboundPageQuery): Promise<{ records: OutboundItem[]; total: number }> {
    const params = { page: 1, size: 20, ...query };
    const result = await request<PageResult>(API_ENDPOINTS.OUTBOUND_PAGE, 'POST', params);
    return {
      records: (result.records || []) as OutboundItem[],
      total: result.total || 0,
    };
  },

  // 基于入库记录创建出库
  async add(params: OutboundCreateParams): Promise<OutboundItem> {
    const result = await request<any>(API_ENDPOINTS.OUTBOUND_CREATE, 'POST', params);
    return result as OutboundItem;
  },
};

// 大类统计服务
export const majorCategoryService = {
  // 获取大类统计列表
  async getStatList(query?: MajorCategoryStatQuery): Promise<{ records: MajorCategoryStatItem[]; total: number }> {
    const params = { page: 1, size: 20, ...query };
    const result = await request<PageResult>(API_ENDPOINTS.MAJOR_CATEGORY_PAGE, 'POST', params);
    return {
      records: (result.records || []) as MajorCategoryStatItem[],
      total: result.total || 0,
    };
  },

  // 获取指定大类的库存明细
  async getCategoryList(params: { major_category: string; page?: number; size?: number; keyword?: string }): Promise<{ records: StockItem[]; total: number }> {
    const result = await request<PageResult>(API_ENDPOINTS.MAJOR_CATEGORY_LIST_PAGE, 'POST', params);
    return {
      records: (result.records || []) as StockItem[],
      total: result.total || 0,
    };
  },
};
