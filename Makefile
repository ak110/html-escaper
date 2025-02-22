help:
	@cat Makefile

install:
	pnpm install

run:
	pnpm run dev

build:
	pnpm run build
	node_modules/.bin/terser dist/html-escaper.js -o dist/html-escaper.min.js --source-map "content=dist/html-escaper.js.map,url=html-escaper.min.js.map" --compress --mangle

test:
	pnpm run test

.PHONY: help install run build test
