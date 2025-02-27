help:
	@cat Makefile

install:
	pnpm install

format:
	pnpm run format

build:
	pnpm run build

test:
	$(MAKE) format
	$(MAKE) build
	pnpm run test

publish:
	$(MAKE) test
	pnpm publish

example:
	$(MAKE) build
	pnpm tsx examples/escape.ts

.PHONY: help install run build test publish example
