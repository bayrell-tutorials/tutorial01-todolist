#!/bin/bash


# Run consul loop service register
/root/consul.sh &


# Run MongoDB Server
mongod --bind_ip 0.0.0.0

