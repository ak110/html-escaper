help:
	@cat Makefile

install:
	pnpm install

run:
	pnpm run dev

format:
	pnpm run format

build:
	pnpm run build

test:
	pnpm run test

publish:
	pnpm publish

.PHONY: help install run build test publish
