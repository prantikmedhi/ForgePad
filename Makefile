.SUFFIXES:
.PHONY: help app-install app-start cli-install cli-build manager-install manager-dev proxy-install proxy-dev pty-build

help:
	@echo "ForgePad commands"
	@echo "  make app-install"
	@echo "  make app-start"
	@echo "  make cli-install"
	@echo "  make cli-build"
	@echo "  make manager-install"
	@echo "  make manager-dev"
	@echo "  make proxy-install"
	@echo "  make proxy-dev"
	@echo "  make pty-build"

app-install:
	cd app && npm install

app-start:
	cd app && npm run start

cli-install:
	cd cli && npm install

cli-build:
	cd cli && npm run build

manager-install:
	cd manager && npm install

manager-dev:
	cd manager && npm run dev

proxy-install:
	cd proxy && npm install

proxy-dev:
	cd proxy && npm run dev

pty-build:
	cd pty && cargo build
