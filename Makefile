.PHONY: clean cv

XETEX = xelatex
PYTHON = python

all: cv clean

update:
	@echo "Updating GitHub & StackOverflow statistics..."
	$(PYTHON) scripts/main.py --github-token $(TOKEN_GITHUB) \
		--data cv/data
	@echo "Updated succesfully."
cv:
	@echo "Compiling LaTeX CV..."
	cd cv && $(XETEX) main.tex && $(XETEX) main.tex && mv main.pdf ../cv.pdf && cd -
	@echo "LaTeX CV compiled successfully."
pl:
	@echo "Compiling LaTeX CV..."
	cd cv_pl && $(XETEX) main.tex && $(XETEX) main.tex && mv main.pdf ../cv_pl.pdf && cd -
	@echo "LaTeX CV compiled successfully."
clean:
	rm -rf cv/*.aux cv/*.log cv/*.out
