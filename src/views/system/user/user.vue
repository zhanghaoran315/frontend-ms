<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils'

import request from '@/api'

// 获取Composition API 上下文对象
const { ctx } = getCurrentInstance()

const user = ref({
  state: 1
})

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const selectedItems = ref([])

const userList = ref([])

const userForm = ref({})
const showModal = ref(false)

// 所有角色列表
const roleList = ref([])
// 所有部门列表
const deptList = ref([])
// 定义用户操作行为
const action = ref('add')

const getUserList = () => {
  const params = { ...user.value, ...pager }
  request.getUserList(params).then((res) => {
    userList.value = res.list
    pager.total = res.page.total
  })
}

const getDepartmentList = async () => {
  const result = await request.getDepartmentList()
  deptList.value = result
}

const getRoleAllList = async () => {
  const result = await request.getRoleAllList()
  roleList.value = result
}

onMounted(() => {
  getUserList()
  getDepartmentList()
  getRoleAllList()
})

const handleQuery = () => {
  getUserList()
}

const handleReset = (form) => {
  ctx.$refs[form].resetFields()
  // 使用这个重置，得定义 model 和 prop 属性
  getUserList()
}

const handleCreate = () => {
  action.value = 'add'
  showModal.value = true
}

const handleEdit = (row) => {
  action.value = 'edit'
  showModal.value = true
  nextTick(() => {
    Object.assign(userForm.value, row)
  })
}

const handleClose = () => {
  showModal.value = false
  handleReset('dialogForm')
}

const handleSubmit = () => {
  ctx.$refs.dialogForm.validate(async (valid) => {
    if (valid) {
      const params = { ...userForm.value }
      params.action = action.value
      await request.userSubmit(params)
      console.log(params)
      showModal.value = false
      ElMessage.success('操作成功')
      handleReset('dialogForm')
      getUserList()
    }
  })
}

const deleteUser = async (params) => {
  const result = await request.userDel(params)
  if (result.nModified) {
    ElMessage.success('删除成功')
    getUserList()
  } else {
    ElMessage.error('删除失败')
  }
}

const handleDel = (row) => {
  const params = { userIds: [row.userId] }
  deleteUser(params)
}

const handlePatchDel = () => {
  if (!selectedItems.value.length) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  const params = { userIds: selectedItems.value.map((item) => item.userId) }
  // console.log(params)
  deleteUser(params)
}

const handleSelectionChange = (data) => {
  selectedItems.value = data
}

const handleCurrentChange = (currentPage) => {
  pager.pageNum = currentPage
  getUserList()
}

const columns = [
  {
    label: '用户ID',
    prop: 'userId'
  },
  {
    label: '用户名',
    prop: 'userName'
  },
  {
    label: '用户邮箱',
    prop: 'userEmail',
    width: 180
  },
  {
    label: '岗位',
    prop: 'job',
    width: 180
  },
  {
    label: '用户状态',
    prop: 'state',
    formatter(row, column, value) {
      // console.log(row, column, value)
      return {
        1: '在职',
        2: '离职',
        3: '试用期'
      }[value]
    }
  },
  {
    label: '注册时间',
    prop: 'createTime',
    width: 180,
    formatter: (row, column, value) => {
      return formatDate(value)
    }
  },
  {
    label: '最后登录时间',
    prop: 'lastLoginTime',
    width: 180,
    formatter: (row, column, value) => {
      return formatDate(value)
    }
  }
]

// 定义表单校验规则
const rules = {
  userName: [
    {
      required: true,
      message: '请输入用户名称',
      trigger: 'blur'
    }
  ],
  userEmail: [{ required: true, message: '请输入用户邮箱', trigger: 'blur' }],
  mobile: [
    {
      pattern: /1[3-9]\d{9}/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  deptId: [
    {
      required: true,
      message: '请输入用户邮箱',
      trigger: 'blur'
    }
  ]
}
</script>

<template>
  <div class="user">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="user">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="user.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="user.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="user.state">
            <el-option :value="0" label="所有"></el-option>
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'user:create'"
          >新增</el-button
        >
        <el-button type="danger" @click="handlePatchDel" v-has="'user:delete'"
          >批量删除</el-button
        >
      </div>
      <el-table
        :data="userList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
              @click="handleEdit(row)"
              size="small"
              v-has="'user:update'"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="handleDel(row)"
              v-has="'user:delete'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        :page-size="pager.pageSize"
        layout="total, prev, pager, next"
        :total="pager.total"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog title="用户新增" v-model="showModal" width="30%" center>
      <el-form
        ref="dialogForm"
        :model="userForm"
        label-width="60px"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="userForm.userName"
            :disabled="action == 'edit'"
            placeholder="请输入用户名称"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input
            v-model="userForm.userEmail"
            :disabled="action == 'edit'"
            placeholder="请输入用户邮箱"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="岗位" prop="job">
          <el-input v-model="userForm.job" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select
            v-model="userForm.state"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option :value="1" label="在职"></el-option>
            <el-option :value="2" label="离职"></el-option>
            <el-option :value="3" label="试用期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色" prop="roleList">
          <el-select
            v-model="userForm.roleList"
            placeholder="请选择用户系统角色"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role._id"
              :label="role.roleName"
              :value="role._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-cascader
            v-model="userForm.deptId"
            placeholder="请选择所属部门"
            :options="deptList"
            :props="{
              checkStrictly: true,
              value: '_id',
              label: 'departmentName'
            }"
            clearable
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less"></style>
