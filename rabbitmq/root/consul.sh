#!/bin/bash

CONSUL_IP="172.17.0.1:8500"

while [ 1 ]; do

	# Register RabbitMQ service in consul
	IP=`ifconfig eth0 | grep inet |  awk '{print $2}' | sed -n 1p`
	DATA="{\"ID\": \"rabbitmq_id01\",\"Name\": \"rabbitmq\", \"Address\": \"${IP}\"}"
	curl -H "Content-Type: application/json" -X PUT -d "${DATA}" http://${CONSUL_IP}/v1/agent/service/register

	sleep 60
	
done
