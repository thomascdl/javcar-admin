<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.fh"
        placeholder="Search"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.isReverse" style="width: 140px" class="filter-item" @change="sortChangeBySelect">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
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
        :class-name="getSortClass()"
      >
        <template slot-scope="row">
          <span>{{ getIndex(row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="番号" width="110px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.fh }}</span>
        </template>
      </el-table-column>

      <el-table-column label="出版日期" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.release_date }}</span>
        </template>
      </el-table-column>

      <el-table-column label="制作商" min-width="130px" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.maker }}</span>
        </template>
      </el-table-column>

      <el-table-column label="系列" min-width="200px" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.series }}</span>
        </template>
      </el-table-column>

      <el-table-column label="导演" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.director }}</span>
        </template>
      </el-table-column>

      <el-table-column label="大小" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.size|sizeTransfer }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
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

    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="番号" prop="video">
          <el-select
            v-model="temp.video"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading"
            disabled
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="演员" prop="actors">
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
        <el-form-item label="出版日" prop="release_date">
          <el-date-picker v-model="temp.release_date" placeholder="Please pick a date" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="系列" prop="series">
          <el-input v-model="temp.series" type="textarea" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, getFh, updateVideoDetail, deleteVideoDetail, getActor } from '@/api/video-detail'
import waves from '@/directive/waves' // waves directive
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
      sortBy: null,
      // 番号选项
      options: [],
      // 演员选项
      options2: [],
      // 控制番号，演员选项框的loading
      loading: false,
      error: {},
      poMap: { '1': 'seagate_cdl', '2': 'seagate_zxh', '3': 'west_data_1T', '4': 'west_data_500g' },
      tableKey: 0,
      list: null,
      total: 0,
      // 控制整个表格的loading
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        fh: undefined,
        orderBy: 'id',
        isReverse: false
      },
      sortOptions: [{ label: 'ID Ascending', key: false }, { label: 'ID Descending', key: true }],
      temp: {},
      dialogFormVisible: false,
      rules: {
        size: [
          { required: true, message: 'size is required', trigger: 'blur' },
          { type: 'number', message: '必须是数字' },
          { type: 'number', min: 0, message: '不能小于0' }
        ],
        maker: [{ required: true, message: 'maker is required', trigger: 'blur' }],
        release_date: [{ required: true, message: 'date is required', trigger: 'blur' }]
      }
    }
  },

  created() {
    this.getList()
    this.resetTemp()
  },

  methods: {
    // 获取番号信息
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        getFh({ fh: query }).then(res => {
          this.options = res.data
          this.$nextTick(() => {
            this.loading = false
          })
        }).catch(() => {
          this.loading = false
        })
      } else {
        this.options = []
      }
    },
    // 获取演员信息
    remoteMethodActor(query) {
      if (query !== '') {
        this.loading = true
        getActor({ name: query }).then(res => {
          this.options2 = res.data
          this.$nextTick(() => {
            this.loading = false
          })
        }).catch(() => {
          this.loading = false
        })
      } else {
        this.options2 = []
      }
    },
    getIndex(row) {
      return (this.listQuery.page - 1) * this.listQuery.limit + row.$index + 1
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(res => {
        this.list = res.data
        this.total = res.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch(() => {
        this.listLoading = false
      })
    },
    sortChangeBySelect() {
      this.sortBy = this.listQuery.isReverse === false ? 'ascending' : 'descending'
      this.handleFilter()
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
    getSortClass() {
      return this.sortBy
    }
  }
}
</script>
