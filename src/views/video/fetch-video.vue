<template>
  <div class="app-container">
    <div class="filter-container" style="margin: 0 auto;width:315px;">
      <el-input v-model="listQuery.fh" placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Fetch
      </el-button>
    </div>

    <el-form ref="dataForm" v-loading="listLoading" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 500px; margin:0 auto;">
      <el-form-item label="番号" prop="fh">
        <el-input v-model="temp.fh" />
      </el-form-item>
      <el-form-item label="时长" :error="error.length" prop="length">
        <el-input v-model.number="temp.length" />
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
        <el-input v-model="temp.genre" type="textarea" />
      </el-form-item>
      <el-form-item label="演员" prop="avers">
        <el-input v-model="temp.avers" type="textarea" />
      </el-form-item>
      <el-form-item label="路径" :error="error.url" prop="url">
        <el-input v-model="temp.url" />
      </el-form-item>
      <el-form-item label="标题" :error="error.title" prop="title">
        <el-input v-model="temp.title" type="textarea" />
      </el-form-item>
      <el-form-item label="位置">
        <el-select v-model="temp.position" class="filter-item" placeholder="Please select">
          <el-option v-for="(v,k) in poMap" :key="k" :label="v" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item ref="imgItem" label="小封面" prop="sImg">
        <el-upload
          ref="upload"
          class="upload-demo"
          action="http://127.0.0.1:8001/back/simg/"
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

    <div slot="footer" class="dialog-footer" style="margin: 30px 250px;overflow: auto">
      <el-button type="primary" style="float:right" @click="createData()">
        Confirm
      </el-button>
    </div>
  </div>
</template>

<script>
import { createVideo } from '@/api/article'
import { fetchVideo } from '@/api/fetch'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

export default {
  name: 'FetchVideo',
  directives: { waves },

  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeTransfer(value) {
      return value === '1'
    },
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
      error: {},
      poMap: { '1': 'seagate_cdl', '2': 'seagate_zxh', '3': 'west_data_1T', '4': 'west_data_500g' },
      tableKey: 0,
      total: 0,
      listLoading: false,
      listQuery: {
        fh: undefined,
      },
      temp: {
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
      },
      rules: {
        title: [{ required: true, message: 'title is required', trigger: 'blur' }],
        fh: [{ required: true, message: 'fh is required', trigger: 'blur' }],
        length: [
          { required: true, message: 'length is required', trigger: 'blur' },
          { type: 'number', message: '必须是数字' },
          { type: 'number', min: 0, message: '不能小于0' }
        ],
        genre: [{ required: true, message: 'genre is required', trigger: 'blur' }],
        url: [{ required: true, message: 'url is required', trigger: 'blur' }],
        sImg: [{ required: true, message: 'sImg is required', trigger: 'change' }]
      },
    }
  },

  created() {

  },

  methods: {

    getVideoInfo() {
      this.listLoading = true
      fetchVideo(this.listQuery).then(response => {
        if (response.code === 20000) {
          this.videoInfo = Object.assign(this.temp, response.data)
          // this.videoInfo = response.data
        } else {
          this.$notify({
            title: 'Fail',
            message: 'Fetch Fail',
            type: 'warning',
            duration: 2000
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch( e => {
        this.listLoading = false
        console.log(e)
      })
    },
    handleFilter() {
      this.getVideoInfo()
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
          this.error = {}
          createVideo(this.temp).then((res) => {
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
      this.temp.simg = null
      this.rules.sImg[0]['required'] = true
      this.$refs.imgItem.clearValidate()
    },
    handleSuccess(res, file, fileList) {
      this.temp.simg = file.name
      this.rules.sImg[0]['required'] = false
      this.$refs.imgItem.clearValidate()
    }
  }
}
</script>
