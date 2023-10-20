import type { Plugin } from 'vite'
import type { AddressInfo } from 'net'
import esbuild from 'esbuild'
import { spawn } from 'child_process'
import fs from 'node:fs'

function devServer(){
    esbuild.build({
        entryPoints: ['./src/render.ts'],
        bundle: true,
        outfile: "dist/render.js",
        platform: "node",
        target: "node12",
        external: ['electron']
    })
}

export const ElectronDevPlugin = (): Plugin => {
    return {
        name: "electron-dev",
        configureServer(server) {
            devServer()
                server.httpServer?.once("listening", () => {
                    const addressInfo = server.httpServer?.address() as AddressInfo
                    // console.log(addressInfo);
                    const IP = `http://localhost:${addressInfo.port}`
                    let ElectronProcess = spawn('D:/前端/electron/node_modules/electron/dist/electron.exe',['dist/render.js',IP])
                    fs.watchFile("src/render.ts",()=>{
                        ElectronProcess.kill()
                        devServer()
                        ElectronProcess = spawn('D:/前端/electron/node_modules/electron/dist/electron.exe',['dist/render.js',IP])
                    })
                })
        }
    }
}
