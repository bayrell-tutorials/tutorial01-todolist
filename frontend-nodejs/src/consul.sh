#!/bin/bash

INTERFACE="eth0"


while [ 1 ]; do
	
	# Get Consul IP
	GATEWAY=`ip route | grep default | awk '{ print $3 }'`
	CONSUL_IP="${GATEWAY}:8500"
	
	# Register service in the consul
	IP=`ifconfig ${INTERFACE} | grep inet\ addr | awk '{print $2}' | cut -d ':' -f 2`
	DATA="{\"ID\": \"frontend_01\",\"Name\": \"frontend\", \"Address\": \"${IP}\", \"Port\": 3000}"
	curl -H "Content-Type: application/json" -X PUT -d "${DATA}" http://${CONSUL_IP}/v1/agent/service/register

	sleep 60
	
done