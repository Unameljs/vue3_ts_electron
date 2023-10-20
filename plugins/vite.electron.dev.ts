//electron开发环境插件
import type { Plugin } from 'vite'
import type { AddressInfo } from 'net'
import esbuild from 'esbuild'
import { spawn } from 'child_process'
import fs from 'node:fs'

function devServer(){
    //vite开发环境用的是esbuild 打包用的是rollup 所以这里可以直接使用esbuild
    esbuild.build({
        entryPoints: ['./src/render.ts'],
        //要不要把所有的依赖都打包
        bundle: true,
        outfile: "dist/render.js",
        platform: "node",
        target: "node12",
        //不需要打包的放置在这
        external: ['electron']
    })
}

//vite插件 要求必须导出一个对象 对象必须包含name
//在这个对象里面有很多钩子
export const ElectronDevPlugin = (): Plugin => {
    return {
        name: "electron-dev",
        //配置vite钩子
        //用于配置开发服务器的钩子
        configureServer(server) {
            devServer()
                server.httpServer?.once("listening", () => {
                    //是在终端打印 可以读到IP方式及IP端口
                    const addressInfo = server.httpServer?.address() as AddressInfo
                    // console.log(addressInfo);

                    //拼接IP地址 给electron启动服务的时候使用
                    const IP = `http://localhost:${addressInfo.port}`

                    //第一个参数是electron的入口文件 require('electron')返回的是一个路径
                    //electron 不认识ts文件 需要编译成js文件
                    //进程传参发送给electron require('electron') 0 'dist/render.js' 1 IP 2
                    let ElectronProcess = spawn('D:/前端/electron/node_modules/electron/dist/electron.exe',['dist/render.js',IP])
                    
                    // 监听文件变化 一有改变重新启动服务
                    fs.watchFile("src/render.ts",()=>{
                        ElectronProcess.kill()
                        devServer()
                        ElectronProcess = spawn('D:/前端/electron/node_modules/electron/dist/electron.exe',['dist/render.js',IP])
                    })
                })
        }
    }
}