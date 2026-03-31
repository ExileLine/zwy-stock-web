/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockItem {
  id: string;
  date: string;
  category: string;
  productType: string;
  productName: string;
  brand: string;
  spec: string;
  materialCode: string;
  serialNumber: string;
  quantity: number;
  unit: string;
  warehouse: string;
  pnCode?: string;
  location?: string;
  description?: string;
  remark?: string;
  appliedDeviceType?: string;
  appliedDeviceModel?: string;
  purchaseOrder?: string;
}

export interface OutboundItem {
  id: string;
  date: string;
  serialNumber: string;
  productName: string;
  brand: string;
  spec: string;
  materialCode: string;
  quantity: number;
  purpose: string;
  warehouse: string;
  department: string;
  pnCode?: string;
  appliedDeviceSerial?: string;
  location?: string;
  remark?: string;
}
