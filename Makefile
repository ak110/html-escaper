
help:
	@cat Makefile

install:
	pnpm install

run:
	pnpm run dev

build:
	pnpm run build

.PHONY: help install run
