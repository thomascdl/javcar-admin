<template>
  <div class="app-container">
    <el-backtop
      target=".app-main"
      :bottom="100"
      style="background-color: #67c23a;box-shadow: 0 0 10px rgba(0,0,0, .30);"
    >
      <div
        style="{
        border-radius: 50%;
        height: 100%;
        width: 100%;
        text-align: center;
        line-height: 40px;
        color: white;
      }"
      >
        UP
      </div>
    </el-backtop>
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="Search"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.isReverse" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        Add
      </el-button>
    </div>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      class="my-page"
      @pagination="getList"
    />
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="60"
        :class-name="getSortClass()"
      >
        <template slot-scope="row">
          <span>{{ getIndex(row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="名字" width="110px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="图片" align="center" width="120">
        <template slot-scope="{row}">
          <el-image
            style="width: 100px; height: 100px"
            :src="row.img"
            @click.native="fixBug()"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>

    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="handleClose">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 60%; margin-left:20%"
      >
        <el-form-item label="名字" prop="name">
          <el-input v-model="temp.name" :disabled="dialogStatus==='update'" />
        </el-form-item>

        <el-form-item label="有码">
          <el-switch
            v-model="temp.isCensored"
            active-text="有码"
            inactive-text="无码"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>

        <el-form-item v-if="dialogStatus==='create'" ref="imgItem" label="头像">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="fakeAction"
            :limit="1"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            :http-request="uploadSectionFile"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip" style="color: red">仅支持 JPG / GIF / PNG 格式,且不超过4M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel()">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateActor, deleteActor, createActor } from '@/api/actor'
import { uploadActorImg, deleteActorImg } from '@/api/actorimg'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'Actor',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      sortBy: null,
      error: {},
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        orderBy: 'id',
        isReverse: false
      },
      sortOptions: [{ label: 'ID Ascending', key: false }, { label: 'ID Descending', key: true }],
      temp: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'blur' }]
      },
      actorImgObj: null,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.resetTemp()
  },
  methods: {
    fixBug() {
      document.body.style.overflow = ''
    },
    toArray(data) {
      return [data]
    },
    getIndex(row) {
      return (this.listQuery.page - 1) * this.listQuery.limit + row.$index + 1
    },
    resetTemp() {
      this.temp = {
        name: null,
        img: null,
        isCensored: true
      }
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        for (const each of this.list) {
          each['isCensored'] = each['isCensored'] === '1'
        }
        this.total = response.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch(e => {
        this.listLoading = false
        console.log(e)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      this.sortBy = order
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      this.listQuery.isReverse = order === 'descending'
      this.handleFilter()
    },
    getSortClass() {
      if (this.sortBy === null) {
        return null
      }
      return this.sortBy === false ? 'ascending' : 'descending'
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.$refs['upload'].clearFiles()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createActor(this.temp).then((res) => {
            if (res.code !== 20000) {
              this.$notify({
                title: 'Fail',
                message: 'Created Fail',
                type: 'warning',
                duration: 3000
              })
            } else {
              this.list.push(res.data)
              this.total++
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateActor(tempData).then((res) => {
            if (res.code !== 20000) {
              this.$notify({
                title: 'Fail',
                message: 'Update Fail',
                type: 'warning',
                duration: 3000
              })
            } else {
              const index = this.list.findIndex(v => v.id === this.temp.id)
              this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            }
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm(`确定移除 ${row.name} ？`).then(() => {
        deleteActor(row).then((res) => {
          if (res.code !== 20000) {
            this.$notify({
              title: 'Fail',
              message: 'Delete Fail',
              type: 'warning',
              duration: 2000
            })
          } else {
            this.list.splice(index, 1)
            this.total--
            this.$notify({
              title: 'Success',
              message: 'Delete Successfully',
              type: 'success',
              duration: 2000
            })
          }
        })
      })
    },
    handleExceed() {
      this.$message.warning(`当前限制选择 1 个文件`)
    },
    beforeUpload(file) {
      const imgFormat = ['image/jpeg', 'image/gif', 'image/png']
      const isImage = imgFormat.includes(file.type)
      // console.log(file.type);
      const isLt2M = file.size / 1024 / 1024 < 4
      if (!isImage) {
        this.$message.error('上传头像图片只能是 JPG,GIF,PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 4MB!')
      }
      return isImage && isLt2M
    },
    uploadSectionFile(params) {
      const file = params.file
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('actorImg', file)
      uploadActorImg(form)
        .then(res => {
          if (res.code !== 20000) {
            this.$notify({
              title: 'Fail',
              message: 'Upload Fail',
              type: 'warning',
              duration: 3000
            })
            params.onError()
          } else {
            this.actorImgObj = res.data
            this.$notify({
              title: 'Success',
              message: 'Upload Successfully',
              type: 'success',
              duration: 2000
            })
            params.onSuccess()
          }
        })
    },
    handleRemove() {
      deleteActorImg(this.actorImgObj).then(res => {
        if (res.code !== 20000) {
          this.$notify({
            title: 'Fail',
            message: 'Delete Fail',
            type: 'warning',
            duration: 3000
          })
        } else {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
        }
      })
      this.temp.img = null
      this.actorImgObj = null
    },
    handleSuccess(res, file) {
      this.temp.img = file.name
    },
    handleClose(done) {
      if (this.actorImgObj) {
        this.$message({
          showClose: true,
          message: '请先删除已上传的图片',
          type: 'warning'
        })
      } else {
        done()
      }
    },
    handleCancel() {
      if (this.actorImgObj) {
        this.$message({
          showClose: true,
          message: '请先删除已上传的图片',
          type: 'warning'
        })
      } else {
        this.dialogFormVisible = false
      }
    }
  }
}
</script>

<style scoped>
.my-page{
  margin: -20px 0 -5px 0;
}
</style>
