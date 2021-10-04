<template>
  <div ref="comContainer" :class="isChalk? 'chalk':'west'" class="com-container">
    <div class="header"><span>统计面板</span></div>
    <div class="body">
      <div class="data-div">
        <p class="number">{{ allData.video_conut }}</p>
        <p class="text">影片总数</p>
      </div>
      <div class="data-div">
        <p class="number">{{ allData.actor_conut }}</p>
        <p class="text">演员总数</p>
      </div>
      <div class="data-div">
        <p class="number">{{ allData.bimg_conut }}</p>
        <p class="text">大图总数</p>
      </div>
      <div class="data-div">
        <p class="number">{{ allData.simg_conut }}</p>
        <p class="text">小图总数</p>
      </div>
      <div class="data-div">
        <p class="number">{{ allData.actorimg_conut }}</p>
        <p class="text">头像总数</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getPanel } from '@/api/display'

export default {
  name: 'Panel',
  data() {
    return {
      isChalk: true,
      allData: {
        'video_conut': 0,
        'actor_conut': 0,
        'actorimg_conut': 0,
        'bimg_conut': 0,
        'simg_conut': 0
      }
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      this.isChalk = !this.isChalk
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    // 获取服务器数据
    getData() {
      getPanel().then(res => {
        this.allData = res.data
      }).catch(e => {
        console.log(e)
      })
    },
    // 当浏览器窗口大小发生变化，完成屏幕适配
    screenAdapter() {}
  }
}
</script>

<style lang="less" scoped>
/* 声明字体*/
@font-face {
  font-family: electronicFont;
  src: url(../../assets/font/DS-DIGIT.TTF);
}
.west{
  background-color: #ffffff;
  .number{
    color:#5052EE;
  }
  .header{
    color: #516b91
  }
  .body{
    color: #999999
  }
}
.chalk{
  background-color: #222733;
  .number{
    color: #ffeb7b;
  }
  .header{
    color: white
  }
  .body{
    color: white
  }
}
.com-container{
  padding: 0 20px;
  border-radius: 20px;
}
.header{
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}
.body {
  height: 80%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.data-div{
  width: 33%;
  height: 45%;
  text-align: center;
  display: flex;
  /*align-items: center;*/
  flex-wrap: wrap;
  justify-content: center;
}
.number {
  width: 100%;
  height: 70%;
  align-items:center;
  display: flex;
  justify-content: center;
  font-size: 55px;
  font-family: electronicFont, serif;
  font-weight: bold;
}
.text{
  //height: 30%;
  align-items:center;
  display: flex;
  justify-content: center;
  font-size: 15px;
}
</style>
