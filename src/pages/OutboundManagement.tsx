/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Form,
  Input,
  Button,
  Space,
  Modal,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Descriptions,
} from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { OutboundItem, StockItem } from '../types';
import { outboundService, OutboundPageQuery, stockService, OutboundCreateParams } from '../services/api';
import { useMock } from '../context/MockContext';

const useStyles = createStyles(({ css }) => ({
  searchForm: css`
    margin-bottom: 24px;
    padding: 24px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    .ant-form-item {
      margin-bottom: 16px;
    }
    .ant-form-item-label > label {
      font-size: 13px;
      color: #595959;
    }
  `,
  table: css`
    .ant-table-thead > tr > th {
      background: #fafafa !important;
      font-weight: 600;
      color: #262626;
      border-bottom: 1px solid #e8e8e8;
    }
    .ant-table-tbody > tr > td {
      padding: 12px 16px !important;
      color: #595959;
    }
  `,
  actionBtn: css`
    padding: 0;
    height: auto;
    font-size: 14px;
  `,
  deleteBtn: css`
    color: #ff4d4f !important;
  `,
  searchBtn: css`
    border-radius: 4px;
  `,
  resetBtn: css`
    border-radius: 4px;
  `,
  addBtn: css`
    border-radius: 4px;
  `,
  productInfo: css`
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 16px;
  `,
}));

