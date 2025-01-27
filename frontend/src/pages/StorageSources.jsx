import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

function StorageSources() {
  const [sources, setSources] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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
    fetchSources();
  }, []);

  const handleAdd = async (values) => {
    try {
      await axios.post('http://localhost:8000/storage-sources/', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('添加存储源成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchSources();
    } catch (error) {
      message.error('添加存储源失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'WebDAV地址',
      dataIndex: 'webdav_url',
      key: 'webdav_url'
    },
    {
      title: '原始用户名',
      dataIndex: 'original_username',
      key: 'original_username'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
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
          添加存储源
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sources}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="添加存储源"
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
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入存储源名称' }]}
          >
            <Input placeholder="请输入存储源名称" />
          </Form.Item>

          <Form.Item
            name="webdav_url"
            label="WebDAV地址"
            rules={[{ required: true, message: '请输入WebDAV地址' }]}
          >
            <Input placeholder="请输入WebDAV地址" />
          </Form.Item>

          <Form.Item
            name="original_username"
            label="原始用户名"
            rules={[{ required: true, message: '请输入原始用户名' }]}
          >
            <Input placeholder="请输入原始用户名" />
          </Form.Item>

          <Form.Item
            name="original_password"
            label="原始密码"
            rules={[{ required: true, message: '请输入原始密码' }]}
          >
            <Input.Password placeholder="请输入原始密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StorageSources;