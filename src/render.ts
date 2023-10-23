//electron 主进程文件
import {app,BrowserWindow} from 'electron'

//环境准备完成后打开浏览器窗口
app.whenReady().then(()=>{
    //桌面程序就按照以下配置来启动的
    const window = new BrowserWindow({
        height:1000,
        width:1200,
        webPreferences:{
            nodeIntegration:true, //可以在渲染进程调用node的api 默认是false 需要的话要手动开启
            contextIsolation:false, //是否需要将渲染进程放置到沙箱隔离
            webSecurity:false, //关闭跨域检测 就是同源策略
        }
    })
    //window.webContents.openDevTools() //开发环境打开控制台
    if(process.argv[2]){
        window.loadURL(process.argv[2]) //开发环境
    }else{
        window.loadFile("index.html") //生产环境 直接加载文件就行
    }
})