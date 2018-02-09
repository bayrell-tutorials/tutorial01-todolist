# Tutorial 01. Todolist


Download docker images:
```
docker pull centos:7
docker pull consul:1.0.3
docker pull rabbitmq:3.6.14-management
docker pull mongo:3.6.1-jessie
docker pull node:9.5-alpine
```


Build tutorial images:
```
git clone https://github.com/bayrell-tutorials/tutorial01-todolist
cd tutorial01-todolist

rabbitmq/build.sh docker
mongodb/build.sh docker
php71/build.sh docker
backend-php/build.sh docker
frontend-nodejs/build.sh docker
```


Create volumes:
```
docker volume create consul_data
docker volume create rabbitmq_data
docker volume create mongodb_config
docker volume create mongodb_data
```


Create admin user for MongoDB:
```
docker run -d --name mongodb_noauth -v mongodb_config:/data/configdb -v mongodb_data:/data/db tutorial01_mongodb
docker exec -it mongodb_noauth mongo admin
```


Exec command in mongodb shell:
```
use admin
db.createUser({ user: 'jsmith', pwd: 'some-initial-password', roles: [{ role: 'root', db: 'admin' }] })
exit
```


Stop MongoDB container:
```
docker stop mongodb_noauth
docker rm mongodb_noauth
```


Run Consul:
```
docker run -d --name consul --restart=unless-stopped --hostname consul -v consul_data:/consul/data -p 53:8600 -p 53:8600/udp -p 8500:8500 consul:1.0.3 consul agent -dev -node=node01 -client=0.0.0.0 -advertise=10.0.0.100 -data-dir=/consul/data
```


Run RabbitMQ:
```
docker run -d --name rabbitmq --restart=unless-stopped --hostname rabbitmq -v rabbitmq_data:/var/lib/rabbitmq -p 5672:5672 -p 15672:15672 -p 15674:15674 -p 25672:25672 -p 61613:61613 tutorial01_rabbitmq
```


Run MongoDB:
```
docker run -d --name mongodb --restart=unless-stopped -p 27017:27017 -v mongodb_config:/data/configdb -v mongodb_data:/data/db tutorial01_mongodb
```


Run Backend PHP:
```
docker run -d --name backend_php --restart=unless-stopped --hostname backend_php tutorial01_backend_php
```


Run NodeJS:
```
docker run -d --name nodejs --restart=unless-stopped --hostname nodejs -p 3000:3000 tutorial01_frontend_nodejs
```


