<template>
  <div class="app-container">
    <el-steps :active="active" align-center style="margin-bottom: 20px">
      <el-step title="获取影片信息" />
      <el-step title="获取演员,图片" />
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
        <el-form-item label="番号" :error="error.fh" prop="fh">
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
      <el-form id="selectForm" ref="checkForm" v-loading="listLoading" :model="checkInfo" size="small" label-position="right" label-width="120px" style="width: 300px; margin:0 auto">
        <el-form-item v-for="(value, key, index) in checkInfo" :key="index" :label="getLabel(key)" style="margin-bottom: 15px">
          <svg-icon v-if="value" style="font-size: 18px;position: relative;top:1px" icon-class="sure" />
          <svg-icon v-else style="font-size: 18px;position: relative;top:1px" icon-class="notok" />
          <el-button v-if="!value" type="success" size="mini" style="margin-left: 10px ; padding: 4px 6px" @click="handleGetImgOrActor(key)">
            获取
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-if="active === 2">
      <el-form ref="detailForm" v-loading="listLoading" :rules="detailRules" :model="detail" label-position="right" label-width="80px" style="width: 500px; margin:0 auto;">
        <el-form-item label="导演" prop="director">
          <el-input v-model="detail.director" />
        </el-form-item>
        <el-form-item label="制作商" prop="maker">
          <el-input v-model="detail.maker" />
        </el-form-item>
        <el-form-item label="大小" prop="size">
          <el-input v-model.number="detail.size" />
        </el-form-item>
        <el-form-item label="出版日" prop="release_date">
          <el-date-picker v-model="detail.release_date" placeholder="Please pick a date" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="系列" prop="series">
          <el-input v-model="detail.series" type="textarea" />
        </el-form-item>
      </el-form>
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
import { fetchVideo, checkVideo, getImgOrActor, getSize, createVideo } from '@/api/fetch'
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
      listLoading: false,
      listQuery: {
        fh: undefined
      },
      video: {},
      detail: {},
      rules: {
        title: [{ required: true, message: 'title is required', trigger: 'blur' }],
        fh: [{ required: true, message: 'fh is required', trigger: 'blur' }],
        length: [
          { required: true, message: 'length is required', trigger: 'blur' },
          { type: 'number', message: '必须是数字' },
          { type: 'number', min: 0, message: '不能小于0' }
        ],
        genre: [{ required: true, message: 'genre is required', trigger: 'blur' }],
        url: [{ required: true, message: 'url is required', trigger: 'blur' }]
      },
      detailRules: {
        size: [
          { required: true, message: 'size is required', trigger: 'blur' },
          { type: 'number', message: '必须是数字' },
          { type: 'number', min: 0, message: '不能小于0' }
        ],
        release_date: [{ required: true, message: 'date is required', trigger: 'change' }],
        maker: [{ required: true, message: 'maker is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.resetVideo()
    this.resetDetail()
  },
  methods: {
    getLabel(key) {
      if (key === 'simg') {
        return '小图'
      } else if (key === 'bimg') {
        return '大图'
      } else {
        return key
      }
    },
    handleGetImgOrActor(key) {
      this.listLoading = true
      const temp = {
        fh: this.video.fh,
        key: key,
        simg: this.video.smallimg,
        bimg: this.video.bigimg,
        actorimg: this.video.actorimg[key]
      }
      getImgOrActor(temp).then(response => {
        if (response.code === 20000) {
          this.checkInfo = Object.assign(this.checkInfo, response.data)
        } else {
          this.$notify({
            title: 'Fail',
            message: 'Check Fail',
            type: 'warning',
            duration: 3000
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch(e => {
        this.listLoading = false
        console.log(e)
      })
    },
    handleCheck() {
      this.listLoading = true
      checkVideo({ avers: this.video.avers, fh: this.video.fh }).then(response => {
        if (response.code === 20000) {
          this.checkInfo = response.data
        } else {
          this.$notify({
            title: 'Fail',
            message: 'Check Fail',
            type: 'warning',
            duration: 3000
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch(e => {
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
        for (const item in this.checkInfo) {
          if (!this.checkInfo[item]) {
            this.$notify({
              title: 'warning',
              message: '请完成获取！',
              type: 'warning',
              duration: 2000
            })
            return
          }
        }
        // 获取size
        this.handleGetSize()
        // 获取detail的actors
        this.detail.actors = []
        for (const key in this.checkInfo) {
          if (key !== 'simg' && key !== 'bimg') {
            this.detail.actors.push(this.checkInfo[key])
          }
        }
        if (this.active++ > 2) this.active = 0
      }
    },
    handleGetSize() {
      this.listLoading = true
      getSize({ url: this.video.url }).then(response => {
        if (response.code === 20000) {
          this.detail = Object.assign(this.detail, response.data)
        } else {
          this.$notify({
            title: 'Fail',
            message: 'get Fail',
            type: 'warning',
            duration: 2000
          })
        }
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      }).catch(e => {
        this.listLoading = false
        console.log(e)
      })
    },
    getVideoInfo() {
      this.resetVideo()
      this.listLoading = true
      fetchVideo(this.listQuery).then(response => {
        if (response.code === 20000) {
          this.video = Object.assign(this.video, response.data['video_info'])
          this.detail = Object.assign(this.detail, response.data['video_detail'])
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
      }).catch(e => {
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
    resetDetail() {
      this.detail = {
        bimg: null,
        director: '',
        maker: '',
        size: 0,
        release_date: '1970-01-01',
        series: '',
        actors: []
      }
    },
    createData() {
      this.$refs['detailForm'].validate((valid) => {
        if (valid) {
          createVideo({ video: this.video, detail: this.detail }).then((res) => {
            const video_error = res.error['video_error']
            const detail_error = res.error['detail_error']
            // const video_data = res.error['video_data']
            // const detail_data = res.error['detail_data']
            if (res.code !== 20000) {
              if (video_error !== '') {
                for (const key in video_error) {
                  video_error[key] = video_error[key][0]
                }
                this.error = video_error
                this.active = 0
              } else {
                for (const key in detail_error) {
                  detail_error[key] = detail_error[key][0]
                }
                this.error = detail_error
                this.active = 2
              }
            } else {
              this.active = 0
              this.resetVideo()
              this.resetDetail()
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

<style scoped>
  #selectForm >>> .el-form-item__label {
    font-size: 16px;
  }
</style>
