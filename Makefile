pdf:
	xelatex cv.tex && xelatex cv.tex
clean:
	rm cv.aux cv.log cv.pdf cv.out missfont.log
