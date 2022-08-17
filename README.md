# Jzlv5

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.0.

## build serve

 - 构建机器 10.254.33.131 (/usr/local/jzlv5-front)
 
 ```
   ng build  --prod 
 ```
 
## rsync to online

  - 构建机器 10.254.33.131 (/usr/local/jzlv5-front)
  - 线上机器 10.254.47.111
  
 ```
  rsync -av /usr/local/jzlv5-front/dist/  root@10.254.47.111:/data/project/jzlv5-front-dist
 ```
 
