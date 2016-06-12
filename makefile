SHELL := /bin/bash
PATH  := node_modules/.bin:$(PATH)
APP   := dist/server.js
TESTS := dist/tests.spec.js
SRC   := src/server.es
SPEC  := spec/tests.es

all: install clean build
clean:
	rm -r dist

install:
	@npm install

uninstall:
	rm -r node_modules

build: $(APP) $(TESTS)

$(APP): $(SRC)
	babel $< --presets es2015 -o $@

$(TESTS): $(SPEC)
	babel $< --presets es2015 -o $@

.PHONY: all clean install uninstall build
