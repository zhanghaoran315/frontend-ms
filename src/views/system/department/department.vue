<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils'
import request from '@/api'

// 获取Composition API 上下文对象
const { ctx } = getCurrentInstance()

const queryFrom = ref({})

const departmentList = ref([])
const userList = ref([])

const departmentForm = ref({
  parentId: []
})

const showModal = ref(false)

// 定义用户操作行为
const action = ref('create')

const getDepartmentList = () => {
  const params = { ...queryFrom.value }
  request.getDepartmentList(params).then((res) => {
    departmentList.value = res
    // pager.total = res.page.total
  })
}

const getAllUserList = () => {
  request.getAllUserList().then((res) => {
    userList.value = res
  })
}

onMounted(() => {
  getDepartmentList()
  getAllUserList()
})

const handleReset = (form) => {
  ctx.$refs[form].resetFields()
  // 使用这个重置，得定义 model 和 prop 属性
  getDepartmentList()
}

const handleCreate = () => {
  action.value = 'create'
  showModal.value = true
}

const handleEdit = (row) => {
  action.value = 'edit'
  showModal.value = true
  nextTick(() => {
    Object.assign(departmentForm.value, row, {
      user: `${row.userId}/${row.userName}/${row.userEmail}`
    })
  })
}

const handleClose = () => {
  showModal.value = false
  handleReset('dialogForm')
}

const handleSubmit = () => {
  ctx.$refs.dialogForm.validate(async (valid) => {
    if (valid) {
      const params = { ...departmentForm.value }
      params.action = action.value

      await request.departmentOperate(params)
      showModal.value = false
      ElMessage.success('操作成功')
      handleReset('dialogForm')
    }
  })
}

// 删除的时候需要将下面的子菜单全部删除
// 这个服务端会处理
const handleDel = async (row) => {
  const params = { _id: row._id, action: 'delete' }
  await request.departmentOperate(params)
  ElMessage.success('删除成功！')
  getDepartmentList()
}

const handleUser = (val) => {
  console.log('=>', val)
  const [userId, userName, userEmail] = val.split('/')
  Object.assign(departmentForm.value, { userId, userName, userEmail })
}

const columns = [
  {
    label: '部门名称',
    prop: 'departmentName',
    width: 150
  },
  {
    label: '负责人',
    prop: 'userName'
  },
  {
    label: '创建时间',
    prop: 'createTime',
    formatter(row, column, value) {
      return formatDate(value)
    }
  },
  {
    label: '更新时间',
    prop: 'updateTime',
    formatter(row, column, value) {
      return formatDate(value)
    }
  }
]

// 定义表单校验规则
const rules = {
  departmentName: [
    {
      required: true,
      message: '请输入部门名称',
      trigger: 'blur'
    }
  ],
  user: [
    {
      required: true,
      message: '请选择负责人',
      trigger: 'blur'
    }
  ]
}
</script>

<template>
  <div class="department">
    <div class="query-form">
      <el-form ref="formRef" :inline="true" :model="queryFrom">
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="queryFrom.departmentName" placeholder="部门名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getDepartmentList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增</el-button>
      </div>
      <el-table
        :data="departmentList"
        border
        row-key="_id"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column
          v-for="item in columns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :formatter="item.formatter"
        >
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="{ row }">
            <el-button type="primary" link @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button type="danger" link @click="handleDel(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增/编辑 -->
    <el-dialog
      :title="action == 'create' ? '创建部门' : '编辑部门'"
      v-model="showModal"
      width="30%"
    >
      <el-form
        ref="dialogForm"
        :model="departmentForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-cascader
            placeholder="请选择上级部门"
            v-model="departmentForm.parentId"
            :props="{
              checkStrictly: true,
              value: '_id',
              label: 'departmentName'
            }"
            clearable
            :options="departmentList"
            :show-all-levels="true"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-input
            placeholder="请输入部门名称"
            v-model="departmentForm.departmentName"
          ></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="user">
          <el-select
            placeholder="请选择部门负责人"
            v-model="departmentForm.user"
            @change="handleUser"
          >
            <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.userName"
              :value="`${item.userId}/${item.userName}/${item.userEmail}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人邮箱" prop="userEmail">
          <el-input
            placeholder="请输入负责人邮箱"
            v-model="departmentForm.userEmail"
            disabled
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button @click="handleSubmit" type="primary">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less"></style>
