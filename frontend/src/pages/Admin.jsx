import { Table, Button, Switch, message, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Admin() {
  const [users, setUsers] = useState([]);
  const [allowRegistration, setAllowRegistration] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/system-config/registration', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAllowRegistration(response.data.allow_registration);
    } catch (error) {
      message.error('获取注册状态失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  const handleRegistrationChange = async (checked) => {
    try {
      await axios.put(
        'http://localhost:8000/admin/system-config/registration',
        { allow_registration: checked },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setAllowRegistration(checked);
      message.success('更新注册状态成功');
    } catch (error) {
      message.error('更新注册状态失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      message.success('删除用户成功');
      fetchUsers();
    } catch (error) {
      message.error('删除用户失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRegistrationStatus();
  }, []);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '管理员',
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: (isAdmin) => (isAdmin ? '是' : '否'),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这个用户吗？"
          onConfirm={() => handleDeleteUser(record.id)}
          okText="确定"
          cancelText="取消"
          disabled={record.is_admin}
        >
          <Button danger disabled={record.is_admin}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>系统设置</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>允许新用户注册：</span>
          <Switch checked={allowRegistration} onChange={handleRegistrationChange} />
        </div>
      </div>

      <div>
        <h2>用户管理</h2>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}

export default Admin;