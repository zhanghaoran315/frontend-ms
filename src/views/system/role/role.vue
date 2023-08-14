<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils'
import request from '@/api'

// 获取Composition API 上下文对象
const { ctx } = getCurrentInstance()

const queryFrom = ref({})

const pager = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const roleList = ref([])
const menuList = ref([])

const roleForm = ref({})

const showModal = ref(false)
const showPermission = ref(false)
const curRoleId = ref('')
const curRoleName = ref('')

const elTreeRef = ref()

const permissionMap = ref({})

// 定义用户操作行为
const action = ref('create')

const getPermissionMap = (menuList) => {
  const actionMap = {}
  const deep = (list) => {
    while (list.length) {
      const item = list.pop()
      if (item.children && !item.action) {
        deep(item.children)
      } else if (item.children && item.action) {
        actionMap[item._id] = item.menuName
      }
    }
  }
  deep(JSON.parse(JSON.stringify(menuList)))
  permissionMap.value = actionMap
}

const getRoleList = () => {
  const params = { ...queryFrom.value, ...pager }
  request.getRoleList(params).then((res) => {
    roleList.value = res.list
    pager.total = res.page.total
  })
}
const getMenuList = () => {
  request.getMenuList().then((res) => {
    // console.log('菜单列表', res)
    menuList.value = res
    getPermissionMap(res)
  })
}

onMounted(() => {
  getRoleList()
  getMenuList()
})

const handleReset = (form) => {
  ctx.$refs[form].resetFields()
  // 使用这个重置，得定义 model 和 prop 属性
  getRoleList()
}

const handleCreate = () => {
  action.value = 'create'
  showModal.value = true
}

const handleEdit = (row) => {
  action.value = 'edit'
  showModal.value = true
  // Object.assign(roleForm.value, row)
  nextTick(() => {
    Object.assign(roleForm.value, row)
  })
}

const handlePermission = (row) => {
  curRoleId.value = row._id
  curRoleName.value = row.roleName
  showPermission.value = true
  // 回显的时候直接row解构出 checkedKeys (保存的时候得保证这个一定是最下面的一级)
  // 所有选中的 按钮节点 此时亲节点会自动变成半选状态
  const { checkedKeys } = row.permissionList
  nextTick(() => {
    elTreeRef.value.setCheckedKeys(checkedKeys)
  })
}

const handlePermissionSubmit = async () => {
  // 不传参数，返回当前全选状态的节点
  const nodes = elTreeRef.value.getCheckedNodes()
  const halfCheckedKeys = elTreeRef.value.getHalfCheckedKeys()
  const checkedKeys = []
  const parentKeys = []
  nodes.forEach((node) => {
    if (!node.children) {
      // 按钮
      checkedKeys.push(node._id)
    } else {
      // 二级菜单也当成半选，要不然如果当成 checkedKeys 当二级菜单下新增了一个按钮
      // 设置checkedKeys选中时，会默认选中新的按钮，但是如果通过工具函数去删选最下层的节点就不会有这个问题
      parentKeys.push(node._id)
    }
  })
  const params = {
    _id: curRoleId.value,
    permissionList: {
      checkedKeys,
      halfCheckedKeys: parentKeys.concat(halfCheckedKeys)
    }
  }

  await request.updatePermission(params)
  showPermission.value = false
  ElMessage.success('设置成功')
  getRoleList()
}

const handleClose = () => {
  showModal.value = false
  handleReset('dialogForm')
}

const handleSubmit = () => {
  ctx.$refs.dialogForm.validate(async (valid) => {
    if (valid) {
      const params = { ...roleForm.value }
      params.action = action.value

      console.log(params)
      await request.roleOperate(params)
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
  await request.roleOperate(params)
  ElMessage.success('删除成功！')
  getRoleList()
}

const handleCurrentChange = (currentPage) => {
  pager.pageNum = currentPage
  getRoleList()
}

const columns = computed(() => [
  {
    label: '角色名称',
    prop: 'roleName',
    width: 150
  },
  {
    label: '备注',
    prop: 'remark'
  },
  {
    label: '权限列表',
    prop: 'permissionList',
    formatter(row, column, value) {
      const names = []
      const list = value.halfCheckedKeys || []
      list.forEach((key) => {
        const name = permissionMap.value[key]
        if (key && name) names.push(name)
      })
      return names.join(',')
    }
  },
  {
    label: '创建时间',
    prop: 'createTime',
    formatter(row, column, value) {
      return formatDate(value)
    }
  }
])

// 定义表单校验规则
const rules = {
  roleName: [
    {
      required: true,
      message: '请输入角色名称',
      trigger: 'blur'
    }
  ]
}
</script>

<template>
  <div class="role">
    <div class="query-form">
      <el-form ref="form" :inline="true" :model="queryFrom">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryFrom.roleName" placeholder="角色名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getRoleList">查询</el-button>
          <el-button @click="handleReset('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增</el-button>
      </div>
      <el-table :data="roleList" border>
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
            <el-button type="primary" link @click="handlePermission(row)"
              >配置权限</el-button
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
      <el-pagination
        class="pagination"
        :page-size="pager.pageSize"
        layout="total, prev, pager, next"
        :total="pager.total"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 新增/编辑 -->
    <el-dialog title="新增/编辑" v-model="showModal" width="30%" center>
      <el-form
        ref="dialogForm"
        :model="roleForm"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="roleForm.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 配置权限 -->
    <el-dialog title="权限设置" v-model="showPermission">
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          {{ curRoleName }}
        </el-form-item>
        <el-form-item label="选择权限">
          <el-tree
            ref="elTreeRef"
            :data="menuList"
            show-checkbox
            node-key="_id"
            :props="{ label: 'menuName' }"
          >
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermission = false">取 消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.role {
  height: 100%;
}
</style>
