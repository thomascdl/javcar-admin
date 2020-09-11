<template>
  <div class="vm-image-list">
    <Row class="image-list-heading vm-panel">
      <div class="panel-heading">
        {{ title }}
      </div>
      <Row type="flex" align="middle" justify="space-between" class="panel-body">
        <div class="search-bar">
          <Input v-model="listQuery.fh" placeholder="Please enter ..." @keyup.enter.native="search" style="width: 300px" />
          <Button ghost @click="search"><i class="fa fa-search"></i></Button>
        </div>
        <div>
          <Button @click="handleCreate"><i class="fa fa-plus"></i></Button>
        </div>
        <Row type="flex" align="middle" class="page">
          <span>Show</span>
          <Input v-model="listQuery.limit" :max="42" :min="10" :number="true" class="input-number" @keyup.enter.native="updateDataShow"/>
          <span class="margin-end">/ Page</span>
          <span class="total">Total {{ total }}</span>
          <Page :total="total" :current="listQuery.page" :page-size="listQuery.limit" @on-change="pageChange"/>
        </Row>
      </Row>
    </Row>
    <Row class="image-list">
      <Col v-for="item in data" :key="item.id" :lg="4" :sm="12" class="vm-margin" >
        <VmCard :editable="true" :title="item.name" :img="item.url" :img-style="imgStyle" :control-style="controlStyle" @delete-ok="deleteOk(item)" />
      </Col>
    </Row>
  </div>
</template>

<script>
import VmCard from '@/components/Imglist/vm-card'
export default {
  name: 'VmImageList',
  components: {
    VmCard
  },
  props: {
    imgStyle: {
      type: String,
      default: ''
    },
    controlStyle: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Image List'
    },
    total: {
      type: Number,
      default: 0
    },
    // origin data
    data: {
      type: Array,
      default: function () {
        return [
          {
            id: '19920805',
            title: 'Title',
            img: require('@/assets/img/img-1.jpg'),
            desc: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry,Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s ly dummy tly dummy tly dummy tly dummy tly dummy tly dummy t',
            to: '#'
          }
        ]
      }
    }
  },
  data: function () {
    return {
      dialogFormVisible: false,
      keyword: '', // keyword for search
      listQuery: {
        page: 1,
        limit: 24,
        fh: undefined
      },
    }
  },
  methods: {
    handleCreate() {
      this.$emit('create')
    },
    updateDataShow: function () {
      this.listQuery.page = 1;
      this.getData(this.listQuery)
    },
    pageChange: function (page) {
      this.listQuery.page = page
      this.getData(this.listQuery)
    },
    search: function () {
      this.listQuery.page = 1
      this.getData(this.listQuery)
    },
    getData(data) {
      this.$emit('get-data', data)
    },
    deleteOk: function (data) {
      this.$emit('delete-ok', data)
    }
  }
}
</script>

<style lang="less" scoped src="@/theme/index.less"/>
