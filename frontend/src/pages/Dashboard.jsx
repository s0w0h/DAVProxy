import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DatabaseOutlined, KeyOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    storageSourceCount: 0,
    proxyCredentialCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sourcesResponse, credentialsResponse] = await Promise.all([
          axios.get('http://localhost:8000/storage-sources/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:8000/proxy-credentials/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setStats({
          storageSourceCount: sourcesResponse.data.length,
          proxyCredentialCount: credentialsResponse.data.length
        });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic
              title="存储源数量"
              value={stats.storageSourceCount}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="代理凭据数量"
              value={stats.proxyCredentialCount}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;