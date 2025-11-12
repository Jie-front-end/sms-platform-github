<!--
  * 首页 - 短信平台仪表盘
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-09-12 22:34:00
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
  *
-->
<template>
  <div class="dashboard">
    <!-- 查询条件 -->
    <a-card :bordered="false" class="filter-card" style="margin-bottom: 20px;">
      <a-form layout="inline" :model="queryForm">
        <a-form-item label="日期范围">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
            style="width: 240px;"
          />
        </a-form-item>

        <a-form-item label="时间类型">
          <a-select
            v-model:value="queryForm.timeType"
            placeholder="请选择时间类型"
            style="width: 120px;"
          >
            <a-select-option value="day">天</a-select-option>
            <a-select-option value="week">周</a-select-option>
            <a-select-option value="month">月</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="签名名称">
          <SignSelect
            v-model:value="queryForm.signName"
            placeholder="请选择签名名称"
            style="width: 160px;"
          />
        </a-form-item>

        <a-form-item label="模板代码">
          <a-input
            v-model:value="queryForm.templateName"
            placeholder="请点击选择模板"
            readonly
            style="width: 200px;"
            allowClear
            @click="showTemplateModal"
            @clear="handleTemplateClear"
          >
            <template #suffix>
              <SearchOutlined style="cursor: pointer; color: #1890ff" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="handleQuery" :loading="loading">
            查询
          </a-button>
          <a-button style="margin-left: 8px;" @click="handleReset">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 顶部统计卡片 -->
    <a-row :gutter="20" class="stats-row">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon success">
              <MessageOutlined style="font-size: 24px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalCount || 0 }}</div>
              <div class="stat-label">发送总数</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon primary">
              <CheckCircleOutlined style="font-size: 24px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.successCount || 0 }}</div>
              <div class="stat-label">成功数</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon warning">
              <UserOutlined style="font-size: 24px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.successRate || '0%' }}</div>
              <div class="stat-label">成功率</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="6">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon danger">
              <WarningOutlined style="font-size: 24px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.failCount || 0 }}</div>
              <div class="stat-label">失败数</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 次要统计卡片 -->
    <a-row :gutter="20" style="margin-bottom: 20px;">
      <a-col :span="12">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon info">
              <ClockCircleOutlined style="font-size: 24px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.waitingCount || 0 }}</div>
              <div class="stat-label">等待回执数</div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card :bordered="false" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon danger">
              <StopOutlined style="font-size: 24px" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.interceptCount || 0 }}</div>
              <div class="stat-label">拦截数</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="20" class="charts-row">
      <a-col :span="12">
        <a-card :bordered="false" title="发送量统计">
          <div ref="sendChartRef" class="chart"></div>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card :bordered="false" title="成功率趋势">
          <div ref="successChartRef" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近短信记录表格 -->
    <a-row :gutter="20" class="table-row">
      <a-col :span="24">
        <a-card :bordered="false" title="最近短信记录">
          <a-table
            :columns="columns"
            :data-source="recentMessages"
            :pagination="false"
            size="middle"
            rowKey="recordId"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'sendStatus'">
                <a-tag v-if="record.sendStatus === 1" color="success">成功</a-tag>
                <a-tag v-else-if="record.sendStatus === 0" color="error">失败</a-tag>
                <a-tag v-else-if="record.sendStatus === 2" color="processing">等待回执</a-tag>
                <a-tag v-else-if="record.sendStatus === 3" color="warning">拦截</a-tag>
                <a-tag v-else color="default">未知</a-tag>
              </template>
              <template v-if="column.key === 'sendDate'">
                {{ record.sendDate ? dayjs(record.sendDate).format('YYYY-MM-DD HH:mm:ss') : '-' }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>

  <!-- 模板选择弹窗 -->
  <TemplateSelectModal ref="templateModalRef" :signName="queryForm.signName" @select="handleTemplateSelect" />
</template>

<script setup>
  import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue';
  import { MessageOutlined, CheckCircleOutlined, UserOutlined, WarningOutlined, ClockCircleOutlined, StopOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import * as echarts from 'echarts';
  import dayjs from 'dayjs';
  import { statisticsApi } from '/@/api/business/sms-manager/statistics-api.js';
  import { smsQueryApi } from '/@/api/business/sms-manager/sms-query-api.js';
  import SignSelect from '/@/components/business/sign-select/index.vue';
  import TemplateSelectModal from '/@/components/business/template-select-modal/index.vue';

  // 图表引用
  const sendChartRef = ref(null);
  const successChartRef = ref(null);
  let sendChartInstance = null;
  let successChartInstance = null;

  // 模板选择弹窗引用
  const templateModalRef = ref(null);

  // 加载状态
  const loading = ref(false);

  // 查询表单
  const queryForm = reactive({
    dateRange: [dayjs().subtract(7, 'day'), dayjs()],
    timeType: 'day',
    signName: '南宁交通物流集团',
    templateCode: '',
    templateName: '' // 用于显示模板名称
  });

  // 统计数据
  const stats = reactive({
    totalCount: 0,
    successCount: 0,
    failCount: 0,
    interceptCount: 0,
    waitingCount: 0,
    successRate: '0%'
  });

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 80,
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
    },
    {
      title: '短信内容',
      dataIndex: 'smsContent',
      key: 'smsContent',
      ellipsis: true,
    },
    {
      title: '签名',
      dataIndex: 'signName',
      key: 'signName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'sendStatus',
      key: 'sendStatus',
      width: 100,
    },
    {
      title: '发送时间',
      dataIndex: 'sendDate',
      key: 'sendDate',
      width: 180,
    },
  ];

  // 最近短信记录
  const recentMessages = ref([]);

  // 查询统计数据
  const fetchStatistics = async () => {
    try {
      loading.value = true;

      // 验证日期范围
      if (!queryForm.dateRange || queryForm.dateRange.length !== 2) {
        message.error('请选择日期范围');
        return;
      }

      // 组装请求参数
      const params = {
        startDate: dayjs(queryForm.dateRange[0]).format('YYYY-MM-DD'),
        endDate: dayjs(queryForm.dateRange[1]).format('YYYY-MM-DD'),
        timeType: queryForm.timeType
      };

      // 添加可选参数
      if (queryForm.signName) {
        params.signName = queryForm.signName;
      }
      if (queryForm.templateCode) {
        params.templateCode = queryForm.templateCode;
      }

      // 调用 API
      const res = await statisticsApi.getStatisticsOverview(params);

      if (res.data) {
        // 更新统计数据
        stats.totalCount = res.data.totalCount || 0;
        stats.successCount = res.data.successCount || 0;
        stats.failCount = res.data.failCount || 0;
        stats.interceptCount = res.data.interceptCount || 0;
        stats.waitingCount = res.data.waitingCount || 0;
        stats.successRate = res.data.successRate || '0%';
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  // 查询按钮点击事件
  const handleQuery = () => {
    fetchStatistics();
    fetchChartData();
  };

  // 重置按钮点击事件
  const handleReset = () => {
    queryForm.dateRange = [dayjs().subtract(7, 'day'), dayjs()];
    queryForm.timeType = 'day';
    queryForm.signName = '南宁交通物流集团';
    queryForm.templateCode = '';
    queryForm.templateName = '';
    fetchStatistics();
    fetchChartData();
  };

  // 显示模板选择弹窗
  const showTemplateModal = () => {
    templateModalRef.value?.show();
  };

  // 处理模板选择
  const handleTemplateSelect = (template) => {
    queryForm.templateCode = template.templateCode;
    queryForm.templateName = template.templateName;
  };

  // 处理模板清空
  const handleTemplateClear = () => {
    queryForm.templateCode = '';
    queryForm.templateName = '';
  };

  // 格式化时间轴标签
  const formatTimeLabel = (dateStr, timeType) => {
    const date = dayjs(dateStr);
    if (timeType === 'day') {
      return date.format('MM-DD');
    } else if (timeType === 'week') {
      return `第${date.week()}周`;
    } else if (timeType === 'month') {
      return date.format('YYYY-MM');
    }
    return dateStr;
  };

  // 更新图表数据
  const updateCharts = (chartData) => {
    if (!chartData || chartData.length === 0) {
      console.log('图表数据为空');
      return;
    }

    try {
      // 提取时间轴数据
      const xAxisData = chartData.map(item =>
        formatTimeLabel(item.statisticsTime, queryForm.timeType)
      );

      // 提取发送量数据
      const sendCountData = chartData.map(item => item.totalCount || 0);

      // 提取成功率数据（处理百分号字符串）
      const successRateData = chartData.map(item => {
        if (!item.successRate) return 0;
        const rate = typeof item.successRate === 'string'
          ? parseFloat(item.successRate.replace('%', ''))
          : item.successRate;
        return rate || 0;
      });

      // 更新发送量图表
      if (sendChartInstance) {
        sendChartInstance.setOption({
          xAxis: {
            data: xAxisData
          },
          series: [{
            data: sendCountData
          }]
        });
      }

      // 更新成功率图表
      if (successChartInstance) {
        // 动态计算 y 轴范围
        const minRate = Math.min(...successRateData);
        const maxRate = Math.max(...successRateData);
        const yMin = Math.max(0, Math.floor(minRate - 5));
        const yMax = Math.min(100, Math.ceil(maxRate + 5));

        successChartInstance.setOption({
          xAxis: {
            data: xAxisData
          },
          yAxis: {
            min: yMin,
            max: yMax
          },
          series: [{
            data: successRateData
          }]
        });
      }
    } catch (error) {
      console.error('更新图表失败:', error);
    }
  };

  // 获取图表数据
  const fetchChartData = async () => {
    try {
      // 验证日期范围
      if (!queryForm.dateRange || queryForm.dateRange.length !== 2) {
        return;
      }

      // 组装请求参数
      const params = {
        startDate: dayjs(queryForm.dateRange[0]).format('YYYY-MM-DD'),
        endDate: dayjs(queryForm.dateRange[1]).format('YYYY-MM-DD'),
        timeType: queryForm.timeType
      };

      // 添加可选参数
      if (queryForm.signName) {
        params.signName = queryForm.signName;
      }
      if (queryForm.templateCode) {
        params.templateCode = queryForm.templateCode;
      }

      // 调用 API
      const res = await statisticsApi.getStatisticsDetail(params);

      if (res.data && res.data.length > 0) {
        updateCharts(res.data);
      } else {
        // 空数据时清空图表
        updateCharts([]);
      }
    } catch (error) {
      console.error('获取图表数据失败:', error);
    }
  };

  // 获取最近短信记录
  const fetchRecentMessages = async () => {
    try {
      const params = {
        pageNum: 1,
        pageSize: 10,
        searchCount: true,
        signName: '南宁交通物流集团'
      };

      const res = await smsQueryApi.queryPage(params);

      if (res.data && res.data.list) {
        recentMessages.value = res.data.list;
      }
    } catch (error) {
      console.error('获取最近短信记录失败:', error);
    }
  };

  // 初始化图表
  const initCharts = () => {
    nextTick(() => {
      // 发送量统计图表
      if (sendChartRef.value) {
        sendChartInstance = echarts.init(sendChartRef.value);
        const sendOption = {
          tooltip: {
            trigger: 'axis'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            name: '发送量',
            type: 'line',
            smooth: true,
            data: [1200, 1900, 3000, 5000, 4500, 3200, 2100],
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(24, 144, 255, 0.3)'
                }, {
                  offset: 1,
                  color: 'rgba(24, 144, 255, 0.05)'
                }]
              }
            },
            lineStyle: {
              color: '#1890ff'
            },
            itemStyle: {
              color: '#1890ff'
            }
          }]
        };
        sendChartInstance.setOption(sendOption);
      }

      // 成功率趋势图表
      if (successChartRef.value) {
        successChartInstance = echarts.init(successChartRef.value);
        const successOption = {
          tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}%'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            type: 'value',
            min: 90,
            max: 100,
            axisLabel: {
              formatter: '{value}%'
            }
          },
          series: [{
            name: '成功率',
            type: 'bar',
            data: [98.2, 97.8, 98.5, 99.1, 98.9, 98.3, 98.7],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: '#52c41a'
                }, {
                  offset: 1,
                  color: '#95de64'
                }]
              },
              borderRadius: [4, 4, 0, 0]
            }
          }]
        };
        successChartInstance.setOption(successOption);
      }

      // 响应式处理
      window.addEventListener('resize', handleResize);
    });
  };

  // 处理窗口大小变化
  const handleResize = () => {
    sendChartInstance?.resize();
    successChartInstance?.resize();
  };

  onMounted(() => {
    fetchStatistics();
    fetchRecentMessages();
    initCharts();
    // 等待图表初始化完成后加载数据
    nextTick(() => {
      fetchChartData();
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    sendChartInstance?.dispose();
    successChartInstance?.dispose();
  });
</script>

<style lang="less" scoped>
  .dashboard {
    padding: 20px;
    background: #f0f2f5;
    min-height: 100vh;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    color: white;

    &.success {
      background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
    }

    &.primary {
      background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
    }

    &.warning {
      background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
    }

    &.danger {
      background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
    }

    &.info {
      background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
    }
  }

  .stat-content {
    flex: 1;
  }

  .stat-number {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    line-height: 1;
    margin-bottom: 5px;
  }

  .stat-label {
    color: #666;
    font-size: 14px;
  }

  .charts-row {
    margin-bottom: 20px;

    :deep(.ant-card) {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  .chart {
    height: 300px;
    width: 100%;
  }

  .table-row {
    margin-bottom: 20px;

    :deep(.ant-card) {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }
</style>

