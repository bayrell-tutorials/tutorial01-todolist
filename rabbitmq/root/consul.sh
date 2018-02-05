#!/bin/bash

INTERFACE="eth0"


while [ 1 ]; do
	
	# Get Consul IP
	GATEWAY=`route |grep ${INTERFACE} | grep default | awk '{print $2}'`
	CONSUL_IP="${GATEWAY}:8500"
	
	# Register RabbitMQ service in consul
	IP=`ifconfig ${INTERFACE} | grep inet |  awk '{print $2}' | sed -n 1p`
	DATA="{\"ID\": \"rabbitmq_id01\",\"Name\": \"rabbitmq\", \"Address\": \"${IP}\", \"Port\": 5672}"
	curl -H "Content-Type: application/json" -X PUT -d "${DATA}" http://${CONSUL_IP}/v1/agent/service/register

	sleep 60
	
done
