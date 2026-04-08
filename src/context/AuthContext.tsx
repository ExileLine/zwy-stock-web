/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';

// 用户信息类型
export interface UserInfo {
  id: number;
  username: string;
  token: string;
  role_codes?: string[];
  permission_codes?: string[];
  [key: string]: any;
}

// 认证上下文类型
interface AuthContextType {
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token 存储键
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// AuthProvider 组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // 初始化：从 localStorage 恢复登录状态
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  // 登录函数
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/acc/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.code === 200 && result.data) {
        const userData: UserInfo = {
          id: result.data.id,
          username: result.data.username,
          token: result.data.token,
          role_codes: result.data.role_codes || [],
          permission_codes: result.data.permission_codes || [],
          ...result.data,
        };

        // 存储到 state
        setUser(userData);

        // 存储到 localStorage
        localStorage.setItem(TOKEN_KEY, userData.token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        message.success('登录成功');
        return true;
      } else {
        message.error(result.message || '登录失败');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录请求失败，请检查网络连接');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 退出登录函数
  const logout = async () => {
    try {
      if (user?.token) {
        await fetch('/api/v1/acc/logout', {
          method: 'DELETE',
          headers: {
            'Authorization': user.token,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地状态
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      message.success('已退出登录');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义 Hook 使用认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
