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
      <el-button v-if="multipleSelection.length !== 0" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleMultiDelete">
        批量删除
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="changeCheckStatus">
        批量操作
      </el-checkbox>
    </div>
    <el-table
      ref="tableData"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
      @cell-click="handleCellClick"
      @sort-change="sortChange"
    >
      <el-table-column
        v-if="showReviewer"
        align="center"
        type="selection"
        width="40"
      />
      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="60"
        sortable="custom"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="row">
          <span>{{ getIndex(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="番号" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" width="220">
        <template slot-scope="{row}">
          <el-image
            style="width: 200px; height: 135px"
            :src="row.url"
            :preview-src-list="toArray(row.url)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog title="上传" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item ref="imgItem" label="大封面">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="fakeAction"
            :before-upload="beforeUpload"
            :file-list="fileList"
            list-type="picture"
            :auto-upload="false"
            :http-request="uploadSectionFile"
            multiple
          >
            <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClear">
          清空
        </el-button>
        <el-button @click="handleCancel">
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getbImg, uploadbImg, deletebImg } from '@/api/bimg'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'VideoTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      showReviewer: false,
      fileList: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        isReverse: false,
        orderBy: 'id',
        fh: undefined
      },
      sortOptions: [{ label: 'ID Ascending', key: false }, { label: 'ID Descending', key: true }],
      dialogFormVisible: false,
      multipleSelection: [],
      deleteIndexList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
    getSortClass: function(key) {
      const sort = this.listQuery.isReverse
      return sort === false ? 'ascending' : 'descending'
    },
    handleCellClick(row, column) {
      if ((column.label === 'ID' || column.type === 'selection') && this.showReviewer) {
        this.$refs.tableData.toggleRowSelection(row)
      }
    },
    changeCheckStatus() {
      this.tableKey = this.tableKey + 1
      this.multipleSelection = []
    },
    handleMultiDelete() {
      this.$confirm(`确定移除？`).then(() => {
        this.multipleSelection.forEach((val, index) => {
          deletebImg(val).then((res) => {
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
              this.getList()
            }
          }).catch(() => {})
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      // this.deleteIndexList = []
      // val.forEach((val, index) => {
      //   this.list.forEach((v, i) => {
      //     // id 是每一行的数据id
      //     if (val.id === v.id) {
      //       this.deleteIndexList.push(i)
      //     }
      //   })
      // })
    },
    toArray(data) {
      return [data]
    },
    getIndex(row) {
      return (this.listQuery.page - 1) * this.listQuery.limit + row.$index + 1
    },
    getList() {
      this.listLoading = true
      getbImg(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1000)
      }).catch(e => {
        this.listLoading = false
        console.log(e)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.dialogFormVisible = true
    },
    // handleDeleteNoWarning(row, index) {
    //   deletebImg(row).then((res) => {
    //     if (res.code !== 20000) {
    //       this.$notify({
    //         title: 'Fail',
    //         message: 'Delete Fail',
    //         type: 'warning',
    //         duration: 5000
    //       })
    //     } else {
    //       this.list.splice(index, 1)
    //       this.total--
    //       this.$notify({
    //         title: 'Success',
    //         message: 'Delete Successfully',
    //         type: 'success',
    //         duration: 3000
    //       })
    //     }
    //   }).catch(() => {})
    // },
    handleDelete(row, index) {
      this.$confirm(`确定移除 ${row.name} ？`).then(() => {
        deletebImg(row).then((res) => {
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
      }).catch(() => {})
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
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleClear() {
      this.$refs['upload'].clearFiles()
    },
    handleCancel() {
      this.handleClear()
      this.dialogFormVisible = false
    },
    uploadSectionFile(params) {
      const file = params.file
      // 根据后台需求数据格式
      const form = new FormData()
      // 文件对象
      form.append('bimg', file)
      uploadbImg(form)
        .then(res => {
          if (res.code !== 20000) {
            this.$notify({
              title: 'Fail',
              message: res.error,
              type: 'warning',
              duration: 3000
            })
            params.onError()
          } else {
            this.total++
            this.$notify({
              title: 'Success',
              message: 'Upload Successfully',
              type: 'success',
              duration: 2000
            })
            params.onSuccess()
            this.getList()
          }
        }).catch(() => {})
    }
  }
}
</script>
