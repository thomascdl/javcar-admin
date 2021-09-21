<template>
  <div class="app-container">
    <el-backtop
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
      <el-input v-model="listQuery.fh" placeholder="Search" clearable style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        Add
      </el-button>
      <el-button v-if="selectedItem.length !== 0" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleMultiDelete">
        批量删除
      </el-button>
      <el-checkbox class="filter-item" style="margin-left:15px;" @change="changeCheckStatus">
        批量操作
      </el-checkbox>
    </div>
    <pagination v-show="total>0" :page-sizes="pageSizes" class="my-page" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <MyImgList :img-list="list" :img-width="imgWidth" :text-length="textLength" :img-style="imgSize" margin-style="margin: 0 15px 25px 15px;" @changeSelectList="changeSelectList" />
    <pagination v-show="total>0" :page-sizes="pageSizes" class="my-page" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
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
            <div slot="tip" class="el-upload__tip" style="color: red">仅支持 JPG / GIF / PNG 格式,且不超过4M</div>
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
      imgWidth: 'width: 125px',
      textLength: 6,
      pageSizes: [21, 28, 35, 49],
      showReviewer: false,
      selectedItem: [],
      imgSize: 'width: 125px; height: 125px',
      dialogFormVisible: false,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 21,
        fh: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    changeCheckStatus() {
      this.selectedItem = []
      this.$store.state.canSelect = !this.$store.state.canSelect
    },
    handleMultiDelete() {
      this.$confirm(`确定移除？`).then(() => {
        this.selectedItem.forEach((val) => {
          deleteActorImg(val).then((res) => {
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
    changeSelectList(item) {
      const index = this.selectedItem.findIndex(v => v.id === item.id)
      if (index !== -1) {
        this.selectedItem.splice(index, 1)
      } else {
        this.selectedItem.push(item)
      }
    },
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
      }).catch(() => {
        this.listLoading = false
      })
    }
    // deleteImg(data) {
    // /*  deleteActorImg(data).then((res) => {*/
    // /*    if (res.code !== 20000) {*/
    // /*      this.$notify({*/
    // /*        title: 'Fail',*/
    // /*        message: 'Delete Fail',*/
    // /*        type: 'warning',*/
    // /*        duration: 3000*/
    // /*      })*/
    // /*    } else {*/
    // /*      const index = this.list.findIndex(v => v.id === data.id)*/
    //       this.list.splice(index, 1)
    //       this.total--
    //       this.$notify({
    //         title: 'Success',
    //         message: 'Delete Successfully',
    //         type: 'success',
    //         duration: 2000
    //       })
    //     }
    //   }).catch(() => {})
    // }
  }
}
</script>
<style scoped>
.my-page{
  margin: -20px 0 -5px 0;
}
</style>
