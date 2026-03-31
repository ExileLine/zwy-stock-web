/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Input,
  Button,
  Space,
  Modal,
  DatePicker,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { StockItem } from '../types';
import { stockService } from '../services/api';
import { useMock } from '../context/MockContext';

const useStyles = createStyles(({ token, css }) => ({
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
}));

const StockManagement: React.FC = () => {
  const { styles } = useStyles();
  const { isMock } = useMock();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StockItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await stockService.getList(isMock);
      setData(result);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isMock]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    if (isMock) {
      fetchData().then(() => {
        setData((prev) =>
          prev.filter((item) => {
            return (
              (!values.keyword ||
                item.productName.includes(values.keyword) ||
                item.brand.includes(values.keyword) ||
                item.materialCode.includes(values.keyword)) &&
              (!values.category || item.category.includes(values.category)) &&
              (!values.productName || item.productName.includes(values.productName)) &&
              (!values.materialCode || item.materialCode.includes(values.materialCode)) &&
              (!values.serialNumber || item.serialNumber.includes(values.serialNumber)) &&
              (!values.warehouse || item.warehouse.includes(values.warehouse))
            );
          })
        );
      });
    } else {
      fetchData();
    }
  };

  const handleReset = () => {
    form.resetFields();
    fetchData();
  };

  const handleAdd = () => {
    setEditingId(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({ date: dayjs(), quantity: 1 });
    setModalVisible(true);
  };

  const handleEdit = (record: StockItem) => {
    setEditingId(record.id);
    modalForm.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await stockService.delete(isMock, id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await stockService.update(isMock, editingId, formattedValues);
        message.success('更新成功');
      } else {
        await stockService.add(isMock, formattedValues);
        message.success('新增成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    { 
      title: '序号', 
      dataIndex: 'id', 
      key: 'id', 
      width: 70,
    },
    { 
      title: '入库日期', 
      dataIndex: 'date', 
      key: 'date', 
      width: 120,
    },
    { title: '大类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '产品类型', dataIndex: 'productType', key: 'productType', width: 120 },
    { 
      title: '产品名称', 
      dataIndex: 'productName', 
      key: 'productName', 
      width: 150,
      render: (text: string) => <span style={{ fontWeight: 500, color: '#262626' }}>{text}</span>
    },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 180 },
    { 
      title: '物料编码', 
      dataIndex: 'materialCode', 
      key: 'materialCode', 
      width: 140,
    },
    { 
      title: '序列号', 
      dataIndex: 'serialNumber', 
      key: 'serialNumber', 
      width: 140,
    },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      width: 80,
      render: (text: number) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{text}</span>
    },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '入库机房', dataIndex: 'warehouse', key: 'warehouse', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: StockItem) => (
        <Space size="middle">
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
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
              <Input placeholder="名称 / 品牌 / PN码 / 位置" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="category" label="大类">
              <Input placeholder="如 交换机" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="productName" label="产品名称">
              <Input placeholder="如 光模块" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="materialCode" label="物料编码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="serialNumber" label="序列号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="warehouse" label="入库机房">
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
              新增库存
            </Button>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        className={styles.table}
        scroll={{ x: 1500 }}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: false,
          position: ['bottomRight'],
        }}
      />

      <Modal
        title={editingId ? '编辑库存' : '新增库存'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={1000}
        okText="保存"
        cancelText="取消"
      >
        <Form form={modalForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="date" label="入库日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="大类" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="productType" label="产品类型">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="productName" label="产品名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brand" label="产品品牌">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="spec" label="产品规格">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pnCode" label="PN码">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="materialCode" label="物料编码">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serialNumber" label="序列号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="appliedDeviceType" label="适用设备类型">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="appliedDeviceModel" label="适用设备型号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purchaseOrder" label="采购单号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="入库数量" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="单位">
                <Select
                  options={[
                    { value: '台', label: '台' },
                    { value: '个', label: '个' },
                    { value: '块', label: '块' },
                    { value: '米', label: '米' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="warehouse" label="入库机房">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="存放位置">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="产品描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockManagement;
