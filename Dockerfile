FROM alpine
RUN apk add --no-cache make
RUN wget http://www.rarlab.com/rar/rarlinux-3.5.0.tar.gz && \
	tar -xzvf rarlinux-3.5.0.tar.gz && \
	cd rar && \
	make && \
	mv rar_static /usr/local/bin/rar
WORKDIR /files
CMD ["/usr/local/bin/rar", "a", "-t", "-r", "-m5", "up.rar", "*"]