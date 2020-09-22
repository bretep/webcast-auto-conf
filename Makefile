.DEFAULT_GOAL:=build-firmware
CWD := $(shell pwd)

build:
	GOOS=linux GOARCH=arm go build -o up/remoteConfig cmd/webcast-auto-conf/main.go

build-docker-image:
	docker build -t rar:latest .

build-firmware: build build-docker-image
	docker run --rm -v $(CWD)/up:/files rar
	mv up/up.rar .
