help:
	@cat Makefile

install:
	pnpm install

run:
	pnpm run dev

build:
	pnpm run build

test:
	pnpm run test

.PHONY: help install run build test
