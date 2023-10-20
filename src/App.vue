<template>
  <div style="width: 100vw;height: 100vh;display: flex;">

    <div style="width: 70vw;border-style: none solid none none;">

      <div style="width: 100%;height: 50vh;border-style: none none solid none;">
        <!-- multiple支持上传多个文件 -->
        <input v-if="filterData.length === 0" ref="file" class="inputFile" type="file" multiple webkitdirectory />
        <el-table v-if="filterData" :data="filterData" highlight-current-row style="width: 100%;height: 100%;" border
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
              <div>{{ scope.row.fileSize }}kb</div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div style="width: 100%;height: 50vh;">

        <el-table :data="tableData" highlight-current-row style="width: 100%;height: 100%;" border
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
              <div>{{ scope.row.fileSize }}kb</div>
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
    </div>

    <div style="display: flex;justify-content: center;align-items: center;width: 30vw;position: relative;">
      <div v-if="filterData.length === 0"
        style="position: absolute;z-index: 99;width: 100%;height: 100%;background-color: rgb(236, 236, 236);opacity: 0.3;"
        @click="firstUpLoadFile">
      </div>
      <div style="width: 100%;text-align: center;">
        <el-dropdown @command="filterModeChange">
          <el-button type="primary">
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

          <div v-if="filterMode == '以文件格式筛选'">
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
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <el-button type="success" style="margin-top:2vh" :icon="FullScreen" :disabled="filterBtnIsDis" @click="filterRun">筛选</el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { FullScreen } from '@element-plus/icons-vue'
// const reg = /[^\.]\w*$/
// let lastName = reg.exec(e.target.files[0].name)![0]

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
  fileSize: number,
  file: File
}[]

const file = ref<HTMLInputElement>()
const filterMode = ref("以文件名筛选")
const filterData = ref<tableDataType>([])
const filterAskName = ref("")
const readFileList = ref([])
const filterBtnIsDis = ref(true)
const mode = ref("请选择需要筛选的文件格式")
const fileModeType = ref("")

const tableData = ref<tableDataType>([])
const SelectFile = ref<tableDataType>([])

const downAllDisabled = ref(true)

onMounted(() => {
  file.value!.onchange = (e: any) => {
    if (e.target.files.length === 0) return
    filterData.value = []
    for (let i = 0; i < e.target.files.length; i++) {
      filterData.value.push({
        id: i,
        uploadTime: e.target.files[i].lastModified,
        fileName: e.target.files[i].name,
        fileSize: e.target.files[i].size,
        file: e.target.files[i]
      })
    }
    // tableData.value = formData
    // downFile(e.target.files[0], e.target.files[0].name, e.target.files[0].type)
  }
})

const firstUpLoadFile = () => {
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

const filterRun = ()=>{
  if(filterMode.value === '以文件名筛选'){
    fileNameFilter()
  }else if(filterMode.value === '以文件格式筛选'){
    fileTypeFilter()
  }
}

const fileNameFilter = () => {
  const fileNameArr = filterAskName.value.split(',')
  let result = filterData.value.filter(item => fileNameArr.some(item2 => item.fileName.includes(item2)))
  tableData.value = result
}

const filterFileTypeChange = (item: string) => {
  fileModeType.value = item
  mode.value = item
  filterBtnIsDis.value = false
}

const fileTypeFilter = () => {
  const reg = /[^\.]\w*$/
  tableData.value = filterData.value.filter((item) => {
    let lastName = reg.exec(item.fileName)![0]
    if (lastName === fileModeType.value) {
      return item
    }
  })
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

const downAllFile = () => {
  for (let i of SelectFile.value) {
    let url = URL.createObjectURL(i.file)
    let a = document.createElement("a")
    a.href = url
    a.download = i.fileName
    a.click()
    a.remove()
  }
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
  tableData.value.splice(tableData.value.findIndex(item => item.id === file.id), 1)
}

const deleteAllFile = () => {
  SelectFile.value.forEach(item => {
    tableData.value.splice(tableData.value.findIndex(item2 => item2.id === item.id), 1)
  })
}

function time($: number) {
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
* {
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.inputFile {
  display: block;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}</style>