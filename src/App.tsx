/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout, Menu, Switch, Typography, ConfigProvider, theme, Dropdown } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  DatabaseOutlined,
  ExportOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { motion, AnimatePresence } from 'motion/react';
import { MockProvider, useMock } from './context/MockContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StockManagement from './pages/StockManagement';
import OutboundManagement from './pages/OutboundManagement';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const useStyles = createStyles(({ css }) => ({
  layout: css`
    min-height: 100vh;
    background-color: #f4f7fa;
  `,
  sider: css`
    background: #fff !important;
    border-right: 1px solid #f0f0f0 !important;
    transition: all 0.2s !important;
    position: fixed !important;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 20;
    .ant-menu {
      background: transparent !important;
      border-inline-end: none !important;
      padding: 16px 0;
    }
    .ant-menu-item {
      height: 48px !important;
      line-height: 48px !important;
      margin: 4px 12px !important;
      width: calc(100% - 24px) !important;
      border-radius: 8px !important;
      color: #595959 !important;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      .anticon {
        font-size: 18px !important;
        transition: transform 0.3s;
      }

      &:hover {
        color: #1890ff !important;
        background: #f0f7ff !important;
        .anticon {
          transform: translateX(2px);
        }
      }
    }
    .ant-menu-item-selected {
      background: #e6f7ff !important;
      color: #1890ff !important;
      font-weight: 600;
      &::after {
        display: none;
      }
    }
  `,
  logo: css`
    height: 64px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
    overflow: hidden;
    transition: all 0.2s;
    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
      flex-shrink: 0;
      color: #fff;
      font-size: 18px;
    }
    .logo-text {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
      opacity: 1;
      transition: opacity 0.2s;
      .main-title {
        font-size: 16px;
        font-weight: 700;
        color: #262626;
        letter-spacing: -0.5px;
        line-height: 1.2;
      }
      .sub-title {
        font-size: 9px;
        color: #8c8c8c;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        line-height: 1.2;
      }
    }
    &.collapsed .logo-text {
      opacity: 0;
      width: 0;
    }
  `,
  header: css`
    background: #fff !important;
    padding: 0 24px !important;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px !important;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    gap: 16px;
    position: fixed !important;
    top: 0;
    right: 0;
    left: 240px;
    z-index: 10;
    transition: left 0.2s !important;
    &.collapsed {
      left: 80px;
    }
  `,
  trigger: css`
    font-size: 18px;
    line-height: 64px;
    cursor: pointer;
    transition: color 0.3s;
    padding: 0 12px;
    &:hover {
      color: #1890ff;
    }
  `,
  headerLeft: css`
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
    .page-title {
      margin: 0 !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #262626;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .page-desc {
      font-size: 13px;
      color: #8c8c8c;
      padding-left: 16px;
      border-left: 1px solid #e8e8e8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
  headerRight: css`
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  `,
  apiInfo: css`
    font-size: 12px;
    color: #595959;
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 4px;
    white-space: nowrap;
    .status-dot {
      width: 6px;
      height: 6px;
      background: #52c41a;
      border-radius: 50%;
    }
  `,
  mockToggle: css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #595959;
    white-space: nowrap;
  `,
  contentWrapper: css`
    padding: 24px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    min-height: calc(100vh - 64px - 48px);
  `,
  mainLayout: css`
    margin-left: 240px;
    margin-top: 64px;
    min-height: calc(100vh - 64px);
    transition: margin-left 0.2s !important;
    &.collapsed {
      margin-left: 80px;
    }
  `,
  userSection: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 32px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background: #f5f5f5;
    }
    .username {
      font-size: 14px;
      font-weight: 500;
      color: #595959;
    }
  `,
  loadingContainer: css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f7fa;
  `,
}));

const AppContent = () => {
  const { styles } = useStyles();
  const { isMock, setIsMock } = useMock();
  const { user, logout, isAuthenticated } = useAuth();
  const [currentMenu, setCurrentMenu] = useState('stock');
  const [collapsed, setCollapsed] = useState(false);

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  const menuItems = [
    {
      key: 'stock',
      icon: <DatabaseOutlined />,
      label: '库存管理',
    },
    {
      key: 'outbound',
      icon: <ExportOutlined />,
      label: '出库管理',
    },
  ];

  const renderContent = () => {
    switch (currentMenu) {
      case 'stock':
        return <StockManagement />;
      case 'outbound':
        return <OutboundManagement />;
      default:
        return <StockManagement />;
    }
  };

  const pageTitle = currentMenu === 'stock' ? '库存管理' : '出库管理';

  // 未登录显示登录页面
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout className={styles.layout}>
      <Sider
        width={240}
        collapsedWidth={80}
        collapsed={collapsed}
        className={styles.sider}
      >
        <div className={`${styles.logo} ${collapsed ? 'collapsed' : ''}`}>
          <div className="logo-icon">
            <SafetyCertificateOutlined />
          </div>
          <div className="logo-text">
            <span className="main-title">物资监管平台</span>
            <span className="sub-title">Inventory Control</span>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentMenu]}
          items={menuItems}
          onClick={({ key }) => setCurrentMenu(key)}
          inlineCollapsed={collapsed}
        />
      </Sider>
      <Layout className={`${styles.mainLayout} ${collapsed ? 'collapsed' : ''}`}>
        <Header className={`${styles.header} ${collapsed ? 'collapsed' : ''}`}>
          <div className={styles.headerLeft}>
            {collapsed ? (
              <MenuUnfoldOutlined className={styles.trigger} onClick={() => setCollapsed(!collapsed)} />
            ) : (
              <MenuFoldOutlined className={styles.trigger} onClick={() => setCollapsed(!collapsed)} />
            )}
            <Title level={1} className="page-title">{pageTitle}</Title>
            <Text className="page-desc">标准化物资储备与出库监管系统</Text>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.apiInfo}>
              <GlobalOutlined /> 接口地址: 127.0.0.1:7777
            </div>
            <div className={styles.mockToggle}>
              <span>模拟数据</span>
              <Switch
                checked={isMock}
                onChange={setIsMock}
                size="small"
                style={{ backgroundColor: isMock ? '#1890ff' : undefined }}
              />
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userSection}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <span className="username">{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          <div className={styles.contentWrapper}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
          colorBgBase: '#ffffff',
          colorBgContainer: '#ffffff',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            headerColor: '#262626',
            rowHoverBg: '#f5f5f5',
          },
          Button: {
            borderRadius: 4,
          },
          Input: {
            borderRadius: 4,
          },
        }
      }}
    >
      <AuthProvider>
        <MockProvider>
          <AppContent />
        </MockProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
