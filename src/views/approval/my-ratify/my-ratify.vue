<script setup>
import { reactive, getCurrentInstance, ref, onMounted, nextTick } from 'vue'
import { formatDate } from '@/utils'
import request from '@/api'
import { ElMessage } from 'element-plus'
import { useSystemStore } from '@/stores'
import { storeToRefs } from 'pinia'

const { userInfo } = storeToRefs(useSystemStore())

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

const approveForm = ref({
  remark: ''
})

const getRatifyList = async () => {
  const params = { ...queryForm.value, ...pager }
  const { list, page } = await request.getRatifyList(params)
  leaveList.value = list
  pager.total = page.total
}

// 初始化接口调用
onMounted(() => {
  getRatifyList()
})

// create:创建
// delete:作废
const showDetailModal = ref(false)
const detail = ref({})

// 重置查询表单
const handleReset = (form) => {
  ctx.$refs[form].resetFields()
}

// 弹框关闭
const handleClose = () => {
  showDetailModal.value = false
  handleReset('dialogForm')
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

const handleApprove = (action) => {
  ctx.$refs.dialogForm.validate(async (valid) => {
    if (valid) {
      const params = {
        action,
        remark: approveForm.value.remark,
        _id: detail.value._id
      }
      console.log('params: ', params)
      await request.leaveApprove(params)
      handleClose()
      ElMessage.success('处理成功')
      getRatifyList()
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
    label: '申请人',
    prop: '',
    formatter(row) {
      return row.applyUser.userName
    }
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
    width: 160,
    formatter: (row, column, value) => {
      return formatDate(value)
    }
  },
  {
    label: '审批人',
    prop: 'approvers'
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
  remark: [
    {
      required: true,
      message: '请输入审核备注',
      trigger: 'change'
    }
  ]
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
            <el-button type="primary" @click="getRatifyList">查询</el-button>
            <el-button @click="handleReset('form')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="base-table">
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
              <el-button
                @click="handleDetail(row)"
                v-if="
                  row.currentApprover == userInfo.userName &&
                  (row.applyStatus == 1 || row.applyStatus == 2)
                "
                >审批</el-button
              >
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
      <!-- 审批 -->
      <el-dialog
        title="审批"
        width="600px"
        v-model="showDetailModal"
        destroy-on-close
        center
      >
        <el-form
          ref="dialogForm"
          label-width="130px"
          label-suffix=":"
          :rules="rules"
          :model="approveForm"
        >
          <el-form-item label="申请人">
            <div>{{ detail.applyUser.userName }}</div>
          </el-form-item>
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
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              :rows="3"
              placeholder="请输入审核备注"
              v-model="approveForm.remark"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button size="default" @click="handleApprove('pass')"
              >审核通过</el-button
            >
            <el-button
              size="default"
              @click="handleApprove('refuse')"
              type="primary"
              >驳回</el-button
            >
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped lang="less">
.dialog-footer {
  margin-top: -30px;
}
</style>
