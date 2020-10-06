.DEFAULT_GOAL:=build-firmware
CWD := $(shell pwd)

build:
	GOOS=linux GOARCH=arm go build -ldflags="-s -w" -o up/remoteConfig cmd/webcast-auto-conf/main.go
	yarn --cwd $(CWD)/web build

build-docker-image:
	docker build -t rar:latest .

build-nginx:
	docker build -t nginx:latest nginx
	docker run --rm -v $(CWD)/nginx:/files nginx:latest
	mv nginx/nginx up/nginx/sbin

build-firmware: build build-docker-image
	docker run --rm -v $(CWD)/up:/files rar
	mv up/up.rar .
