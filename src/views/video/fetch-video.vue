<template>
  <div class="app-container">
    <el-steps :active="active" align-center style="margin-bottom: 20px">
      <el-step title="获取影片信息" />
      <el-step title="获取演员信息" />
      <el-step title="获取影片详情" />
    </el-steps>
    <div v-if="active === 0">
      <div class="filter-container" style="margin: 0 auto;width:315px;">
        <el-input v-model="listQuery.fh" placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          Fetch
        </el-button>
      </div>
      <el-form ref="dataForm" v-loading="listLoading" :rules="rules" :model="video" label-position="right" label-width="80px" style="width: 500px; margin:0 auto;">
        <el-form-item label="番号" prop="fh">
          <el-input v-model="video.fh" />
        </el-form-item>
        <el-form-item label="时长" :error="error.length" prop="length">
          <el-input v-model.number="video.length" />
        </el-form-item>
        <el-form-item label="有码">
          <el-switch
            v-model="video.isCensored"
            active-text="有码"
            inactive-text="无码"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="字幕">
          <el-switch
            v-model="video.hasSubtitle"
            active-text="无字幕"
            inactive-text="字幕"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="高清">
          <el-switch
            v-model="video.isHD"
            active-text="非高清"
            inactive-text="高清"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="类别" prop="genre">
          <el-input v-model="video.genre" type="textarea" />
        </el-form-item>
        <el-form-item label="演员" prop="avers">
          <el-input v-model="video.avers" type="textarea" />
        </el-form-item>
        <el-form-item label="路径" :error="error.url" prop="url">
          <el-input v-model="video.url" />
        </el-form-item>
        <el-form-item label="标题" :error="error.title" prop="title">
          <el-input v-model="video.title" type="textarea" />
        </el-form-item>
        <el-form-item label="位置">
          <el-select v-model="video.position" class="filter-item" placeholder="Please select">
            <el-option v-for="(v,k) in poMap" :key="k" :label="v" :value="k" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="active === 1">
      <div class="filter-container" style="margin: 0 auto;width:315px">
        <el-form ref="checkForm" v-loading="listLoading" :model="checkInfo" label-position="right" label-width="120px" style="width: 500px; margin:0 auto;">
          <el-form-item v-for="(value, key, index) in checkInfo" :key="index" :label="key">
            ：{{ value }}
            <el-button v-if="!value" type="success" size="mini" style="margin-left: 10px" @click="handleGetImgOrActor(key)">
              获取
            </el-button>
          </el-form-item>
        </el-form>

      </div>
    </div>
    <div slot="footer" class="dialog-footer" style="margin: 30px 250px;overflow: auto">
      <el-button v-if="active===1||active===2" type="primary" style="float:left" @click="prev()">
        上一步
      </el-button>
      <el-button v-if="active===0||active===1" type="primary" style="float:right" @click="next()">
        下一步
      </el-button>
      <el-button v-if="active===2" type="success" style="float:right" @click="createData()">
        提交
      </el-button>
    </div>
  </div>
</template>

<script>
import { createVideo } from '@/api/article'
import { fetchVideo, checkVideo, getImgOrActor } from '@/api/fetch'
import waves from '@/directive/waves' // waves directive


export default {
  name: 'FetchVideo',
  directives: { waves },
  data() {
    return {
      checkInfo: {},
      active: 0,
      error: {},
      poMap: { '1': 'seagate_cdl', '2': 'seagate_zxh', '3': 'west_data_1T', '4': 'west_data_500g' },
      tableKey: 0,
      listLoading: false,
      listQuery: {
        fh: undefined,
      },
      video: {
        simg: null,
        position: '1',
        isCensored: true,
        hasSubtitle: false,
        length: undefined,
        isHD: true,
        fh: '',
        url: 'J:/迅雷10/JUY-437.mp4',
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
      },
    }
  },

  methods: {
    handleGetImgOrActor(key) {
      this.listLoading = true
      getImgOrActor({ fh: this.video.fh, key: key }).then(response => {
        if (response.code === 20000) {
          this.checkInfo = Object.assign(this.checkInfo, response.data)
        } else {
          this.$notify({
            title: 'Fail',
            message: 'Check Fail',
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
    handleCheck() {
      this.listLoading = true
      checkVideo({avers: this.video.avers, fh: this.video.fh}).then(response => {
        if (response.code === 20000) {
          this.checkInfo = response.data
        } else {
          this.$notify({
            title: 'Fail',
            message: 'Check Fail',
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
    prev() {
      --this.active
      if (this.active < 0) this.active = 0
    },
    next() {
      if (this.active === 0) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (this.active++ > 2) this.active = 0
            this.handleCheck()
          }
        })
      } else if (this.active === 1) {
        if (this.active++ > 2) this.active = 0
      }
    },
    getVideoInfo() {
      this.resetVideo()
      this.listLoading = true
      fetchVideo(this.listQuery).then(response => {
        if (response.code === 20000) {
          this.video = Object.assign(this.video, response.data)
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

    resetVideo() {
      this.video = {
        simg: null,
        position: '1',
        isCensored: true,
        hasSubtitle: false,
        length: undefined,
        isHD: true,
        fh: '',
        url: 'J:/迅雷10/JUY-437.mp4',
        genre: '',
        avers: '',
        title: ''
      }
    },
    handleCreate() {
      this.resetVideo()
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
    }
  }
}
</script>
