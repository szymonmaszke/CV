.PHONY: clean

XETEX = xelatex
PYTHON = python

all: update cv clean

update: scripts
	@echo "Updating GitHub & StackOverflow statistics..."
	$(PYTHON) scripts/main.py --github-token $(GITHUB_TOKEN) \
		--github-url $(GITHUB_URL) \
		--stackoverflow-url $(STACKOVERFLOW_URL) \
		--data cv/data
	@echo "Updated succesfully."
cv: cv/data cv/main.tex cv/sections
	@echo "Compiling LaTeX CV..."
	$(XETEX) cv/main.tex && $(XETEX) cv/main.tex && mv main.pdf cv.pdf
	@echo "LaTeX CV compiled successfully."
clean:
	rm -rf *.aux *.log *.out
