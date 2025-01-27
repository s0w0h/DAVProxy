import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  DatabaseOutlined,
  KeyOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

function Navigation({ onLogout }) {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>
    },
    {
      key: 'storage-sources',
      icon: <DatabaseOutlined />,
      label: <Link to="/storage-sources">存储源</Link>
    },
    {
      key: 'proxy-credentials',
      icon: <KeyOutlined />,
      label: <Link to="/proxy-credentials">代理凭据</Link>
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout
    }
  ];

  return (
    <Sider width={200} theme="light">
      <Menu
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
}

export default Navigation;