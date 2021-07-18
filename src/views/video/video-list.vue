<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.fh" placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="60" :class-name="sortBy">
        <template slot-scope="row">
          <span>{{ getIndex(row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="番号" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.fh }}</span>
        </template>
      </el-table-column>

      <el-table-column label="标题" min-width="150px" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column label="演员" width="110px" align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.avers }}</span>
        </template>
      </el-table-column>

      <el-table-column label="播放量" align="center" width="65">
        <template slot-scope="{row}">
          <span>{{ row.plays }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
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
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="番号" prop="fh">
          <el-input v-model="temp.fh" disabled />
        </el-form-item>
        <el-form-item label="时长" prop="length">
          <el-input v-model.number="temp.length" disabled />
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
        <el-form-item label="字幕">
          <el-switch
            v-model="temp.hasSubtitle"
            active-text="无字幕"
            inactive-text="字幕"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="高清">
          <el-switch
            v-model="temp.isHD"
            active-text="非高清"
            inactive-text="高清"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="类别" prop="genre">
          <el-input v-model="temp.genre" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="演员" prop="avers">
          <el-input v-model="temp.avers" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="路径" :error="error.url" prop="url">
          <el-input v-model="temp.url" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="位置">
          <el-select v-model="temp.position" class="filter-item" placeholder="Please select">
            <el-option v-for="(v,k) in poMap" :key="k" :label="v" :value="k" />
          </el-select>
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
import { fetchList, updateVideo, deleteVideo } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'VideoTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    actorFilter(value) {
      if (value.indexOf(',') !== -1) {
        return value.split(',')[0] + '...'
      } else {
        return value
      }
    }
  },
  data() {
    return {
      sortBy: null,
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
      temp: {},
      dialogFormVisible: false,
      rules: {
        url: [{ required: true, message: 'url is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.resetTemp()
  },
  methods: {
    getIndex(row) {
      return (this.listQuery.page - 1) * this.listQuery.limit + row.$index + 1
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data
        // 对数据进行预处理
        for (const each of this.list) {
          each['isCensored'] = each['isCensored'] === '1'
          each['isHD'] = each['isHD'] === '1'
          each['hasSubtitle'] = each['hasSubtitle'] === '1'
        }
        this.total = response.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch(e => {
        console.log(e)
      })
    },
    sortChangeBySelect() {
      // this.sortBy = null
      this.sortBy = this.listQuery.isReverse === false ? 'ascending' : 'descending'
      this.handleFilter()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      // console.log(order)
      this.sortBy = order
      // console.log(order);
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
        id: undefined,
        simg: null,
        position: '1',
        isCensored: true,
        hasSubtitle: false,
        length: undefined,
        isHD: true,
        fh: '',
        url: '',
        genre: '',
        avers: '',
        title: ''
      }
    },
    // handleCreate() {
    //   this.resetTemp()
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //     this.$refs['upload'].clearFiles()
    //   })
    // },
    // createData() {
    //   this.$refs['dataForm'].validate((valid) => {
    //     if (valid) {
    //       this.error = {}
    //       createVideo(this.temp).then((res) => {
    //         if (res.code !== 20000) {
    //           for (const key in res.error) {
    //             res.error[key] = res.error[key][0]
    //           }
    //           this.error = res.error
    //         } else {
    //           this.list.unshift(res.data)
    //           this.total++
    //           this.dialogFormVisible = false
    //           this.$notify({
    //             title: 'Success',
    //             message: 'Created Successfully',
    //             type: 'success',
    //             duration: 2000
    //           })
    //         }
    //       })
    //     }
    //   })
    // },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.error = {}
          const tempData = Object.assign({}, this.temp)
          updateVideo(tempData).then((res) => {
            if (res.code !== 20000) {
              // 后端返回的错误信息
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
      this.$confirm(`确定移除 ${row.fh} ？`).then(() => {
        deleteVideo(row).then((res) => {
          if (res.code !== 20000) {
            this.$notify({
              title: 'Fail',
              message: 'Delete Fail',
              type: 'warning',
              duration: 3000
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
    }
    // getSortClass() {
    //   return this.sortBy
    // }
  }
}
</script>
