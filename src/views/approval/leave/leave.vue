<script setup>
import { reactive, getCurrentInstance, ref, onMounted, nextTick } from 'vue'
import { formatDate } from '@/utils'
import request from '@/api'
import { ElMessage } from 'element-plus'

const { ctx } = getCurrentInstance()
const queryForm = ref({
  applyStatus: 1
})
const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const leaveList = ref([])

const getLeaveList = async () => {
  const params = { ...queryForm.value, ...pager }
  console.log('参数：', params)
  const { list, page } = await request.getLeaveList(params)
  console.log('休假列表：', list)
  leaveList.value = list
  pager.total = page.total
}

// 初始化接口调用
onMounted(() => {
  getLeaveList()
})

// 创建休假弹框表单
const leaveForm = ref({
  leaveType: 1, // 休假类型 1-事假 2-调休 3-年假
  startTime: '',
  endTime: '',
  leaveTime: '0天',
  reasons: ''
})

// create:创建
// delete:作废
const action = ref('create')
const showModal = ref(false)
const showDetailModal = ref(false)
const detail = ref({})

// 重置查询表单
const handleReset = (form) => {
  ctx.$refs[form].resetFields()
}

const handleDelete = async (_id) => {
  const params = { _id, action: 'delete' }
  const res = await request.leaveOperate(params)
  ElMessage.success('删除成功')
  getLeaveList()
}

const handleApply = () => {
  showModal.value = true
  action.value = 'create'
}

const handleDetail = (row) => {
  let data = { ...row }
  data.leaveTypeName = {
    1: '事假',
    2: '调休',
    3: '年假'
  }[data.leaveType]
  data.time =
    formatDate(data.startTime, 'YYYY-MM-DD') +
    '到' +
    formatDate(data.endTime, 'YYYY-MM-DD')
  // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
  data.applyStatusName = {
    1: '待审批',
    2: '审批中',
    3: '审批拒绝',
    4: '审批通过',
    5: '作废'
  }[data.applyStatus]
  detail.value = data
  showDetailModal.value = true
}

// 弹框关闭
const handleClose = () => {
  showModal.value = false
  handleReset('dialogForm')
}

// 获取休假时长
const handleDateChange = (key, val) => {
  console.log('val: ', val)
  let { startTime, endTime } = leaveForm.value
  if (!startTime || !endTime) return

  if (startTime > endTime) {
    ElMessage.error('开始日期不能晚于结束日期')
    leaveForm.value.leaveTime = '0天'
    nextTick(() => (leaveForm[key] = ''))
  } else {
    leaveForm.value.leaveTime =
      (endTime - startTime) / (24 * 60 * 60 * 1000) + 1 + '天'
  }
}

// 提交申请
const handleSubmit = () => {
  ctx.$refs.dialogForm.validate(async (valid) => {
    if (valid) {
      const params = { ...leaveForm.value, action: action.value }
      console.log('提交申请params: ', params)
      const result = await request.leaveOperate(params)
      ElMessage.success('创建成功')
      handleClose()
      getLeaveList()
    }
  })
}

// 分页事件处理
const handleCurrentChange = (current) => {
  pager.pageNum = current
}

const columns = [
  {
    label: '单号',
    prop: 'leaveNo',
    width: 120
  },
  {
    label: '休假时间',
    prop: '',
    width: 170,
    formatter(row, col, value) {
      return (
        formatDate(row.startTime, 'YYYY-MM-DD') +
        '到' +
        formatDate(row.endTime, 'YYYY-MM-DD')
      )
    }
  },
  {
    label: '休假时长',
    prop: 'leaveTime'
  },
  {
    label: '休假类型',
    prop: 'leaveType',
    formatter(row, column, value) {
      return {
        1: '事假',
        2: '调休',
        3: '年假'
      }[value]
    }
  },
  {
    label: '休假原因',
    prop: 'reasons',
    width: 220
  },
  {
    label: '申请时间',
    prop: 'createTime',
    width: 150,
    formatter: (row, column, value) => {
      return formatDate(value)
    }
  },
  {
    label: '审批人',
    prop: 'approvers',
    width: '120px'
  },
  {
    label: '当前审批人',
    prop: 'currentApprover'
  },
  {
    label: '审批状态',
    prop: 'applyStatus',
    formatter: (row, column, value) => {
      // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
      return {
        1: '待审批',
        2: '审批中',
        3: '审批拒绝',
        4: '审批通过',
        5: '作废'
      }[value]
    }
  }
]

