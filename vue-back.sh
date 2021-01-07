#!/bin/bash
WORK_PATH='/usr/projects/vue-back'
cd $WORK_PATH
echo '先清除老代码'
# 保证仓库代码是干净的最新的
git reset --hard origin/master
git clean -f
echo '拉取最新代码'
git pull origin master
echo '开始执行构建'
# .代表去当前目录下找Dockerfile文件去执行构建 -t指定一个任务名称
docker build -t vue-back .
echo '先停止并删除旧容器'
docker stop vue-back-container
docker rm vue-back-container
echo 'docker container run 启动新容器 -p 映射到3000端口 -d 在后台运行 基于vue-back'
docker container run -p 3000:3000 --name vue-back-container -d vue-back
