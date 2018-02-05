FROM mongo:3.6.1-jessie

COPY root/consul.sh /root/consul.sh
COPY root/run.sh /root/run.sh

RUN cd ~; \
	apt update; \
	apt install net-tools curl mc nano less -y

CMD ["/root/run.sh"]
