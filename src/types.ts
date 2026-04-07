/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 库存入库记录类型（使用下划线命名，与后端 API 一致）
export interface StockItem {
  id: number;
  inbound_date?: string;
  major_category?: string;
  product_type?: string;
  product_name: string;
  product_brand?: string;
  product_spec?: string;
  pn_code?: string;
  material_code?: string;
  serial_number?: string;
  applicable_device_type?: string;
  applicable_device_model?: string;
  purchase_order_no?: string;
  inbound_qty?: number;
  unit?: string;
  inbound_room?: string;
  storage_location?: string;
  product_description?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
  creator?: string;
  creator_id?: number;
  modifier?: string;
  modifier_id?: number;
}

// 库存出库记录类型（使用下划线命名，与后端 API 一致）
export interface OutboundItem {
  id: number;
  inbound_record_id?: number;
  outbound_date?: string;
  product_serial_number?: string;
  product_name: string;
  product_brand?: string;
  product_spec?: string;
  pn_code?: string;
  material_code?: string;
  outbound_qty?: number;
  usage_purpose?: string;
  target_device_serial_number?: string;
  target_room?: string;
  target_device_location?: string;
  owner_org?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
  creator?: string;
  creator_id?: number;
  modifier?: string;
  modifier_id?: number;
}
