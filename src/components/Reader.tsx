import { useEffect, useRef, useState } from "react";
import ePub, { Rendition } from "epubjs";
import Controls from "./Controls";

export default function Reader() {
	const viewerRef = useRef<HTMLDivElement | null>(null);

	const [rendition, setRendition] = useState<Rendition | null>(null);
	const [fontSize, setFontSize] = useState(100);
	const [isTwoPage, setIsTwoPage] = useState(true);

	// 🔥 Resize using container (IMPORTANT)
	const resizeRendition = (r: Rendition) => {
		if (!viewerRef.current) return;

		r.resize(viewerRef.current.offsetWidth, viewerRef.current.offsetHeight);
	};

	useEffect(() => {
		if (!viewerRef.current) return;

		const book = ePub("/The_Books_of_Earthsea.epub");

		const r = book.renderTo(viewerRef.current, {
			width: "100%",
			height: "100%",
			flow: "paginated",
			manager: "default",
			spread: "always", // start with 2 page
			minSpreadWidth: 800,
		});

		console.log(viewerRef.current.offsetWidth);
		r.display().then(() => {
			setTimeout(() => {
				r.flow("paginated");

				r.spread("always");

				// 🔥 THIS FIXES YOUR ISSUE
				(r.themes.override as any)("html", {
					"column-width": "600px",
					"column-gap": "40px",
				});

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

		setRendition(r);

		// Keyboard nav
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") r.next();
			if (e.key === "ArrowLeft") r.prev();
		};

		window.addEventListener("keydown", handleKey);

		// Resize listener
		const handleResize = () => resizeRendition(r);
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("keydown", handleKey);
			window.removeEventListener("resize", handleResize);
			r.destroy();
		};
	}, []);

	// 🔁 Toggle single / two page (SAFE WAY)
	useEffect(() => {
		if (!rendition) return;

		rendition.spread(isTwoPage ? "always" : "none");

		setTimeout(() => {
			resizeRendition(rendition);
		}, 50);
	}, [isTwoPage, rendition]);

	// 🔤 Font size
	useEffect(() => {
		if (!rendition) return;

		rendition.themes.fontSize(`${fontSize}%`);

		setTimeout(() => {
			resizeRendition(rendition);
		}, 50);
	}, [fontSize, rendition]);

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

			<div ref={viewerRef} className="viewer" />
		</div>
	);
}
