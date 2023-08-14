<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils'

import request from '@/api'

// 获取Composition API 上下文对象
const { ctx } = getCurrentInstance()

const queryFrom = ref({})

const menuList = ref([])

const menuForm = ref({
  parentId: [],
  menuType: 1,
  menuState: 1
})

const showModal = ref(false)

// 定义用户操作行为
const action = ref('add')

const getMenuList = () => {
  const params = { ...queryFrom.value }
  request.getMenuList(params).then((res) => {
    // console.log('菜单列表', res)
    menuList.value = res
  })
}

onMounted(() => {
  getMenuList()
})

const handleReset = (form) => {
  ctx.$refs[form].resetFields()
  // 使用这个重置，得定义 model 和 prop 属性
  getMenuList()
}

const handleCreate = (type, row) => {
  action.value = 'add'
  showModal.value = true
  if (type == 2) {
    menuForm.value.parentId = [...row.parentId, row._id].filter((item) => item)
    // id 必须是有值的才行，排除 null 的情况
  }
}

const handleEdit = (row) => {
  action.value = 'edit'
  showModal.value = true
  // Object.assign(menuForm.value, row)
  nextTick(() => {
    Object.assign(menuForm.value, row)
  })
}

const handleClose = () => {
  showModal.value = false
  handleReset('dialogForm')
}

const handleSubmit = () => {
  ctx.$refs.dialogForm.validate(async (valid) => {
    if (valid) {
      const params = { ...menuForm.value }
      params.action = action.value

      console.log(params)
      await request.menuSubmit(params)
      showModal.value = false
      ElMessage.success('操作成功')
      handleReset('dialogForm')
      getMenuList()
    }
  })
}

// 删除的时候需要将下面的子菜单全部删除
// 这个服务端会处理
const handleDel = async (row) => {
  const params = { _id: row._id, action: 'delete' }
  await request.menuSubmit(params)
  ElMessage.success('删除成功！')
  getMenuList()
}

const columns = [
  {
    label: '菜单名称',
    prop: 'menuName',
    width: 150
  },
  {
    label: '图标',
    prop: 'icon'
  },
  {
    label: '菜单类型',
    prop: 'menuType',
    formatter(row, column, value) {
      return {
        1: '菜单',
        2: '按钮'
      }[value]
    }
  },
  {
    label: '权限标识',
    prop: 'menuCode'
  },
  {
    label: '路由地址',
    prop: 'path'
  },
  {
    label: '组件路径',
    prop: 'component'
  },
  {
    label: '菜单状态',
    prop: 'menuState',
    width: 90,
    formatter(row, column, value) {
      return {
        1: '正常',
        2: '停用'
      }[value]
    }
  },
  {
    label: '创建时间',
    prop: 'createTime',
    formatter(row, column, value) {
      return formatDate(value)
    }
  }
]

// 定义表单校验规则
const rules = {
  menuName: [
    {
      required: true,
      message: '请输入菜单名称',
      trigger: 'blur'
    },
    {
      min: 2,
      max: 10,
      message: '长度在2-8个字符',
      trigger: 'blur'
    }
  ]
}
</script>

<template>
  <div class="user">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryFrom">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="queryFrom.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState">
          <el-select v-model="queryFrom.menuState">
            <el-option :value="1" label="正常"></el-option>
            <el-option :value="2" label="停用"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getMenuList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate(1)">新增</el-button>
      </div>
      <el-table
        :data="menuList"
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
            <el-button type="primary" link @click="handleCreate(2, row)"
              >新增</el-button
            >
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
    <!--  -->
    <el-dialog title="新增" v-model="showModal" width="40%" center>
      <el-form
        ref="dialogForm"
        :model="menuForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="父级菜单" prop="parentId">
          <el-cascader
            v-model="menuForm.parentId"
            :options="menuList"
            :props="{ checkStrictly: true, value: '_id', label: 'menuName' }"
            clearable
          ></el-cascader>
          <span>不选，则直接创建一级菜单</span>
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="menuForm.menuType">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="menuForm.menuType == 1 ? '菜单名称' : '按钮名称'"
          prop="menuName"
        >
          <el-input v-model="menuForm.menuName" />
        </el-form-item>
        <el-form-item
          label="菜单图标"
          prop="icon"
          v-show="menuForm.menuType == 1"
        >
          <el-input v-model="menuForm.icon" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="menuForm.path" />
        </el-form-item>
        <el-form-item
          label="权限标识"
          prop="menuCode"
          v-show="menuForm.menuType == 2"
        >
          <el-input v-model="menuForm.menuCode" />
        </el-form-item>
        <el-form-item
          label="组件路径"
          prop="component"
          v-show="menuForm.menuType == 1"
        >
          <el-input v-model="menuForm.component" />
        </el-form-item>
        <el-form-item
          label="菜单状态"
          prop="menuState"
          v-show="menuForm.menuType == 1"
        >
          <el-radio-group v-model="menuForm.menuState">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">停用</el-radio>
          </el-radio-group>
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
