<template>
  <div class="app-container">
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
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        Export
      </el-button>
    </div>

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
        :class-name="getSortClass('id')"
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
            :preview-src-list="toArray(row.img)"
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
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
            :on-success="handleSuccess"
            :limit="1"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            :http-request="uploadSectionFile"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg文件，且不超过2M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
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
import { uploadActorImg } from '@/api/actorimg'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Actor',
  components: { Pagination },
  directives: { waves },

  filters: {
    sizeTransfer(value) {
      return (value / 1024 / 1024 / 1024).toFixed(2) + 'G'
    }
  },

  data() {
    return {
      loading: false,
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
      temp: {
        name: null,
        img: null,
        isCensored: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        name: [{ required: true, message: 'name is required', trigger: 'blur' }]
        // img: [{ required: true, message: 'img is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },

  created() {
    this.getList()
  },

  methods: {
    toArray(data) {
      return [data]
    },
    getIndex(row) {
      return (this.listQuery.page - 1) * this.listQuery.limit + row.$index + 1
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
        }, 1000)
      }).catch(e => {
        console.log(e)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      this.listQuery.isReverse = order === 'descending'
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        name: null,
        img: null,
        isCensored: true
      }
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
              for (const key in res.error) {
                res.error[key] = res.error[key][0]
              }
              this.error = res.error
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
              for (const key in res.error) {
                res.error[key] = res.error[key][0]
              }
              this.error = res.error
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
      }).catch(() => {
      })
    },

    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['fh', 'title', 'avers', 'genre', 'plays']
          const filterVal = ['fh', 'title', 'avers', 'genre', 'plays']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'video-list'
          })
          this.downloadLoading = false
        })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.isReverse
      return sort === false ? 'ascending' : 'descending'
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件`)
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handleRemove(file, fileList) {
      this.temp.img = null
      // this.rules.img[0]['required'] = true
      // this.$refs.imgItem.clearValidate()
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
              message: res.error,
              type: 'warning',
              duration: 5000
            })
            params.onError()
          } else {
            this.$notify({
              title: 'Success',
              message: 'Upload Successfully',
              type: 'success',
              duration: 3000
            })
            params.onSuccess()
          }
        })
        .catch(() => {
        })
    },
    handleSuccess(res, file, fileList) {
      this.temp.img = file.name
    }
  }
}
</script>
