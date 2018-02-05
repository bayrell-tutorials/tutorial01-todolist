FROM rabbitmq:3.6.14-management

COPY consul.sh /root/consul.sh
COPY run.sh /root/run.sh
ADD etc/rabbitmq /etc/rabbitmq/

RUN cd ~; \
	apt update; \
	apt install net-tools curl mc nano less -y; \
	apt clean all

CMD ["/root/run.sh"]
