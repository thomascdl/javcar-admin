<template>
  <div class="img-container">
    <MyImg
      v-for="(item,index) in imgList"
      :key="index"
      :img="item.url"
      :title="item.name"
      :img-style="imgStyle"
      :margin-style="marginStyle"
      :text-length="textLength"
      @changeStatus="resetStatus(item)"
    />
    <p v-for="(item,index) in ['1','2','3','4','5','6','7']" :key="'new_'+ index" :style="imgWidth" />
  </div>
</template>

<script>
import MyImg from '@/components/Imglist/MyImg'
export default {
  name: 'MyImgList',
  components: { MyImg },
  props: {
    imgWidth: {
      type: String,
      default: 'width: 125px'
    },
    textLength: {
      type: Number,
      default: 6
    },
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
  margin-right: 15px;
  margin-left: 15px;
}
</style>
