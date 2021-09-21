<template>
  <div class="actor-div" :style="marginStyle" :class="{'selected':selected}">
    <div class="imgDiv" @click="changeSelect()">
      <svg-icon v-if="selected && canSelect" icon-class="xz" class="xz" />
      <svg-icon v-if="!selected && canSelect" icon-class="wxz" class="xz" />
      <div :class="{'mask':selected}" />
      <el-image
        :style="imgStyle"
        :src="img"
        @click.native="fixBug()"
      />
    </div>
    <div class="title">
      <el-tooltip
        effect="dark"
        :disabled="title.length < 6"
        :content="title"
        placement="bottom-end"
      >
        <p>{{ title | ellipsis}}</p>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyImg',
  props: {
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
  data: function() {
    return {
      disabled: true,
      selected: false,
      canSelect: false
    }
  },
  // eslint-disable-next-line vue/order-in-components
  filters: {
    ellipsis(value) {
      if (!value) return ''
      if (value.length > 5) {
        return value.slice(0, 6) + '...'
      }
      return value
    }
  },
  watch: {
    '$store.state.canSelect': function(value) {
      this.canSelect = value
      this.selected = false
    }
  },
  methods: {
    fixBug() {
      document.body.style.overflow = ''
    },
    changeSelect() {
      if (this.canSelect) {
        this.selected = !this.selected
        this.$emit('changeStatus')
      }
    }
  }
}
</script>

<style scoped>
  .xz{
    height: 20px;
    width: 20px;
    position: absolute;
    right: 3px;
    top: 3px;
    z-index: 24;
    cursor: pointer;
  }
  .actor-div{
    font-size: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,.3);
  }
  .imgDiv{
    position: relative;
  }
  .selected{
    box-shadow: 0 2px 10px rgba(0,0,0,.6);
  }
  .mask{
    content: '';
    background-color: rgba(0, 0, 0, 0.2);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 23;
  }
  .title{
    line-height: 40px;
    height: 40px;
    font-size: 15px;
    text-align: center;
    font-weight: bold;
    cursor: default;
  }
</style>
