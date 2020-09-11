<template>
  <div :class="[type === 'horizantal' ? 'vm-card-horizantal' : 'vm-card-vertical' , 'vm-panel']">
    <div class="card-img">
      <el-image
        :style="imgStyle"
        style="overflow: visible"
        :src="img"
        :preview-src-list="toArray(img)"
      />
      <div v-if="editable && type === 'vertical'" class="control" :style="controlStyle">
        <span class="delete">
          <i class="fa fa-trash" @click="modalDelete=true" />
        </span>
      </div>
    </div>
    <div class="card-desc panel-body">
      <h4>{{ title }}</h4>
    </div>
    <Modal
      v-model="modalDelete"
      title="Delete"
      ok-text="OK"
      cancel-text="Cancel"
      @on-ok="deleteOk"
    >
      Are you sure to delete this data?
    </Modal>
  </div>
</template>
<script>
export default {
  name: 'VmCard',
  props: {
    controlStyle: {
      type: String,
      default: ''
    },
    imgStyle: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'vertical'
    },
    editable: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Title'
    },
    img: {
      type: String,
      default: require('@/assets/img/img-1.jpg')
    }
  },
  data: function() {
    return {
      modalDelete: false
    }
  },
  methods: {
    deleteOk: function() {
      this.$emit('delete-ok')
    },
    toArray(data) {
      return [data]
    }
  }
}
</script>

<style lang="less" scoped src="@/theme/index.less"/>
<style scoped>
  .card-img {
    text-align: center;
  }

  .card-desc {
    text-align: center;
  }
  .control {
    position: absolute;
    right: 20px;
  }
</style>

