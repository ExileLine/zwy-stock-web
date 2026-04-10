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
import { stockService, StockPageQuery } from '../services/api';
import { AddOutbound } from './OutboundManagement';

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
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StockItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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

      // 构建查询参数（使用下划线命名）
      const query: StockPageQuery = {
        page,
        size,
        keyword: values.keyword,
        major_category: values.major_category,
        product_type: values.product_type,
        product_name: values.product_name,
        product_brand: values.product_brand,
        product_spec: values.product_spec,
        pn_code: values.pn_code,
        material_code: values.material_code,
        serial_number: values.serial_number,
        applicable_device_type: values.applicable_device_type,
        applicable_device_model: values.applicable_device_model,
        purchase_order_no: values.purchase_order_no,
        inbound_room: values.inbound_room,
        storage_location: values.storage_location,
      };

      // 移除空值
      Object.keys(query).forEach((key) => {
        if (query[key as keyof StockPageQuery] === undefined || query[key as keyof StockPageQuery] === '') {
          delete query[key as keyof StockPageQuery];
        }
      });

      const result = await stockService.getList(query);
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
  }, [form]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    setEditingId(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({ inbound_date: dayjs(), inbound_qty: 1 });
    setModalVisible(true);
  };

  const handleEdit = (record: StockItem) => {
    setEditingId(record.id);
    modalForm.setFieldsValue({
      ...record,
      inbound_date: record.inbound_date ? dayjs(record.inbound_date) : dayjs(),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await stockService.delete(id.toString());
      message.success('删除成功');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error:any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const formattedValues = {
        ...values,
        inbound_date: values.inbound_date ? values.inbound_date.format('YYYY-MM-DD') : undefined,
        warranty_period: values.warranty_period ? values.warranty_period.format('YYYY-MM-DD') : undefined,
      };

      if (editingId) {
        await stockService.update(editingId.toString(), formattedValues);
        message.success('更新成功');
      } else {
        await stockService.add(formattedValues);
        message.success('新增成功');
      }
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error:any) {
      message.error(error?.message || '操作失败')
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
      dataIndex: 'inbound_date',
      key: 'inbound_date',
      width: 120,
    },
    { title: '大类', dataIndex: 'major_category', key: 'major_category', width: 100 },
    { title: '产品类型', dataIndex: 'product_type', key: 'product_type', width: 120 },
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
      title: '序列号',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 140,
    },
    {
      title: '数量',
      dataIndex: 'inbound_qty',
      key: 'inbound_qty',
      width: 80,
      render: (text: number) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{text}</span>
    },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '入库机房', dataIndex: 'inbound_room', key: 'inbound_room', width: 150 },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', width: 150 },
    { title: '维保期', dataIndex: 'warranty_period', key: 'warranty_period', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: StockItem) => (
        <Space size="middle">
          <AddOutbound
            onFinish={() => handleSearch()}
            stockId={record.id.toString()}
            content={(
              <Button
                type='link'
                className={styles.actionBtn}
              >
                出库
              </Button>
            )}
          />
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
            <Form.Item name="major_category" label="大类">
              <Input placeholder="如 交换机" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="product_name" label="产品名称">
              <Input placeholder="如 光模块" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="material_code" label="物料编码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="serial_number" label="序列号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="inbound_room" label="入库机房">
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
              <Form.Item name="inbound_date" label="入库日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="major_category" label="大类" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product_type" label="产品类型">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product_name" label="产品名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product_brand" label="产品品牌">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product_spec" label="产品规格">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pn_code" label="PN码">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="material_code" label="物料编码">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serial_number" label="序列号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="applicable_device_type" label="适用设备类型">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="applicable_device_model" label="适用设备型号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purchase_order_no" label="采购单号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="inbound_qty" label="入库数量" rules={[{ required: true }]}>
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
              <Form.Item name="inbound_room" label="入库机房">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="storage_location" label="存放位置">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="supplier" label="供应商">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="warranty_period" label="维保期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="product_description" label="产品描述">
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
