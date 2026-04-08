/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const useStyles = createStyles(({ css }) => ({
  container: css`
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f4f7fa;
    background-image: radial-gradient(#1890ff11 1px, transparent 1px);
    background-size: 20px 20px;
  `,
  loginCard: css`
    width: 400px;
    background: #fff;
    padding: 40px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
  `,
  logoSection: css`
    text-align: center;
    margin-bottom: 40px;
    .logo-icon {
      font-size: 48px;
      color: #1890ff;
      margin-bottom: 16px;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 700;
      color: #262626;
      margin: 0 !important;
    }
    .logo-subtitle {
      font-size: 14px;
      color: #8c8c8c;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `,
  loginButton: css`
    width: 100%;
    height: 40px;
    font-size: 16px;
    font-weight: 600;
    margin-top: 8px;
  `,
  footer: css`
    margin-top: 24px;
    color: #bfbfbf;
    font-size: 12px;
  `,
}));

const Login: React.FC = () => {
  const { styles } = useStyles();
  const { login, loading } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    const success = await login(values.username, values.password);
    if (success) {
      form.resetFields();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <SafetyCertificateOutlined className="logo-icon" />
          <Title level={2} className="logo-title">物资监管平台</Title>
          <Text className="logo-subtitle">Inventory Control System</Text>
        </div>
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.loginButton}
              loading={loading}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className={styles.footer}>
        © 2026 物资储备与出库监管系统 版权所有
      </div>
    </div>
  );
};

export default Login;
