<template>
  <div class="screen-container" :style="containerStyle">
    <header class="screen-header">
      <img :src="headerSrc" alt="">
      <span class="logo" :style="titleColor">JavCar</span>
      <span class="title">影片管理系统数据中心</span>
      <div class="title-right">
        <img :src="themeSrc" class="switch" title="切换主题" alt="切换主题" @click="handleChangeTheme">
        <div class="datetime">{{ systemDateTime }}</div>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="{ fullscreen: fullScreenStatus.VideoRank }">
          <!-- 销量趋势图表 -->
          <VideoRank ref="VideoRank" />
          <div class="resize">
            <!-- icon-compress-alt 向内 -->
            <span :class="['iconfont', fullScreenStatus.VideoRank ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('VideoRank')" />
          </div>
        </div>
        <div id="left-bottom" :class="{ fullscreen: fullScreenStatus.trend }">
          <!-- 商家销售金额图表 -->
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('trend')" />
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="{ fullscreen: fullScreenStatus.Panel }">
          <!-- 商家分布图表 -->
          <Panel ref="Panel" />
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('Panel')" />
          </div>
        </div>
        <div id="middle-bottom" :class="{ fullscreen: fullScreenStatus.rank }">
          <!-- 地区销量排行图表 -->
          <!--          <rank ref="rank"></rank>-->
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('rank')" />
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="{ fullscreen: fullScreenStatus.hot }">
          <!-- 热销商品占比图表 -->
          <!--          <hot ref="hot"></hot>-->
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('hot')" />
          </div>
        </div>
        <div id="right-bottom" :class="{ fullscreen: fullScreenStatus.stock }">
          <!-- 库存销量分析图表 -->
          <!--          <stock ref="stock"></stock>-->
          <div class="resize">
            <span :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']" @click="changeSize('stock')" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// 导入自己定义的主题工具函数 用于返回不同主题下的配置对象
import { getThemeValue } from '@/utils/theme_utils'

import VideoRank from '@/components/report/VideoRank'
import Panel from '@/components/report/Panel'

export default {
  name: 'DataShow',
  components: {
    VideoRank,
    Panel
  },
  data() {
    return {
      // 各组件是否全屏状态
      fullScreenStatus: {
        trend: false,
        VideoRank: false,
        Panel: false,
        rank: false,
        hot: false,
        stock: false
      },
      // 当前的系统时间
      systemDateTime: null,
      // 用于保存当前系统日期的定时器id
      timerID: null
    }
  },
  computed: {
    ...mapState(['theme']),
    // 头部的边框路径
    headerSrc() {
      return '/static/img/' + getThemeValue(this.theme).headerBorderSrc
    },
    // 主题图片的路径
    themeSrc() {
      return '/static/img/' + getThemeValue(this.theme).themeSrc
    },
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor,
        color: getThemeValue(this.theme).titleColor
      }
    },
    titleColor() {
      return {
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  created() {
    this.currentTime()
  },
  destroyed() {
    // 组件销毁时，销毁事件
    clearInterval(this.timerID)
  },
  methods: {
    currentTime() {
      this.systemDateTime = new Date().toLocaleString()
      this.timerID && clearInterval(this.timerID)
      this.timerID = setInterval(() => {
        this.systemDateTime = new Date().toLocaleString()
      }, 1000)
    },
    handleChangeTheme() {
      this.$store.commit('changeTheme')
    },
    // 监听全屏事件
    changeSize(chartName) {
      // 1.改变fullScreenStatus
      this.fullScreenStatus[chartName] = !this.fullScreenStatus[chartName]
      // 2.手动调用每个图表中的 screenAdapter 触发响应式
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      })
    }
  }
}
</script>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 9999;
}
.screen-container {
  height: 100%;
  padding: 64px 20px 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  padding: 0 20px;
  height: 40px;
  font-size: 20px;
  position: absolute;
  top: 0;
  left: 0;
  img {
    width: 100%;
    height: 100%;
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-65%);
  }
  .switch {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-60%);
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  padding-top: 2px;
.screen-left {
  height: 100%;
  width: 27.6%;
#left-top {
  height: 53%;
  position: relative;
}
#left-bottom {
  height: 31%;
  margin-top: 25px;
  position: relative;
}
}
.screen-middle {
  height: 100%;
  width: 41.5%;
  margin-left: 1.6%;
  margin-right: 1.6%;
#middle-top {
  width: 100%;
  height: 56%;
  position: relative;
}
#middle-bottom {
  margin-top: 25px;
  width: 100%;
  height: 28%;
  position: relative;
}
}
.screen-right {
  height: 100%;
  width: 27.6%;
#right-top {
  height: 46%;
  position: relative;
}
#right-bottom {
  height: 38%;
  margin-top: 25px;
  position: relative;
}
}
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
