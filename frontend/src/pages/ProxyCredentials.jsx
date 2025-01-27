import { Table, Button, Modal, Form, InputNumber, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

function ProxyCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [sources, setSources] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchCredentials = async () => {
    try {
      const response = await axios.get('http://localhost:8000/proxy-credentials/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCredentials(response.data);
    } catch (error) {
      message.error('获取代理凭据失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  const fetchSources = async () => {
    try {
      const response = await axios.get('http://localhost:8000/storage-sources/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSources(response.data);
    } catch (error) {
      message.error('获取存储源失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  useEffect(() => {
    fetchCredentials();
    fetchSources();
  }, []);

  const handleAdd = async (values) => {
    try {
      await axios.post('http://localhost:8000/proxy-credentials/', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('生成代理凭据成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchCredentials();
    } catch (error) {
      message.error('生成代理凭据失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  const columns = [
    {
      title: '代理用户名',
      dataIndex: 'proxy_username',
      key: 'proxy_username'
    },
    {
      title: '代理密码',
      dataIndex: 'proxy_password',
      key: 'proxy_password'
    },
    {
      title: '存储源',
      dataIndex: 'storage_source',
      key: 'storage_source',
      render: (source) => source.name
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '过期时间',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (text) => new Date(text).toLocaleString()
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          生成代理凭据
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={credentials}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="生成代理凭据"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAdd}
          layout="vertical"
        >
          <Form.Item
            name="storage_source_id"
            label="存储源"
            rules={[{ required: true, message: '请选择存储源' }]}
          >
            <Select placeholder="请选择存储源">
              {sources.map(source => (
                <Select.Option key={source.id} value={source.id}>
                  {source.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="expires_days"
            label="有效期（天）"
            initialValue={30}
            rules={[{ required: true, message: '请输入有效期' }]}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认生成
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProxyCredentials;