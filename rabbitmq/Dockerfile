FROM rabbitmq:3.6.14-management

COPY root/consul.sh /root/consul.sh
COPY root/run.sh /root/run.sh
ADD etc/rabbitmq /etc/rabbitmq/

RUN cd ~; \
	apt update; \
	apt install net-tools iproute curl mc nano less -y

CMD ["/root/run.sh"]
