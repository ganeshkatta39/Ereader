type Props = {
	fontSize: number;
	setFontSize: (size: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	isTwoPage: boolean;
	setIsTwoPage: (val: boolean) => void;
};

export default function Controls({
	fontSize,
	setFontSize,
	nextPage,
	prevPage,
	isTwoPage,
	setIsTwoPage,
}: Props) {
	return (
		<div className="controls">
			<button onClick={() => setFontSize(fontSize - 10)}>A-</button>
			<button onClick={() => setFontSize(fontSize + 10)}>A+</button>

			<button onClick={prevPage}>⬅ Prev</button>
			<button onClick={nextPage}>Next ➡</button>

			<button onClick={() => setIsTwoPage(!isTwoPage)}>
				{isTwoPage ? "Single Page" : "Two Page"}
			</button>
		</div>
	);
}