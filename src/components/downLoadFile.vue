<template>
  <div style="width: 100%;height: 100%;">
    <el-table :data="props.tableData" highlight-current-row style="width: 100%;height: 100%;" border
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
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
          <el-table-column align="center" width="250">
            <template #header>
              <el-button type="primary" :disabled="downAllDisabled" @click="downAllFile">下载全部</el-button>
              <el-button type="danger" :disabled="downAllDisabled" @click="deleteAllFile">删除全部</el-button>
            </template>
            <template #default="scope">
              <el-button type="primary" @click="downFile(scope.row)">下载</el-button>
              <el-button type="danger" @click="deleteOneFile(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import zip from 'jszip'

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

const props = defineProps<{
  tableData:tableDataType
}>()

const SelectFile = ref<tableDataType>([])
const downAllDisabled = ref(true)

const handleSelectionChange = (fileMeet: tableDataType) => {
  if (fileMeet.length === 0) return
  if (fileMeet.length > 1) {
    downAllDisabled.value = false
  } else {
    downAllDisabled.value = true
  }
  SelectFile.value = fileMeet
}

const downAllFile = () => {
  const buildZip = new zip()
  for (let i of SelectFile.value) {
    buildZip.file(i.fileName,i.file)
  }
  buildZip.generateAsync({
    type:"blob",
  }).then(blob=>{
    let url = URL.createObjectURL(blob)
    let a = document.createElement("a")
    a.href = url
    a.download = "筛选.zip"
    a.click()
    a.remove()
  })
}

const downFile = (file: oneFileType) => {
  let url = URL.createObjectURL(file.file)
  let a = document.createElement("a")
  a.href = url
  a.download = file.fileName
  a.click()
  a.remove()
}

const deleteOneFile = (file: oneFileType) => {
  props.tableData.splice(props.tableData.findIndex(item => item.id === file.id), 1)
}

const deleteAllFile = () => {
  SelectFile.value.forEach(item => {
    props.tableData.splice(props.tableData.findIndex(item2 => item2.id === item.id), 1)
  })
  downAllDisabled.value = true
}

const time = ($: number)=>{
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

</style>