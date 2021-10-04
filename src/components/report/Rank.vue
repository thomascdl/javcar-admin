<template>
  <div ref="comContainer" class="com-container">
    <div ref="rankRef" class="com-chart" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
// import { getThemeValue } from '@/utils/theme_utils'
import { getActorRank } from '@/api/display'

export default {
  name: 'Rank',
  data() {
    return {
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 柱形图 区域缩放起点值
      startValue: 0,
      // 柱形图结 区域缩放终点值
      endValue: 9,
      // 定时器
      timerId: null
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme() {
      // 销毁当前的图表
      this.chartInstance.dispose()
      // 以最新主题初始化图表对象
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 渲染数据
      this.updateChart()
    }
  },
  mounted() {
    this.initChart()
    this.getData()
    // 在界面加载完成时，主动对屏幕进行适配
    this.screenAdapter()
    // 监听容器大小变化
    this.$erd.listenTo(this.$refs.comContainer, () => {
      this.$nextTick(() => {
        this.screenAdapter()
      })
    })
  },
  beforeDestroy() {
    // 离开页面删除检测器和所有侦听器
    this.$erd.uninstall(this.$refs.comContainer) // 这里用ref是因为vue离开页面后获取不到dom
  },
  destroyed() {
    clearInterval(this.timerId)
  },
  methods: {
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, this.theme)
      const initOption = {
        title: {
          text: '▎演员影片量排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '25%',
          left: '5%',
          right: '7%',
          bottom: '8%',
          // 把x轴和y轴纳入 grid
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            textStyle: {
              fontSize: 11
            },
            interval: 0,
            rotate: -30
          }
        },
        yAxis: {
          value: 'value'
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'top',
              color: 'white',
              rotate: 30
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)

      // 鼠标经过关闭 动画效果
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      // 鼠标离开 开启动画效果
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 发送请求，获取数据
    getData() {
      getActorRank().then(res => {
        this.allData = res.data
        // 对数据进行排序(大到小)
        this.allData.sort((a, b) => b.value - a.value)
        this.updateChart()
        // 开始自动切换
        this.startInterval()
      }).catch(e => {
        console.log(e)
      })
    },
    // 更新图表配置项
    updateChart() {
      // 渐变色数组
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      // 所有省份组成的数组
      const provinceInfo = this.allData.map(item => item.name)
      // 所有省份对应的销售金额
      const valueArr = this.allData.map(item => item.value)
      const dataOption = {
        xAxis: {
          data: provinceInfo
        },
        dataZoom: {
          // 区域缩放组件
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: arg => {
                let targetColorArr
                if (arg.value > 8) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 6) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  // 0%
                  { offset: 0, color: targetColorArr[0] },
                  // 100%
                  { offset: 1, color: targetColorArr[1] }
                ])
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    // 根据图标容器的宽度 计算各属性、标签、元素的大小
    screenAdapter() {
      const titleFontSize = (this.$refs.rankRef.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 改变柱形图 区域缩放起始与终点值的函数
    startInterval() {
      // 如果存在则关闭
      this.timerId && clearInterval(this.timerId)
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
