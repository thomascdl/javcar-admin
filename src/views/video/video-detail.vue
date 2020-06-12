<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.fh" placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.isReverse" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="60" :class-name="getSortClass('id')">
        <template slot-scope="row">
          <span>{{ getIndex(row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="番号" width="110px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.fh }}</span>
        </template>
      </el-table-column>

      <el-table-column label="出版日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ctime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="制作商" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.maker }}</span>
        </template>
      </el-table-column>

      <el-table-column label="系列" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.series }}</span>
        </template>
      </el-table-column>

      <el-table-column label="导演" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.director }}</span>
        </template>
      </el-table-column>

      <el-table-column label="大小" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.size|sizeTransfer }}</span>
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

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="番号" prop="video" :error="error.video">
          <el-select
            v-model="temp.video"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="演员" prop="actors" :error="error.actors">
          <el-select
            v-model="temp.actors"
            filterable
            multiple
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethodActor"
            :loading="loading"
          >
            <el-option
              v-for="item in options2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="导演" prop="director">
          <el-input v-model="temp.director" />
        </el-form-item>
        <el-form-item label="制作商" prop="maker">
          <el-input v-model="temp.maker" />
        </el-form-item>
        <el-form-item label="大小" prop="size">
          <el-input v-model.number="temp.size" />
        </el-form-item>
        <el-form-item label="出版日" prop="release_date" :error="error.release_date">
          <el-date-picker v-model="temp.release_date" placeholder="Please pick a date" value-format="yyyy-MM-dd"/>
        </el-form-item>
        <el-form-item label="系列" prop="series" :error="error.series">
          <el-input v-model="temp.series" />
        </el-form-item>

        <el-form-item v-if="dialogStatus==='create'" ref="imgItem" label="大封面" prop="bImg">
          <el-upload
            class="upload-demo"
            action="http://127.0.0.1:8001/video/bimg/"
            :on-success="handleSuccess"
            :limit="1"
            :before-upload="beforeUpload"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
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
import { fetchList, getFh, updateVideoDetail, deleteArticle, getActor, createVideoDetail } from '@/api/video-detail'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'VideoDetail',
  components: { Pagination },
  directives: { waves },

  filters: {
    sizeTransfer(value) {
      return (value / 1024 / 1024 / 1024).toFixed(2) + 'G'
    }
  },

  data() {
    return {
      options: [],
      options2: [],
      loading: false,
      error: {},
      poMap: { '1': 'seagate_cdl', '2': 'seagate_zxh', '3': 'west_data_1T', '4': 'west_data_500g' },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        fh: undefined,
        orderBy: 'id',
        isReverse: false
      },
      sortOptions: [{ label: 'ID Ascending', key: false }, { label: 'ID Descending', key: true }],
      temp: {
        bimg: null,
        director: null,
        maker: null,
        size: null,
        release_date: null,
        series: null,
        video: null,
        actors: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        video: [{ required: true, message: 'fh is required', trigger: ['blur', 'change'] }],
        // actors: [{ required: true, message: 'actors is required', trigger: ['blur', 'change'] }],
        size: [
          { required: true, message: 'size is required', trigger: 'blur' },
          { type: 'number', message: '必须是数字' },
          { type: 'number', min: 0, message: '不能小于0' }
        ],
        release_date: [{required: true, message: 'date is required', trigger: 'change' }],
        maker: [{ required: true, message: 'maker is required', trigger: 'blur' }],
        avers: [{ required: true, message: 'avers is required', trigger: 'blur' }],
        url: [{ required: true, message: 'url is required', trigger: 'blur' }],
        bImg: [{ required: true, message: 'bImg is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },

  created() {
    this.getList()
  },

  methods: {
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        getFh({ fh: query }).then(res => {
          this.options = res.data

          this.$nextTick(() => {
            this.loading = false
          })


        }).catch(() => {})

      } else {
        this.options = []
      }
    },
    remoteMethodActor(query) {
      if (query !== '') {
        this.loading = true
        getActor({ name: query }).then(res => {
          this.options2 = res.data

          this.$nextTick(() => {
            this.loading = false
          })


        }).catch(() => {})

      } else {
        this.options = []
      }
    },
    getIndex(row) {
      return (this.listQuery.page - 1) * this.listQuery.limit + row.$index + 1
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
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
      this.options = []
      this.temp = {
        bimg: null,
        director: '',
        maker: '',
        size: undefined,
        release_date: null,
        series: '',
        video: null,
        actors: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createVideoDetail(this.temp).then((res) => {
            if (res.code !== 20000) {
              for (const key in res.error) {
                res.error[key] = res.error[key][0]
              }
              this.error = res.error
            } else {
              this.list.unshift(res.data)
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
      this.temp.size = parseInt(this.temp.size)
      this.options = []
      this.options.push({ label: row.fh, value: row.video })
      if (row.actors.length !== 0) {
        this.temp.actors = []
        row.actors.forEach((val, index) => {
          this.temp.actors.push(val.id)
        })
        this.options2 = []
        row.actors.forEach((val, index) => {
          this.options2.push({ label: val.name, value: val.id })
        })
      }
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
          updateVideoDetail(tempData).then((res) => {
            if (res.code !== 20000) {
              for (const key in res.error) {
                res.error[key] = res.error[key][0]
              }
              this.error = res.error
            } else {
              const index = this.list.findIndex(v => v.id === this.temp.id)
              this.list.splice(index, 1, res.data)

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
      this.$confirm(`确定移除 ${row.fh} ？`).then(() => {
        deleteArticle(row).then((res) => {
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
      }).catch(() => {})
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
      this.temp.bimg = null
      this.rules.bImg[0]['required'] = true
      this.$refs.imgItem.clearValidate()
    },
    handleSuccess(res, file, fileList) {
      this.temp.bimg = file.name
      this.rules.bImg[0]['required'] = false
      this.$refs.imgItem.clearValidate()
    }
  }
}
</script>
