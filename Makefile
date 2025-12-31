.PHONY: test release

test:
	npm test

build:
	npm run lint-fix
	npm run test
	npm run build

release: build
	npm run release
