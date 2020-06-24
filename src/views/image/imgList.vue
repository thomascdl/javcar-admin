<template>
  <div class="my-container">
    <VmImageList :data="list" :total="total" class="vm-margin" @get-data="getList" @create="handleCreate"
                 @delete-ok="deleteImg"/>
    <el-dialog title="上传" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item ref="imgItem" label="小封面" prop="sImg">
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
  import VmImageList from '@/components/Imglist/vm-image-list'
  import {getsImg, uploadsImg, deletesImg} from '@/api/simg'

  export default {
    name: 'ImageList',
    components: {
      VmImageList
    },
    data: function () {
      return {
        dialogFormVisible: false,
        list: [],
        total: null,
        listQuery: {
          page: 1,
          limit: 24,
          fh: undefined
        }
      }
    },
    created() {
      this.getList(this.listQuery)
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
        form.append('simg', file)
        uploadsImg(form)
          .then(res => {
            if (res.code !== 20000) {
              this.$notify({
                title: 'Fail',
                message: 'Upload Fail',
                type: 'warning',
                duration: 5000
              })
              params.onError()
            } else {
              this.total++
              this.$notify({
                title: 'Success',
                message: 'Upload Successfully',
                type: 'success',
                duration: 3000
              })
              params.onSuccess()
            }
          })
          .catch(() => {
          })
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
      getList(data) {
        getsImg(data).then(response => {
          this.list = response.data
          this.total = response.count
        }).catch(e => {
          console.log(e)
        })
      },
      deleteImg(data) {
        deletesImg(data).then((res) => {
          if (res.code !== 20000) {
            this.$notify({
              title: 'Fail',
              message: 'Delete Fail',
              type: 'warning',
              duration: 5000
            })
          } else {
            for (let i = 0; i < this.list.length; i++) {
              if (this.list[i].id === data.id) {
                this.list.splice(i, 1)
              }
            }
            this.total--
            this.$notify({
              title: 'Success',
              message: 'Delete Successfully',
              type: 'success',
              duration: 3000
            })
          }
        }).catch(() => {
        })
      }
    }
  }
</script>

