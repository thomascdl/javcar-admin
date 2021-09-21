<template>
  <div class="img-container">
    <MyImg
      v-for="(item,index) in imgList"
      :key="index"
      :img="item.url"
      :title="item.name"
      :img-style="imgStyle"
      :margin-style="marginStyle"
      @changeStatus="resetStatus(item)"
    />
    <p /><p /><p /><p /><p /><p /><p /><p /><p /><p />
  </div>
</template>

<script>
import MyImg from '@/components/Imglist/MyImg'
export default {
  name: 'MyImgList',
  components: { MyImg },
  props: {
    imgList: {
      type: Array,
      default: () => []
    },
    imgStyle: {
      type: String,
      default: ''
    },
    marginStyle: {
      type: String,
      default: ''
    }
  },
  methods: {
    resetStatus(item) {
      this.$emit('changeSelectList', item)
    }
  }
}
</script>

<style scoped>
.img-container{
  width:100%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.img-container p{
  width: 125px;
  margin-right: 15px;
  margin-left: 15px;
}
</style>
