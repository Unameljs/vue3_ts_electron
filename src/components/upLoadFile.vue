<template>
  <div style="width: 100%;height: 100%;">
    <div :style="`width: 100%;height: 50vh;border-style: none none solid none;background: url('${uploadLogo}') no-repeat;
      background-size: 100px;
      background-position: center;
      position: relative;
      `">
    <div v-if="filterData.length === 0" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%);text-align: center;width: 100%;margin-top: 10%;">
      可通过拖拽或者点击,添加需要筛选的文件夹至此处
    </div>
    <!-- multiple支持上传多个文件 -->
    <input v-if="filterData.length === 0" ref="file" class="inputFile" type="file" multiple webkitdirectory @change="inputFileOnchange" />
    <el-table v-show="filterData" :data="filterData" highlight-current-row style="width: 100%;height: 100%;"
      border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="fileName" label="文件名称" />
      <el-table-column prop="uploadTime" label="上传时间">
        <template #default="scope">
          <div>{{ time(scope.row.uploadTime) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="150">
        <template #default="scope">
          <div>{{ scope.row.fileSize }}</div>
        </template>
      </el-table-column>

      <el-table-column align="right" width="270">
        <template #header>
          <el-button size="small" type="danger" :disabled="downAllDisabled" @click="deleteselectFile">删除所选</el-button>
          <el-button size="small" type="danger" @click="deleteAllFile">删除全部</el-button>
          文件数量:{{ filterData.length }}
        </template>
        <template #default="scope">
          <el-button type="danger" @click="deleteOneFile(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import uploadLogo from '../assets/上传.png'

type oneFileType = {
  id: number,
  uploadTime: number,
  fileName: string,
  fileSize: number,
  file: File
}

type tableDataType = {
  id: number,
  uploadTime: number,
  fileName: string,
  fileSize: string,
  file: File
}[]

const file = ref<HTMLInputElement>()
const filterData = ref<tableDataType>([])
const SelectFile = ref<tableDataType>([])
const downAllDisabled = ref(true)

const emit = defineEmits<{
  "sendDownFileList": [data: tableDataType]
}>()

const inputFileOnchange = (e:any)=>{
  let loading = ElLoading.service({
      lock: true,
      text: '请稍后...',
      background: 'rgba(0, 0, 0, 0.7)',
  })
  if(e.target.files.length === 0){
    setTimeout(()=>{
      loading.close()
    },1000)
    return
  }
    let fileTotalSize = 0
      for(let i = 0; i < e.target.files.length;i++){
        fileTotalSize += e.target.files[i].size
    }
    if((fileTotalSize) / 1024 / 1024 / 1024 > 10){
      loading.close()
      ElMessage.error({
        showClose: true,
        message: '单次上传文件夹大小不能超过10GB',
      })
      return
    }
    filterData.value = []
    for (let i = 0; i < e.target.files.length; i++) {
      filterData.value.push({
        id: i,
        uploadTime: e.target.files[i].lastModified,
        fileName: e.target.files[i].name,
        fileSize: e.target.files[i].size > 1024 ? (e.target.files[i].size / 1024 / 1024).toFixed(2) + 'MB' : (e.target.files[i].size / 1024).toFixed(2) + 'kB',
        file: e.target.files[i]
      })
    }
    setTimeout(()=>{
      loading.close()
    },2000)
    emit("sendDownFileList", filterData.value)
}

const handleSelectionChange = (fileMeet: tableDataType) => {
  if (fileMeet.length === 0) return
  if (fileMeet.length > 1) {
    downAllDisabled.value = false
  } else {
    downAllDisabled.value = true
  }
  SelectFile.value = fileMeet
}

const deleteOneFile = (file: oneFileType) => {
  filterData.value.splice(filterData.value.findIndex(item => item.id === file.id), 1)
}

const deleteselectFile = () => {
  SelectFile.value.forEach(item => {
    filterData.value.splice(filterData.value.findIndex(item2 => item2.id === item.id), 1)
  })
  downAllDisabled.value = true
}

const deleteAllFile = () => {
  filterData.value.length = 0
}

const time = ($: number) => {
  let date = new Date(Number($));
  let Y = date.getFullYear(); // 年
  let M = R(date.getMonth() + 1); // 月
  let D = R(date.getDate()); // 日
  let h = R(date.getHours()); // 时
  let m = R(date.getMinutes()); // 分
  let s = R(date.getSeconds()); // 秒
  return `${Y}年${M}月${D}日 ${h}:${m}:${s}`;

  // 个位数补零功能
  function R(E: number) {
    return `${E < 10 ? 0 : ""}${E}`;
  }
}
</script>

<style>
.inputFile {
  display: block;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>