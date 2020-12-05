.PHONY: clean cv

XETEX = xelatex
PYTHON = python

all: update cv clean

update:
	@echo "Updating GitHub & StackOverflow statistics..."
	$(PYTHON) scripts/main.py --github-token $(GITHUB_TOKEN) \
		--github-url $(GITHUB_URL) \
		--stackoverflow-url $(STACKOVERFLOW_URL) \
		--data cv/data
	@echo "Updated succesfully."
cv:
	@echo "Compiling LaTeX CV..."
	cd cv && $(XETEX) main.tex && $(XETEX) main.tex && mv main.pdf ../cv.pdf && cd -
	@echo "LaTeX CV compiled successfully."
clean:
	rm -rf cv/*.aux cv/*.log cv/*.out
