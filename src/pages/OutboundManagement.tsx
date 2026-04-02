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
} from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { OutboundItem } from '../types';
import { outboundService, OutboundPageQuery } from '../services/api';
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

const OutboundManagement: React.FC = () => {
  const { styles } = useStyles();
  const { isMock } = useMock();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OutboundItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

      // 构建查询参数
      const query: OutboundPageQuery = {
        page,
        size,
        keyword: values.keyword,
        product_serial_number: values.serialNumber,
        product_name: values.productName,
        product_brand: values.brand,
        product_spec: values.spec,
        pn_code: values.pnCode,
        material_code: values.materialCode,
        usage_purpose: values.purpose,
        target_device_serial_number: values.appliedDeviceSerial,
        target_room: values.warehouse,
        target_device_location: values.location,
        owner_org: values.department,
      };

      // 移除空值
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
    modalForm.setFieldsValue({ date: dayjs(), quantity: 1 });
    setModalVisible(true);
  };

  const handleEdit = (record: OutboundItem) => {
    setEditingId(record.id);
    modalForm.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await outboundService.delete(isMock, id);
      message.success('删除成功');
      fetchData(pagination.current, pagination.pageSize);
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
        await outboundService.update(isMock, editingId, formattedValues);
        message.success('更新成功');
      } else {
        await outboundService.add(isMock, formattedValues);
        message.success('新增成功');
      }
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
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
      title: '领用日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '产品序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 150,
    },
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
      title: '领用数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (text: number) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{text}</span>
    },
    { title: '用途', dataIndex: 'purpose', key: 'purpose', width: 150 },
    { title: '用于机房', dataIndex: 'warehouse', key: 'warehouse', width: 150 },
    { title: '归属单位', dataIndex: 'department', key: 'department', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: OutboundItem) => (
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
              <Input placeholder="名称 / 编码 / 用途 / 机房" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="productName" label="产品名称">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="serialNumber" label="产品序列号">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="materialCode" label="物料编码">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="warehouse" label="用于机房">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="department" label="归属单位">
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
        title={editingId ? '编辑出库' : '新增出库'}
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
              <Form.Item name="date" label="领用日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serialNumber" label="产品序列号" rules={[{ required: true }]}>
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
              <Form.Item name="quantity" label="领用数量" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purpose" label="用途">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="appliedDeviceSerial" label="用于设备序列号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="warehouse" label="用于机房">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="用于设备位置">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="归属用户单位">
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
  editingId?: string,
  isMock?: boolean,
  content?: any
}

export const AddOutbound = (props: AddOutboundProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const editingId = props.editingId || undefined;
  const isMock = props.isMock || false;
  const [modalForm] = Form.useForm();

  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await outboundService.update(isMock, editingId, formattedValues);
        message.success('更新成功');
      } else {
        await outboundService.add(isMock, formattedValues);
        message.success('新增成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <>
      <div onClick={ () => setModalVisible(true)}>
        {props.content}
      </div>
      <Modal
        title={editingId ? '编辑出库' : '新增出库'}
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
              <Form.Item name="date" label="领用日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serialNumber" label="产品序列号" rules={[{ required: true }]}>
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
              <Form.Item name="quantity" label="领用数量" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purpose" label="用途">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="appliedDeviceSerial" label="用于设备序列号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="warehouse" label="用于机房">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="用于设备位置">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="归属用户单位">
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
  )
}