// 表单规则
const rules = {
  startTime: [
    {
      type: 'date',
      required: true,
      message: '请输入开始日期',
      trigger: 'change'
    }
  ],
  endTime: [
    {
      type: 'date',
      required: true,
      message: '请输入结束日期',
      trigger: 'change'
    }
  ]
  // reasons: [
  //   {
  //     required: true,
  //     message: '请输入休假原因',
  //     trigger: ['change', 'blur']
  //   }
  // ]
}
</script>

<template>
  <div class="vacation">
    <div class="user-manage">
      <div class="query-form">
        <el-form ref="form" :inline="true" :model="queryForm">
          <el-form-item label="审批状态" prop="applyStatus">
            <el-select v-model="queryForm.applyStatus">
              <el-option value="" label="全部"></el-option>
              <el-option :value="1" label="待审批"></el-option>
              <el-option :value="2" label="审批中"></el-option>
              <el-option :value="3" label="审批拒绝"></el-option>
              <el-option :value="4" label="审批通过"></el-option>
              <el-option :value="5" label="作废"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getLeaveList">查询</el-button>
            <el-button @click="handleReset('form')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="base-table">
        <div class="action">
          <el-button type="primary" @click="handleApply">申请休假</el-button>
        </div>
        <el-table :data="leaveList">
          <el-table-column
            v-for="item in columns"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            :formatter="item.formatter"
          >
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template v-slot="{ row }">
              <el-button @click="handleDetail(row)">查看</el-button>
              <el-button
                type="danger"
                @click="handleDelete(row._id)"
                v-if="row.applyStatus == 1 || row.applyStatus == 2"
                >作废</el-button
              >
              <!-- 状态为待审批或者审批中才能作废 -->
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          background
          layout="prev, pager, next"
          :total="pager.total"
          :page-size="pager.pageSize"
          @current-change="handleCurrentChange"
        />
      </div>
      <!-- 休假申请 -->
      <el-dialog title="休假申请" v-model="showModal" width="550px" center>
        <el-form
          ref="dialogForm"
          :model="leaveForm"
          label-width="80px"
          :rules="rules"
        >
          <el-form-item label="休假类型" prop="leaveType" required>
            <el-select v-model="leaveForm.leaveType">
              <el-option label="事假" :value="1"></el-option>
              <el-option label="调休" :value="2"></el-option>
              <el-option label="年假" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="休假时间" required>
            <el-row>
              <el-col :span="8">
                <el-form-item prop="startTime" required>
                  <el-date-picker
                    v-model="leaveForm.startTime"
                    type="date"
                    placeholder="选择开始日期"
                    @change="(val) => handleDateChange('startTime', val)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="1" style="text-align: center">-</el-col>
              <el-col :span="8">
                <el-form-item prop="endTime" required>
                  <el-date-picker
                    v-model="leaveForm.endTime"
                    type="date"
                    placeholder="选择结束日期"
                    @change="(val) => handleDateChange('endTime', val)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="休假时长" required>
            {{ leaveForm.leaveTime }}
          </el-form-item>
          <el-form-item label="休假原因" prop="reasons">
            <el-input
              type="textarea"
              :rows="5"
              placeholder="请输入休假原因"
              v-model="leaveForm.reasons"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
          </span>
        </template>
      </el-dialog>
      <el-dialog
        title="申请休假详情"
        width="600px"
        v-model="showDetailModal"
        destroy-on-close
        center
      >
        <el-steps
          :active="detail.applyStatus > 2 ? 3 : detail.applyStatus"
          align-center
        >
          <el-step title="待审批"></el-step>
          <el-step title="审批中"></el-step>
          <el-step title="审批通过/审批拒绝"></el-step>
        </el-steps>
        <el-form label-width="130px" label-suffix=":">
          <el-form-item label="休假类型">
            <div>{{ detail.leaveTypeName }}</div>
          </el-form-item>
          <el-form-item label="休假时间">
            <div>{{ detail.time }}</div>
          </el-form-item>
          <el-form-item label="休假时长">
            <div>{{ detail.leaveTime }}</div>
          </el-form-item>
          <el-form-item label="休假原因">
            <div>{{ detail.reasons }}</div>
          </el-form-item>
          <el-form-item label="审批状态">
            <div>{{ detail.applyStatusName }}</div>
          </el-form-item>
          <el-form-item label="审批人">
            <div>{{ detail.currentApprover }}</div>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped lang="less"></style>
