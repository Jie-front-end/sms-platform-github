/*
 * 自动审核规则 API - Mock版本
 *
 * @Author:    Claude
 * @Date:      2025-11-04
 */

// Mock数据
const mockRules = [
  {
    ruleId: 1,
    ruleName: '违禁词过滤规则',
    ruleType: 'FORBIDDEN_WORDS',
    ruleDescription: '过滤包含违禁词的短信内容',
    ruleContent: '{赌博,色情,暴力,政治敏感词}',
    status: 1,
    createDate: '2025-11-01 10:00:00',
    updateDate: '2025-11-03 15:30:00'
  },
  {
    ruleId: 2,
    ruleName: '发送频率限制',
    ruleType: 'FREQUENCY_LIMIT',
    ruleDescription: '限制同一号码发送频率',
    ruleContent: '{"maxPerMinute":1,"maxPerHour":10,"maxPerDay":100}',
    status: 1,
    createDate: '2025-11-01 11:00:00',
    updateDate: '2025-11-02 09:20:00'
  }
];

export const autoApprovalApi = {
  // 查询自动审核规则列表
  queryPage: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredRules = mockRules.filter(rule => {
          if (params.ruleName && !rule.ruleName.includes(params.ruleName)) return false;
          if (params.ruleType && rule.ruleType !== params.ruleType) return false;
          if (params.status !== undefined && rule.status !== params.status) return false;
          return true;
        });

        const startIndex = (params.pageNum - 1) * params.pageSize;
        const endIndex = startIndex + params.pageSize;
        const pagedRules = filteredRules.slice(startIndex, endIndex);

        resolve({
          code: 0,
          message: 'success',
          data: {
            list: pagedRules,
            total: filteredRules.length
          }
        });
      }, 500);
    });
  },

  // 添加自动审核规则
  add: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRule = {
          ruleId: Math.max(...mockRules.map(r => r.ruleId)) + 1,
          ...data,
          createDate: new Date().toLocaleString(),
          updateDate: new Date().toLocaleString()
        };
        mockRules.push(newRule);
        resolve({
          code: 0,
          message: '添加成功',
          data: newRule
        });
      }, 300);
    });
  },

  // 更新自动审核规则
  update: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRules.findIndex(rule => rule.ruleId === data.ruleId);
        if (index !== -1) {
          mockRules[index] = {
            ...mockRules[index],
            ...data,
            updateDate: new Date().toLocaleString()
          };
        }
        resolve({
          code: 0,
          message: '更新成功'
        });
      }, 300);
    });
  },

  // 删除自动审核规则
  delete: (ruleId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRules.findIndex(rule => rule.ruleId === ruleId);
        if (index !== -1) {
          mockRules.splice(index, 1);
        }
        resolve({
          code: 0,
          message: '删除成功'
        });
      }, 300);
    });
  },

  // 批量删除自动审核规则
  batchDelete: (ruleIds) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        ruleIds.forEach(id => {
          const index = mockRules.findIndex(rule => rule.ruleId === id);
          if (index !== -1) {
            mockRules.splice(index, 1);
          }
        });
        resolve({
          code: 0,
          message: '批量删除成功'
        });
      }, 500);
    });
  },

  // 启用/禁用规则
  updateStatus: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRules.findIndex(rule => rule.ruleId === params.ruleId);
        if (index !== -1) {
          mockRules[index].status = params.status;
          mockRules[index].updateDate = new Date().toLocaleString();
        }
        resolve({
          code: 0,
          message: '状态更新成功'
        });
      }, 300);
    });
  },

  // 获取规则详情
  queryById: (ruleId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rule = mockRules.find(r => r.ruleId === ruleId);
        resolve({
          code: 0,
          message: 'success',
          data: rule || null
        });
      }, 200);
    });
  },

  // 测试规则
  testRule: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 简单的模拟测试逻辑
        const hasForbiddenWords = params.testContent.includes('测试') || params.testContent.includes('违规');
        resolve({
          code: 0,
          message: '测试完成',
          data: {
            passed: !hasForbiddenWords,
            result: hasForbiddenWords ? '内容包含违禁词' : '内容通过审核'
          }
        });
      }, 500);
    });
  },

  // 获取规则类型列表
  getRuleTypes: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 0,
          message: 'success',
          data: [
            { value: 'FORBIDDEN_WORDS', label: '违禁词过滤' },
            { value: 'FREQUENCY_LIMIT', label: '发送频率限制' },
            { value: 'PHONE_VALIDATION', label: '手机号验证' },
            { value: 'CONTENT_LENGTH', label: '内容长度限制' }
          ]
        });
      }, 200);
    });
  }
};