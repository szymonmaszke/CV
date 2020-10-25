pdf:
	xelatex cv.tex && xelatex cv.tex
clean:
	rm cv.aux cv.log cv.out missfont.log
