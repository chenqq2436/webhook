#!/bin/bash
WORK_PATH='/usr/projects/vue-front'
cd $WORK_PATH
echo '先清除老代码'
# 保证仓库代码是干净的最新的
git reset --hard origin/master
git clean -f
echo '拉取最新代码'
git pull origin master
echo '编译'
npm run build
echo '开始执行构建'
# .代表去当前目录下找Dockerfile文件去执行构建 -t指定一个任务名称 需要指定版本号不然会报错 默认latest
docker build -t vue-front:1.0 .
echo '先停止并删除旧容器'
docker stop vue-front-container
docker rm vue-front-container
echo 'docker container run 启动新容器 -p 映射到80端口 -d 在后台运行 基于vue-front'
docker container run -p 80:80 --name vue-front-container -d vue-front:1.0
