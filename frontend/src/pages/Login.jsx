import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);

      const response = await axios.post('http://localhost:8000/token', formData);
      onLogin(response.data.access_token);
      message.success('登录成功');
    } catch (error) {
      message.error('登录失败：' + (error.response?.data?.detail || '未知错误'));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Card title="登录" bordered={false}>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <Link to="/register">还没有账号？立即注册</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;