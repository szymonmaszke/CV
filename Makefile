.PHONY: clean

XETEX = xelatex
PYTHON = python

all: cv.pdf clean

update: scripts
	@echo "Updating GitHub & StackOverflow statistics..."
	$(PYTHON) scripts/main.py --github-token $(GITHUB_TOKEN) \
		--github-url $(GITHUB_URL) \
		--stackoverflow-url $(STACKOVERFLOW_URL) \
		--data data
cv.pdf: update data cv.tex
	@echo "Compiling LaTeX"
	$(XETEX) cv.tex && $(XETEX) cv.tex
clean:
	rm -rf cv.aux cv.log cv.out missfont.log
