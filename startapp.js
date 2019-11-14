#!/usr/bin/env node
const path = require('path');
const {spawn} = require('child_process');
// 运行命令的路径
const runtimePath = process.cwd();
// build.js所在的路径
const codePath = __dirname;
// ctbuild.cmd或者ctbuild.sh所在路径
const commandPath = path.join(codePath, 'node_modules', '.bin', path.sep);
// 配置文件所在路径
let configPath;
let define;

/**
 * corssenvTask
 * @access private
 * @return {Promise}
 */
function corssenvTask() {
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? `${commandPath}cross-env.cmd` : `${commandPath}cross-env`;
    const crossenvProcess = spawn(command, ['REAP_PATH=dev', 'NODE_ENV=development'], {
      cwd: codePath,
      encoding: 'utf-8',
    });

    crossenvProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    crossenvProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    crossenvProcess.on('close', (code) => {
      console.log(`crossenvClose：${code}`);
      resolve();
    });
  });
}

// /**
//  * devDllTask
//  * @return {Promise}
//  */
// function devDllTask() {
//   return new Promise((resolve, reject) => {
//     const command = process.platform === "win32" ? `${commandPath}webpack.cmd` : `${commandPath}webpack`;
//     const devDllProcess = spawn(
//       command,
//       [
//         '--config',
//         path.join('webpackconfig', 'webpack.dev.dll.js'),//'webpackconfig/webpack.dev.dll.js',
//         '--custom',
//         path.join(runtimePath, '/'),//`${runtimePath}\\`
//       ],
//       {
//         cwd: codePath,
//         encoding: 'utf-8',
//       }
//     );
//
//     devDllProcess.stdout.on('data', (data) => {
//       console.log(`stdout: ${data}`);
//     });
//
//     devDllProcess.stderr.on('data', (data) => {
//       console.log(`stderr: ${data}`);
//     });
//
//     devDllProcess.on('close', (code) => {
//       console.log(`devDllTaskClose：${code}`);
//       resolve();
//     });
//   });
// }

/**
 * webpackServiceTask
 * @return {Promise}
 */
function webpackServiceTask() {
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? `${commandPath}webpack-dev-server.cmd` : `${commandPath}webpack-dev-server`;
    const babelProcess = spawn(
      command,
      [
        '--open',
        '--config',
        path.join('webpackconfig', 'webpack.dev.js'),
        '--progress',
        '--colors',
        '--runtimepath',
        path.join(runtimePath, path.sep),
        '--customconfig',
        configPath,
        '--define',
        define.join(' ')
      ],
      {
        cwd: codePath,
        encoding: 'utf-8',
      });

    babelProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    babelProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    babelProcess.on('close', (code) => {
      console.log(`webpackServiceTaskClose：${code}`);
      resolve();
    });
  });
}

// startapp的tasks
const tasks = [corssenvTask, /*devDllTask, */webpackServiceTask];
let index = 0;

/**
 * loopTask
 * @return {Promise}
 */
function loopTask() {
  return new Promise((resolve, reject) => {
    if (index >= tasks.length) {
      resolve();
    } else {
      const task = tasks[index++];
      if (task) {
        task().then(() => {
          loopTask().then(() => {
            resolve();
          });
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject();
      }
    }
  });

}

module.exports = {
  /**
   * build
   * @param {String} - ctbuildConfigPath
   * ctbuild.config.js配置文件的路径，如果没有指定则会寻找命令运行目录下的ctbuild.config.js文件
   */
  build: ({config: ctbuildConfigPath = '', define: defineMap}) => {
    if(ctbuildConfigPath) {
      if(path.isAbsolute(ctbuildConfigPath)) {
        configPath = ctbuildConfigPath;
      } else {
        configPath = path.join(runtimePath, ctbuildConfigPath);
      }
    } else {
      configPath = path.join(runtimePath,'ctbuild.config.js');
    }

    define = defineMap;

    loopTask().then(() => {
      console.log('finish');
      process.exit();
    }).catch((error) => {
      console.log(error);
    });
  }
};