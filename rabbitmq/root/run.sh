#!/bin/bash


# Run consul loop service register
/root/consul.sh &


# Run RabbitMQ Server
/usr/sbin/rabbitmq-server

