<template>
  <div style="width: 100vw;height: 100vh;display: flex;">

    <div style="width: 70vw;border-style: none solid none none;">
      <div>
        <upLoadFile @sendDownFileList="getDownFileList"></upLoadFile>
      </div>

      <div style="width: 100%;height: 50vh;">
        <downLoadFile :tableData="tableData"></downLoadFile>
      </div>
    </div>

    <div style="display: flex;justify-content: center;align-items: center;width: 30vw;position: relative;">
      <div v-if="filterData.length === 0"
        style="position: absolute;z-index: 99;width: 100%;height: 100%;background-color: rgb(236, 236, 236);opacity: 0.3;"
        @click="filterFileReady">
      </div>
      <div style="width: 100%;text-align: center;">
        <el-dropdown @command="filterModeChange">
          <el-button type="info">
            {{ filterMode }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="以文件名筛选">以文件名筛选</el-dropdown-item>
              <el-dropdown-item command="以文件格式筛选">以文件格式筛选</el-dropdown-item>
              <el-dropdown-item command="以文件名+文件格式筛选">以文件名+文件格式筛选</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div style="width: 90%;margin-left: 5%;margin-top: 2vh;">
          <div v-if="filterMode == '以文件名筛选' || filterMode == '以文件名+文件格式筛选'">
            <el-input v-model="filterAskName" autosize :rows="2" type="textarea"
              placeholder="请输入需要筛选的文件名称，或者直接读取文件进行输入(注意英文逗号分隔 如:唱,跳,rap)" />
            <el-upload v-model:file-list="readFileList" style="margin-top: 2vh;" :before-upload="beforReadTxt">
              <el-button type="primary">读取文件(仅限.txt)</el-button>
            </el-upload>
          </div>

          <div v-if="filterMode == '以文件格式筛选' || filterMode == '以文件名+文件格式筛选'">
            <el-dropdown @command="filterFileTypeChange">
              <el-button type="primary">
                {{ mode }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="txt">.txt</el-dropdown-item>
                  <el-dropdown-item command="pdf">.pdf</el-dropdown-item>
                  <el-dropdown-item command="jpg">.jpg</el-dropdown-item>
                  <el-dropdown-item command="png">.png</el-dropdown-item>
                  <el-dropdown-item command="doc">.doc</el-dropdown-item>
                  <el-dropdown-item command="docx">.docx</el-dropdown-item>
                  <el-dropdown-item command="ppt">.ppt</el-dropdown-item>
                  <el-dropdown-item command="pptx">.pptx</el-dropdown-item>
                  <el-dropdown-item command="xls">.xls</el-dropdown-item>
                  <el-dropdown-item command="xlsx">.xlsx</el-dropdown-item>
                  <el-dropdown-item command="mp3">.mp3</el-dropdown-item>
                  <el-dropdown-item command="mp4">.mp4</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div style="width: 100%;display: flex;justify-content: space-between;margin-top:2vh">
            <el-button type="warning" :icon="Scissor" :disabled="filterBtnIsDis"
              @click="filterBtnIsDis2 = false, addMode = '替换'">替换掉已筛选</el-button>
            <el-button type="warning" :icon="Plus" :disabled="filterBtnIsDis"
              @click="filterBtnIsDis2 = false, addMode = '添加'">追加到已筛选</el-button>
          </div>
          <el-button type="primary" style="margin-top:2vh" :icon="FullScreen" :disabled="filterBtnIsDis2"
            @click="filterRun">筛选</el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue';
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { FullScreen, Scissor, Plus } from '@element-plus/icons-vue'
import upLoadFile from './components/upLoadFile.vue';
import downLoadFile from './components/downLoadFile.vue';

type tableDataType = {
  id: number,
  uploadTime: number,
  fileName: string,
  fileSize: string,
  file: File
}[]

const filterMode = ref("以文件名筛选")
const filterData = ref<tableDataType>([])
const tableData = ref<tableDataType>([])
const filterAskName = ref("")
const readFileList = ref([])
const filterBtnIsDis = ref(true)
const filterBtnIsDis2 = ref(true)
const mode = ref("请选择需要筛选的文件格式")
const fileModeType = ref("")
const addMode = ref("")

const getDownFileList = (data: tableDataType) => {
  console.log(465);
  
  filterData.value = data
}

const filterFileReady = () => {
  ElMessage.error({
    message: "请先上传文件夹",
  })
}

const filterModeChange = (item: string) => {
  filterMode.value = item
}

watch(filterAskName, (newValue: string) => {
  if (newValue) {
    filterBtnIsDis.value = false
  } else {
    filterBtnIsDis.value = true
  }
})

const beforReadTxt: UploadProps['beforeUpload'] = (rawFile) => {
  const reg = /[^\.]\w*$/
  let lastName = reg.exec(rawFile.name)![0]
  if (rawFile.type !== "text/plain" && lastName !== '.txt') {
    ElMessage.error({
      message: "跟你说了仅限.txt了！",
    })
    return false
  }
  const reader = new FileReader()
  reader.readAsText(rawFile)
  reader.onload = (e: any) => {
    filterAskName.value = e.target.result
  }
  return false
}

const filterRun = () => {
  if (filterMode.value === '以文件名筛选') {
    fileNameFilter()
  } else if (filterMode.value === '以文件格式筛选') {
    fileTypeFilter()
  } else {
    fileNameAndTypeFilter()
  }
}

const filterFileTypeChange = (item: string) => {
  fileModeType.value = item
  mode.value = item
  filterBtnIsDis.value = false
}

const fileNameFilter = () => {
  const fileNameArr = filterAskName.value.split(',')
  let result = filterData.value.filter(item => fileNameArr.some(item2 => item.fileName.includes(item2)))
  if (result.length === 0) {
    ElMessage.warning({
      showClose: true,
      message: '暂无符合条件的文件',
    })
    return
  }
  if (addMode.value === "替换") {
    tableData.value = result
  } else {
    tableData.value.unshift(...result)
  }
}

const reg = /[^\.]\w*$/
const fileTypeFilter = () => {
  let data = filterData.value.filter((item) => {
    let lastName = reg.exec(item.fileName)![0]
    if (lastName === fileModeType.value) {
      return item
    }
  })
  if (data.length === 0) {
    ElMessage.warning({
      showClose: true,
      message: '暂无符合条件的文件',
    })
    return
  }
  if (addMode.value === "替换") {
    tableData.value = data
  } else {
    tableData.value.unshift(...data)
  }

}

const fileNameAndTypeFilter = () => {
  const fileNameArr = filterAskName.value.split(',')
  let result = filterData.value.filter(item => fileNameArr.some(item2 => item.fileName.includes(item2)))
  let data = result.filter((item) => {
    let lastName = reg.exec(item.fileName)![0]
    if (lastName === fileModeType.value) {
      return item
    }
  })
  if (data.length === 0) {
    ElMessage.warning({
      showClose: true,
      message: '暂无符合条件的文件',
    })
    return
  }
  if (addMode.value === "替换") {
    tableData.value = data
  } else {
    tableData.value.unshift(...data)
  }
}

</script>

<style>
* {
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}</style>