# Tutorial 01. Run test project Todolist on Docker Swarm


**Warning!** This docker images are open ports, in external network:

RabbitMQ: 15672

MongoDB: 27017

NodeJS: 3000

Visualizer: 8080

**If you run it, you must close this ports by iptables from external network. Or run it in virtual machine !!!**



## Install docker on Ubuntu 16.04

Add key of the docker repository:
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

Check key:
apt-key fingerprint 0EBFCD88
```
pub   4096R/0EBFCD88 2017-02-22
      Key fingerprint = 9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
uid                  Docker Release (CE deb) <docker@docker.com>
sub   4096R/F273FCD8 2017-02-22
```

Add docker repository:
```
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

Install docker:
```
apt-get update
apt-get install docker-ce
```



## Install docker cluster

Init cluster:
```
docker swarm init --advertise-addr YOU-EXTERNAL-IP
```

View worker key:
```
docker swarm join-token worker
```

View manager key:
```
docker swarm join-token manager
```


For test server you may limit history:
```
docker swarm update --task-history-limit=1
```


## Deploy Tutorial01

```
git clone https://github.com/bayrell-tutorials/tutorial01-todolist
cd tutorial01-todolist && cd docker
docker stack deploy --compose-file compose.yaml prod
```


## Init mongodb password:

Login over ssh to manager host.

Get ID of mongodb container:
```
docker ps |grep mongo | awk '{ print $1}'
```

Attach to docker container:
```
docker exec -it MONGODB-CONTAINER-ID mongo admin
```

Exec command in mongodb shell:
```
use admin
db.createUser({ user: 'jsmith', pwd: 'some-initial-password', roles: [{ role: 'root', db: 'admin' }] })
exit
```


## Web addresses

http://CLUSTER-IP:3000/ - Project IP Address.

http://CLUSTER-IP:8080/ - Docker visualizer

http://CLUSTER-IP:15672/ - RabbitMQ Web Manager. Login guest, password: guest.

tcp://CLUSTER-IP:27017/ - MongoDB socket



# Build images

Download docker images:
```
docker pull centos:7
docker pull bayrell/tutorial01_php71
docker pull bayrell/nodejs
```

Build tutorial images:
```
git clone https://github.com/bayrell-tutorials/tutorial01-todolist
cd tutorial01-todolist

cd backend-php
./build.sh docker
cd ..

cd frontend-nodejs
./build.sh docker
cd ..
```
