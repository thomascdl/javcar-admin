<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.fh" placeholder="Search" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        Add
      </el-button>
    </div>
    <pagination v-show="total>0" class="my-page" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <MyImgList :img-list="list" :total="total" :img-style="imgSize" margin-style="margin: 0 15px 25px 15px;" />
    <pagination v-show="total>0" class="my-page" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog title="上传" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item ref="imgItem" label="演员头像">
          <el-upload
            ref="upload"
            class="upload-demo"
            action="fakeAction"
            :before-upload="beforeUpload"
            list-type="picture"
            :auto-upload="false"
            :http-request="uploadSectionFile"
            multiple
          >
            <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg文件，且不超过2M</div>
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
import waves from '@/directive/waves' // waves directive
import MyImgList from '@/components/Imglist/MyImgList'
import { getActorImg, uploadActorImg, deleteActorImg } from '@/api/actorimg'
import Pagination from '@/components/Pagination'
export default {
  name: 'ActorImageList',
  directives: { waves },
  components: {
    MyImgList,
    Pagination
  },
  data: function() {
    return {
      imgSize: 'width: 125px; height: 125px',
      dialogFormVisible: false,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 24,
        fh: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleCreate() {
      this.dialogFormVisible = true
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
              duration: 3000
            })
            params.onError()
          } else {
            this.list.push(res.data)
            this.total++
            this.$notify({
              title: 'Success',
              message: 'Upload Successfully',
              type: 'success',
              duration: 2000
            })
            params.onSuccess()
          }
        })
        .catch(() => {})
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
    handleCancel() {
      this.handleClear()
      this.dialogFormVisible = false
    },
    handleClear() {
      this.$refs['upload'].clearFiles()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      getActorImg(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1000)
      }).catch(e => {
        this.listLoading = false
      })
    },
    deleteImg(data) {
      deleteActorImg(data).then((res) => {
        if (res.code !== 20000) {
          this.$notify({
            title: 'Fail',
            message: 'Delete Fail',
            type: 'warning',
            duration: 3000
          })
        } else {
          const index = this.list.findIndex(v => v.id === data.id)
          this.list.splice(index, 1)
          this.total--
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
        }
      }).catch(() => {})
    }
  }
}
</script>
<style scoped>
.my-page{
  margin: -20px 0 -5px 0;
}
</style>
