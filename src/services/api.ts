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

export const stockService = {
  async getList(isMock: boolean): Promise<StockItem[]> {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...currentStockData]), 300);
      });
    }
    // Real API call would go here
    const response = await fetch(API_ENDPOINTS.STOCK);
    return response.json();
  },

  async add(isMock: boolean, item: Omit<StockItem, 'id'>): Promise<StockItem> {
    if (isMock) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      currentStockData = [newItem, ...currentStockData];
      return newItem;
    }
    const response = await fetch(API_ENDPOINTS.STOCK, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.json();
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
    const response = await fetch(`${API_ENDPOINTS.STOCK}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return response.json();
  },

  async delete(isMock: boolean, id: string): Promise<void> {
    if (isMock) {
      currentStockData = currentStockData.filter((i) => i.id !== id);
      return;
    }
    await fetch(`${API_ENDPOINTS.STOCK}/${id}`, { method: 'DELETE' });
  },
};

export const outboundService = {
  async getList(isMock: boolean): Promise<OutboundItem[]> {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...currentOutboundData]), 300);
      });
    }
    const response = await fetch(API_ENDPOINTS.OUTBOUND);
    return response.json();
  },

  async add(isMock: boolean, item: Omit<OutboundItem, 'id'>): Promise<OutboundItem> {
    if (isMock) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      currentOutboundData = [newItem, ...currentOutboundData];
      return newItem;
    }
    const response = await fetch(API_ENDPOINTS.OUTBOUND, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return response.json();
  },

  async update(isMock: boolean, id: string, item: Partial<OutboundItem>): Promise<OutboundItem> {
    if (isMock) {
      const index = currentOutboundData.findIndex((i) => i.id === id);
      if (index !== -1) {
        currentOutboundData[index] = { ...currentOutboundData[index], ...item };
        return currentOutboundData[index];
      }
      throw new Error('Item not found');
    }
    const response = await fetch(`${API_ENDPOINTS.OUTBOUND}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return response.json();
  },

  async delete(isMock: boolean, id: string): Promise<void> {
    if (isMock) {
      currentOutboundData = currentOutboundData.filter((i) => i.id !== id);
      return;
    }
    await fetch(`${API_ENDPOINTS.OUTBOUND}/${id}`, { method: 'DELETE' });
  },
};
