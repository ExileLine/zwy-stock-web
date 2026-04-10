/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Space,
  Tag,
} from 'antd';
import {
  ProTable,
  ProColumns,
  ActionType,
} from '@ant-design/pro-components';
import {
  ShopOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { StockItem } from '../types';
import { majorCategoryService, MajorCategoryStatItem } from '../services/api';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: 0;
  `,
  statsCard: css`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .ant-statistic-title {
      font-size: 13px;
      color: #8c8c8c;
      font-weight: 500;
    }
    .ant-statistic-content {
      font-size: 28px;
      font-weight: 600;
    }
  `,
  tableCard: css`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    .ant-pro-card-header {
      border-bottom: 1px solid #f0f0f0;
    }
  `,
  categoryTag: css`
    font-size: 14px;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 500;
  `,
  modalCustom: css`
    .ant-modal-content {
      border-radius: 8px;
      overflow: hidden;
    }
    .ant-modal-header {
      border-bottom: 1px solid #f0f0f0;
      padding: 16px 24px;
    }
    .ant-modal-body {
      padding: 0;
    }
  `,
  gradientGreen: css`
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    .ant-statistic-title,
    .ant-statistic-content {
      color: #fff !important;
    }
  `,
  gradientBlue: css`
    background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    .ant-statistic-title,
    .ant-statistic-content {
      color: #fff !important;
    }
  `,
  gradientRed: css`
    background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
    .ant-statistic-title,
    .ant-statistic-content {
      color: #fff !important;
    }
  `,
  gradientPurple: css`
    background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
    .ant-statistic-title,
    .ant-statistic-content {
      color: #fff !important;
    }
  `,
}));

// 颜色映射函数
const getCategoryColor = (category: string) => {
  const colors = [
    'blue', 'green', 'purple', 'cyan', 'magenta',
    'pink', 'red', 'orange', 'yellow', 'lime',
    'geekblue', 'gold', 'volcano',
  ];
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const InventoryManagement: React.FC = () => {
  const { styles } = useStyles();
  const actionRef = useRef<ActionType>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MajorCategoryStatItem | null>(null);
  const detailActionRef = useRef<ActionType>(undefined);

  // 统计数据状态
  const [totalStats, setTotalStats] = useState({
    totalCategories: 0,
    totalRecords: 0,
    totalInbound: 0,
  });

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const result = await majorCategoryService.getStatList({ page: 1, size: 1000 });
      const stats = {
        totalCategories: result.records.length,
        totalRecords: result.records.reduce((sum, item) => sum + item.record_count, 0),
        totalInbound: result.records.reduce((sum, item) => sum + item.total_inbound_qty, 0),
      };
      setTotalStats(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 主表格列定义
  const columns: ProColumns<MajorCategoryStatItem>[] = [
    {
      title: '大类名称',
      dataIndex: 'major_category',
      key: 'major_category',
      width: 200,
      render: (text: any, _) => (
        <Tag color={getCategoryColor(text)} className={styles.categoryTag}>
          {text}
        </Tag>
      ),
    },
    {
      title: '记录数',
      dataIndex: 'record_count',
      key: 'record_count',
      width: 150,
      align: 'right',
      render: (text: any, _) => (
        <Space>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>{text}</span>
          <Tag color="blue">条</Tag>
        </Space>
      ),
    },
    {
      title: '入库总数',
      dataIndex: 'total_inbound_qty',
      key: 'total_inbound_qty',
      width: 180,
      align: 'right',
      render: (text: any, _) => (
        <Space>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>{text.toLocaleString()}</span>
          <Tag color="green">件</Tag>
        </Space>
      ),
    },
    {
      title: '平均入库量',
      key: 'avg_inbound',
      width: 150,
      align: 'right',
      render: (_, record) => {
        const avg = record.record_count > 0 ? (record.total_inbound_qty / record.record_count).toFixed(2) : '0.00';
        return (
          <span style={{ fontSize: 14, color: '#8c8c8c' }}>
            {avg} <span style={{ fontSize: 12 }}>件/条</span>
          </span>
        );
      },
    },
    {
      title: '占比',
      key: 'percentage',
      width: 150,
      render: (_, record) => {
        const percentage = totalStats.totalInbound > 0
          ? ((record.total_inbound_qty / totalStats.totalInbound) * 100).toFixed(1)
          : '0.0';
        return (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1890ff' }}>{percentage}%</span>
            </div>
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <a
          onClick={() => {
            setSelectedCategory(record);
            setModalVisible(true);
            // 重置详情表格
            detailActionRef.current?.reload();
          }}
          style={{ color: '#1890ff', fontWeight: 500 }}
        >
          查看明细
        </a>
      ),
    },
  ];

  // 详情表格列定义
  const detailColumns: ProColumns<StockItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      search: false,
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
      render: (text: any, _) => <span style={{ fontWeight: 500, color: '#262626' }}>{text}</span>,
      search: false,
    },
    { title: '品牌', dataIndex: 'product_brand', key: 'product_brand', width: 100, search: false, },
    { title: '规格', dataIndex: 'product_spec', key: 'product_spec', width: 180, search: false, },
    { title: '物料编码', dataIndex: 'material_code', key: 'material_code', width: 140, search: false, },
    { title: 'PN码', dataIndex: 'pn_code', key: 'pn_code', width: 140, search: false, },
    {
      title: '入库数量',
      dataIndex: 'inbound_qty',
      key: 'inbound_qty',
      width: 100,
      search: false,
      render: (text: any, _) => (
        <span style={{ color: '#52c41a', fontWeight: 600 }}>{text}</span>
      ),
    },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80, search: false, },
    { title: '入库机房', dataIndex: 'inbound_room', key: 'inbound_room', width: 120, search: false, },
    { title: '存放位置', dataIndex: 'storage_location', key: 'storage_location', width: 120, search: false, },
    { title: '关键词', dataIndex: 'keyword', key: 'keyword', width: 120, hideInTable: true, },
    {
      title: '入库日期',
      dataIndex: 'inbound_date',
      key: 'inbound_date',
      width: 120,
      search: false,
      render: (text: any, _) => text?.split(' ')[0],
    },
  ];

  return (
    <div className={styles.container}>
      {/* 统计卡片 */}
      {/* <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className={`${styles.statsCard} ${styles.gradientPurple}`}>
            <Statistic
              title="大类总数"
              value={totalStats.totalCategories}
              prefix={<ShopOutlined />}
              suffix="类"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statsCard} ${styles.gradientBlue}`}>
            <Statistic
              title="库存记录"
              value={totalStats.totalRecords}
              prefix={<InboxOutlined />}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statsCard} ${styles.gradientGreen}`}>
            <Statistic
              title="入库总量"
              value={totalStats.totalInbound}
              prefix={<ArrowDownOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className={`${styles.statsCard} ${styles.gradientRed}`}>
            <Statistic
              title="平均每类"
              value={totalStats.totalCategories > 0 ? (totalStats.totalInbound / totalStats.totalCategories).toFixed(0) : 0}
              prefix={<ArrowUpOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
      </Row> */}

      {/* 主表格 */}
      <Card className={styles.tableCard} bordered={false}>
        <ProTable<MajorCategoryStatItem>
          columns={columns}
          actionRef={actionRef}
          request={async (params) => {
            const result = await majorCategoryService.getStatList({
              page: params.current,
              size: params.pageSize,
            });
            return {
              data: result.records,
              success: true,
              total: result.total,
            };
          }}
          rowKey="major_category"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [10, 20, 50, 100],
          }}
          search={false}
          options={{
            density: true,
            fullScreen: true,
            reload: () => {
              fetchStats();
              actionRef.current?.reload();
            },
            setting: true,
          }}
          size="large"
          dateFormatter="string"
          headerTitle="大类库存统计"
        />
      </Card>

      {/* 明细弹窗 */}
      <Modal
        title={
          <Space>
            <Tag color={selectedCategory ? getCategoryColor(selectedCategory.major_category) : 'blue'} className={styles.categoryTag}>
              {selectedCategory?.major_category}
            </Tag>
            <span style={{ fontSize: 14, color: '#8c8c8c' }}>库存明细</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedCategory(null);
        }}
        footer={null}
        width={1400}
        className={styles.modalCustom}
        destroyOnClose
      >
        <ProTable<StockItem>
          columns={detailColumns}
          actionRef={detailActionRef}
          request={async (params) => {
            if (!selectedCategory) {
              return { data: [], success: true, total: 0 };
            }
            const result = await majorCategoryService.getCategoryList({
              major_category: selectedCategory.major_category,
              page: params.current,
              size: params.pageSize,
              keyword: params.keyword,
            });
            return {
              data: result.records,
              success: true,
              total: result.total,
            };
          }}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [10, 20, 50],
          }}
          search={{
            labelWidth: 'auto',
            span: 6,
          }}
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
          }}
          size="small"
          dateFormatter="string"
          toolBarRender={() => [
            <div key="summary" style={{ fontSize: 13, color: '#8c8c8c' }}>
              该大类共 <span style={{ color: '#1890ff', fontWeight: 600 }}>{selectedCategory?.record_count}</span> 条记录，
              入库总量 <span style={{ color: '#52c41a', fontWeight: 600 }}>{selectedCategory?.total_inbound_qty?.toLocaleString()}</span> 件
            </div>,
          ]}
        />
      </Modal>
    </div>
  );
};

export default InventoryManagement;
