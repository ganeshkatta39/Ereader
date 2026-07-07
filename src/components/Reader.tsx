import { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition } from "epubjs";
import Controls from "./Controls";

export default function Reader() {
	const viewerRef = useRef<HTMLDivElement | null>(null);

	const [book, setBook] = useState<Book | null>(null);
	const [rendition, setRendition] = useState<Rendition | null>(null);

	const [fontSize, setFontSize] = useState(100);
	const [isTwoPage, setIsTwoPage] = useState(true);

	// Stats
	const [currentStat, setCurrentStat] = useState(0);
	const [progress, setProgress] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	// Reading time
	const [startTime] = useState(Date.now());
	const [readingTime, setReadingTime] = useState(0);

	// Slider
	const [sliderValue, setSliderValue] = useState(0);

	const resizeRendition = (r: Rendition) => {
		if (!viewerRef.current) return;

		r.resize(viewerRef.current.offsetWidth, viewerRef.current.offsetHeight);
	};

	useEffect(() => {
		if (!viewerRef.current) return;

		const b = ePub("/Shadows_of_Self_-_Brandon_Sanderson.epub");
		setBook(b);

		const r = b.renderTo(viewerRef.current, {
			width: "100%",
			height: "100%",
			flow: "paginated",
			manager: "default",
			spread: "always",
			minSpreadWidth: 800,
		});

		r.display().then(() => {
			b.ready.then(() => {
				b.locations.generate(1000).then(() => {
					setTotalPages(b.locations.length());
				});
			});

			setTimeout(() => {
				r.spread("always");

				r.themes.override("html", {
					"column-width": "600px",
					"column-gap": "40px",
				} as any);

				resizeRendition(r);
			}, 100);
		});

		r.themes.register("light", {
			body: {
				background: "#ffffff",
				color: "#000000",
				"font-family": "serif",
				"line-height": "1.6",
				padding: "20px",
			},
		});

		r.themes.select("light");

		// Track progress
		r.on("relocated", (location: any) => {
			const cfi = location.start.cfi;

			const percent = b.locations.percentageFromCfi(cfi) ?? 0;

			const page = (b.locations.locationFromCfi(cfi) as unknown as number) ?? 0;

			setProgress(percent);
			setCurrentPage(page);

			setSliderValue(percent * 100);
		});

		setRendition(r);

		// Keyboard
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") r.next();
			if (e.key === "ArrowLeft") r.prev();
		};

		window.addEventListener("keydown", handleKey);

		const handleResize = () => resizeRendition(r);
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("keydown", handleKey);
			window.removeEventListener("resize", handleResize);
			r.destroy();
		};
	}, []);

	// Toggle pages
	useEffect(() => {
		if (!rendition) return;

		rendition.spread(isTwoPage ? "always" : "none");

		setTimeout(() => resizeRendition(rendition), 50);
	}, [isTwoPage, rendition]);

	// Font size
	useEffect(() => {
		if (!rendition) return;

		rendition.themes.fontSize(`${fontSize}%`);
		setTimeout(() => resizeRendition(rendition), 50);
	}, [fontSize, rendition]);

	// Reading timer
	useEffect(() => {
		const interval = setInterval(() => {
			setReadingTime(Math.floor((Date.now() - startTime) / 1000));
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	// Slider navigation
	const handleSliderChange = (value: number) => {
		if (!book || !rendition) return;

		setSliderValue(value);

		const percentage = value / 100;
		const cfi = book.locations.cfiFromPercentage(percentage);

		if (cfi) {
			rendition.display(cfi);
		}
	};

	// Helpers
	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}m ${s}s`;
	};

	const getTimeLeft = (remainingPercent: number) => {
		const WORDS_PER_MINUTE = 200;
		const totalWords = 60000;
		const remainingWords = totalWords * remainingPercent;
		return Math.ceil(remainingWords / WORDS_PER_MINUTE);
	};

	const stats = [
		`Loc ${currentPage} / ${totalPages}`,
		`${(progress * 100).toFixed(1)}%`,
		`${getTimeLeft(1 - progress)} min left (book)`,
		`Reading ${formatTime(readingTime)}`,
	];

	const nextPage = () => rendition?.next();
	const prevPage = () => rendition?.prev();

	return (
		<div className="reader-container">
			<Controls
				fontSize={fontSize}
				setFontSize={setFontSize}
				nextPage={nextPage}
				prevPage={prevPage}
				isTwoPage={isTwoPage}
				setIsTwoPage={setIsTwoPage}
			/>

			{/* Top-right stats */}
			<div
				className="reading-stats"
				onClick={() => setCurrentStat((prev) => (prev + 1) % stats.length)}
			>
				{stats[currentStat]}
			</div>

			<div ref={viewerRef} className="viewer" />

			{/* Bottom slider */}
			<div className="progress-bar-container">
				<input
					type="range"
					min="0"
					max="100"
					step="0.1"
					value={sliderValue}
					onChange={(e) => handleSliderChange(Number(e.target.value))}
				/>
			</div>
		</div>
	);
}
