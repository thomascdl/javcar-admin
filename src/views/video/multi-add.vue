<template>
  <div class="app-container">
    <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />

    <el-upload
      class="upload-demo"
      drag
      :before-upload="beforeImgUpload"
      action="http://127.0.0.1:8001/video/simg/"
      multiple
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将图片文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>

    <div slot="footer" class="dialog-footer">
      <el-button class="submit" type="primary" @click="submitData()">
        提交
      </el-button>
    </div>

    <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
      <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
    </el-table>

  </div>
</template>

<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { multiUpload } from '@/api/article'
export default {
  name: 'UploadExcel',
  components: { UploadExcelComponent },
  data() {
    return {
      tableData: [],
      tableHeader: [],
      imgList: []
    }
  },
  methods: {
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: 'Please do not upload files larger than 1m in size.',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      this.tableData = results
      this.tableHeader = header
    },
    beforeImgUpload(file) {
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
    submitData() {
      multiUpload(this.tableData).then((res) => {
        if (res.code !== 20000) {
          let msg = ''
          for (const key in res.error) {
            msg = key + ' : ' + res.error[key]
          }
          this.$notify({
            title: 'Error',
            message: msg,
            type: 'error',
            duration: 5000
          })
        } else {
          this.$notify({
            title: 'Success',
            message: 'Created Successfully',
            type: 'success',
            duration: 3000
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.upload-demo{
text-align: center;
position: relative;
margin: 30px auto;
width: 400px;
}

.submit{
float: right;
margin: 10px 20%;
}
</style>
