/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockItem, OutboundItem } from '../types';
import { mockStockData, mockOutboundData } from './mockData';

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
    const response = await fetch('/api/stock');
    return response.json();
  },

  async add(isMock: boolean, item: Omit<StockItem, 'id'>): Promise<StockItem> {
    if (isMock) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      currentStockData = [newItem, ...currentStockData];
      return newItem;
    }
    const response = await fetch('/api/stock', {
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
    const response = await fetch(`/api/stock/${id}`, {
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
    await fetch(`/api/stock/${id}`, { method: 'DELETE' });
  },
};

export const outboundService = {
  async getList(isMock: boolean): Promise<OutboundItem[]> {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...currentOutboundData]), 300);
      });
    }
    const response = await fetch('/api/outbound');
    return response.json();
  },

  async add(isMock: boolean, item: Omit<OutboundItem, 'id'>): Promise<OutboundItem> {
    if (isMock) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      currentOutboundData = [newItem, ...currentOutboundData];
      return newItem;
    }
    const response = await fetch('/api/outbound', {
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
    const response = await fetch(`/api/outbound/${id}`, {
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
    await fetch(`/api/outbound/${id}`, { method: 'DELETE' });
  },
};
