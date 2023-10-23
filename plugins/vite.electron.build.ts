//electron生产环境插件
import type { Plugin } from 'vite'
import esbuild from 'esbuild'
import fs from "node:fs"
import * as electronBuild from 'electron-builder'
import path from "node:path"

function devServer(){
    //vite开发环境用的是esbuild 打包用的是rollup 所以这里可以直接使用esbuild
    esbuild.buildSync({
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

//打包 需要先等vite打完包，vite打完包之后才有index.html文件,再执行electron打包
export const ElectronBuildPlugin = ():Plugin=>{
    return {
        name:"electron-build",
        //这个钩子会等vite打完包之后再进行electron打包
        closeBundle(){
            devServer()
            //electron打包需要指定package.json main属性
            //先读取
            let json = JSON.parse(fs.readFileSync("package.json","utf-8"))
            //添加属性
            json.main = "render.js"
            //写入到dist
            fs.writeFileSync("dist/package.json",JSON.stringify(json,null,4))
            //electron打包有bug 会下载垃圾文件并且下载不下来 从而卡住
            //创建一个假的node_modules 它就不会下载垃圾文件了
            fs.mkdirSync(path.resolve(process.cwd(), "dist/node_modules"))

            //打包
            electronBuild.build({
                config:{
                    directories:{
                        //__dirname用不了 使用process.cwd() 获取根目录
                        output:path.resolve(process.cwd(),"release"),
                        app:path.resolve(process.cwd(),"dist")
                    },
                    asar:true,//打包成一个压缩包
                    appId:"ljs_filter.app",
                    productName:"无敌暴龙筛选器",
                    nsis:{
                        oneClick:false,//取消一键安装 默认是一键安装
                        allowToChangeInstallationDirectory:true,//允许用户选择安装目录,默认的话在C盘
                    },
                }
            })
        }
    }
}