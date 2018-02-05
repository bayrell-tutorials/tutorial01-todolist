# Tutorial 01. Todolist


## Build

```
git clone https://github.com/bayrell-tutorials/tutorial01-todolist
cd tutorial01-todolist

cd rabbitmq
./build.sh
```


## Install


Download docker images:
```
docker pull consul:1.0.3
docker pull bayrell/tutorial01_rabbitmq
```

Create volumes:
```
docker volume create consul_data
docker volume create rabbitmq_data
```


## Run Tutorial 01


Run Consul:
```
docker run -d --name consul --restart=unless-stopped --hostname consul -v consul_data:/consul/data -p 53:8600 -p 53:8600/udp -p 8500:8500 consul:1.0.3 consul agent -dev -node=node01 -client=0.0.0.0 -advertise=10.0.0.100 -data-dir=/consul/data
```


Run RabbitMQ:
```
docker run -d --name rabbitmq --restart=unless-stopped --hostname rabbitmq -v rabbitmq_data:/var/lib/rabbitmq -p 5672:5672 -p 15672:15672 -p 15674:15674 -p 25672:25672 -p 61613:61613 bayrell/tutorial01_rabbitmq
```