const OutboundManagement: React.FC = () => {
  const { styles } = useStyles();
  const { isMock } = useMock();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OutboundItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();

      const query: OutboundPageQuery = {
        page,
        size,
        keyword: values.keyword,
        product_serial_number: values.product_serial_number,
        product_name: values.product_name,
        product_brand: values.product_brand,
        product_spec: values.product_spec,
        pn_code: values.pn_code,
        material_code: values.material_code,
        usage_purpose: values.usage_purpose,
        target_device_serial_number: values.target_device_serial_number,
        target_room: values.target_room,
        target_device_location: values.target_device_location,
        owner_org: values.owner_org,
      };

      Object.keys(query).forEach((key) => {
        if (query[key as keyof OutboundPageQuery] === undefined || query[key as keyof OutboundPageQuery] === '') {
          delete query[key as keyof OutboundPageQuery];
        }
      });

      const result = await outboundService.getList(isMock, query);
      setData(result.records);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: result.total,
      }));
    } catch (error) {
      message.error('获取数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isMock, form]);

  // 加载库存列表用于选择
  const fetchStockList = useCallback(async () => {
    try {
      const result = await stockService.getList(isMock, { page: 1, size: 200 });
      setStockList(result.records);
    } catch (error) {
      console.error('获取库存列表失败:', error);
    }
  }, [isMock]);

  useEffect(() => {
    fetchData();
    fetchStockList();
  }, [fetchData, fetchStockList]);

  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    fetchData(1, pagination.pageSize);
  };

  const handleTableChange = (paginationInfo: any) => {
    fetchData(paginationInfo.current, paginationInfo.pageSize);
  };

  const handleAdd = () => {
    setSelectedStock(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({
      outbound_date: dayjs(),
      outbound_qty: 1,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await outboundService.delete(isMock, id.toString());
      message.success('删除成功');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();

      if (!values.inbound_record_id) {
        message.error('请选择入库记录');
        return;
      }

      const params: OutboundCreateParams = {
        inbound_record_id: parseInt(values.inbound_record_id),
        outbound_qty: values.outbound_qty,
        outbound_date: values.outbound_date?.format('YYYY-MM-DD'),
        usage_purpose: values.usage_purpose,
        target_device_serial_number: values.target_device_serial_number,
        target_room: values.target_room,
        target_device_location: values.target_device_location,
        owner_org: values.owner_org,
        remark: values.remark,
      };

      await outboundService.add(isMock, params);
      message.success('出库成功');
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
      fetchStockList(); // 刷新库存列表
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleStockSelect = (stockId: number) => {
    const stock = stockList.find((s) => s.id === stockId);
    setSelectedStock(stock || null);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '领用日期',
      dataIndex: 'outbound_date',
      key: 'outbound_date',
      width: 120,
    },
    {
      title: '产品序列号',
      dataIndex: 'product_serial_number',
      key: 'product_serial_number',
      width: 150,
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
      render: (text: string) => <span style={{ fontWeight: 500, color: '#262626' }}>{text}</span>
    },
    { title: '品牌', dataIndex: 'product_brand', key: 'product_brand', width: 100 },
    { title: '规格', dataIndex: 'product_spec', key: 'product_spec', width: 180 },
    {
      title: '物料编码',
      dataIndex: 'material_code',
      key: 'material_code',
      width: 140,
    },
    {
      title: '领用数量',
      dataIndex: 'outbound_qty',
      key: 'outbound_qty',
      width: 100,
      render: (text: number) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{text}</span>
    },
    { title: '用途', dataIndex: 'usage_purpose', key: 'usage_purpose', width: 150 },
    { title: '用于机房', dataIndex: 'target_room', key: 'target_room', width: 150 },
    { title: '归属单位', dataIndex: 'owner_org', key: 'owner_org', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: OutboundItem) => (
        <Space size="middle">
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" className={`${styles.actionBtn} ${styles.deleteBtn}`}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Form form={form} className={styles.searchForm} layout="vertical">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="keyword" label="关键字">
              <Input placeholder="名称 / 编码 / 用途 / 机房" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="product_name" label="产品名称">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="product_serial_number" label="产品序列号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="material_code" label="物料编码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="target_room" label="用于机房">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="owner_org" label="归属单位">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} className={styles.searchBtn}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset} className={styles.resetBtn}>
                重置
              </Button>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className={styles.addBtn}
            >
              新增出库
            </Button>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          position: ['bottomRight'],
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="新增出库"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={1000}
        okText="保存"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="inbound_record_id"
                label="选择入库记录"
                rules={[{ required: true, message: '请选择入库记录' }]}
              >
                <Select
                  placeholder="请选择入库记录"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleStockSelect}
                  options={stockList.map((stock) => ({
                    value: stock.id,
                    label: `${stock.product_name} - ${stock.material_code} - ${stock.serial_number} (库存: ${stock.inbound_qty}${stock.unit})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedStock && (
            <div className={styles.productInfo}>
              <Descriptions title="产品信息" column={3} size="small" bordered>
                <Descriptions.Item label="产品名称">{selectedStock.product_name}</Descriptions.Item>
                <Descriptions.Item label="品牌">{selectedStock.product_brand}</Descriptions.Item>
                <Descriptions.Item label="规格">{selectedStock.product_spec}</Descriptions.Item>
                <Descriptions.Item label="物料编码">{selectedStock.material_code}</Descriptions.Item>
                <Descriptions.Item label="序列号">{selectedStock.serial_number}</Descriptions.Item>
                <Descriptions.Item label="库存数量">{selectedStock.inbound_qty} {selectedStock.unit}</Descriptions.Item>
                <Descriptions.Item label="入库机房" span={3}>{selectedStock.inbound_room}</Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="outbound_date" label="领用日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="outbound_qty"
                label="领用数量"
                rules={[
                  { required: true, message: '请输入领用数量' },
                  {
                    validator: (_, value) => {
                      if (selectedStock && value > (selectedStock.inbound_qty || 0)) {
                        return Promise.reject(new Error('领用数量不能超过库存数量'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="usage_purpose" label="用途">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="target_device_serial_number" label="用于设备序列号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="target_room" label="用于机房">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="target_device_location" label="用于设备位置">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="owner_org" label="归属用户单位">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OutboundManagement;

export type AddOutboundProps = {
  editingId?: number;
  isMock?: boolean;
  content?: any;
  stockId?: string;  // 新增：直接指定入库记录ID
}

export const AddOutbound = (props: AddOutboundProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const isMock = props.isMock || false;
  const [modalForm] = Form.useForm();
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  // 加载库存列表用于选择
  const fetchStockList = useCallback(async () => {
    try {
      const result = await stockService.getList(isMock, { page: 1, size: 200 });
      setStockList(result.records);

      // 如果指定了 stockId，预选该记录
      if (props.stockId) {
        const stock = result.records.find((s) => s.id.toString() === props.stockId);
        if (stock) {
          setSelectedStock(stock);
          modalForm.setFieldsValue({ inbound_record_id: stock.id });
        }
      }
    } catch (error) {
      console.error('获取库存列表失败:', error);
    }
  }, [isMock, props.stockId]);

  useEffect(() => {
    if (modalVisible) {
      fetchStockList();
      modalForm.setFieldsValue({
        outbound_date: dayjs(),
        outbound_qty: 1,
      });
    }
  }, [modalVisible, fetchStockList]);

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();

      if (!values.inbound_record_id) {
        message.error('请选择入库记录');
        return;
      }

      const params: OutboundCreateParams = {
        inbound_record_id: parseInt(values.inbound_record_id),
        outbound_qty: values.outbound_qty,
        outbound_date: values.outbound_date?.format('YYYY-MM-DD'),
        usage_purpose: values.usage_purpose,
        target_device_serial_number: values.target_device_serial_number,
        target_room: values.target_room,
        target_device_location: values.target_device_location,
        owner_org: values.owner_org,
        remark: values.remark,
      };

      await outboundService.add(isMock, params);
      message.success('出库成功');
      setModalVisible(false);
      // 刷新页面数据（通过事件或回调）
      window.location.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleStockSelect = (stockId: number) => {
    const stock = stockList.find((s) => s.id === stockId);
    setSelectedStock(stock || null);
  };

  return (
    <>
      <div onClick={() => setModalVisible(true)}>
        {props.content}
      </div>
      <Modal
        title="新增出库"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={1000}
        okText="保存"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="inbound_record_id"
                label="选择入库记录"
                rules={[{ required: true, message: '请选择入库记录' }]}
              >
                <Select
                  placeholder="请选择入库记录"
                  showSearch
                  disabled={!!props.stockId}  // 如果指定了 stockId，禁用选择
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleStockSelect}
                  options={stockList.map((stock) => ({
                    value: stock.id,
                    label: `${stock.product_name} - ${stock.material_code} - ${stock.serial_number} (库存: ${stock.inbound_qty}${stock.unit})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedStock && (
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
              <Descriptions title="产品信息" column={3} size="small" bordered>
                <Descriptions.Item label="产品名称">{selectedStock.product_name}</Descriptions.Item>
                <Descriptions.Item label="品牌">{selectedStock.product_brand}</Descriptions.Item>
                <Descriptions.Item label="规格">{selectedStock.product_spec}</Descriptions.Item>
                <Descriptions.Item label="物料编码">{selectedStock.material_code}</Descriptions.Item>
                <Descriptions.Item label="序列号">{selectedStock.serial_number}</Descriptions.Item>
                <Descriptions.Item label="库存数量">{selectedStock.inbound_qty} {selectedStock.unit}</Descriptions.Item>
                <Descriptions.Item label="入库机房" span={3}>{selectedStock.inbound_room}</Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="outbound_date" label="领用日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="outbound_qty"
                label="领用数量"
                rules={[
                  { required: true, message: '请输入领用数量' },
                  {
                    validator: (_, value) => {
                      if (selectedStock && value > (selectedStock.inbound_qty || 0)) {
                        return Promise.reject(new Error('领用数量不能超过库存数量'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="usage_purpose" label="用途">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="target_device_serial_number" label="用于设备序列号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="target_room" label="用于机房">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="target_device_location" label="用于设备位置">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="owner_org" label="归属用户单位">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
