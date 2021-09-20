<template>
  <div class="imgDiv" :style="marginStyle">
    <span style="height: 10px;width: 10px"><svg-icon icon-class="wxz" /></span>
    <el-image
      :style="imgStyle"
      :src="img"
      @click.native="fixBug()"
    />
    <div class="title">
      <p>{{ title }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyImg',
  props: {
    delIconStyle: {
      type: String,
      default: ''
    },
    imgStyle: {
      type: String,
      default: ''
    },
    marginStyle: {
      type: String,
      default: ''
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
  methods: {
    fixBug() {
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
  .imgDiv{
    font-size: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,.3);
  }
  .title{
    line-height: 40px;
    height: 40px;
    font-size: 15px;
    text-align: center;
    font-weight: bold;
  }
</style>
