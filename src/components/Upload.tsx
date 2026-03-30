type UploadProps = {
	setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export default function Upload({ setFile }: UploadProps) {
	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) return;

		if (!file.name.endsWith(".epub")) {
			alert("Only EPUB files are supported");
			return;
		}

		setFile(file);
	};

	return (
		<div style={{ textAlign: "center", paddingTop: "20%" }}>
			<h1>📚 Upload EPUB</h1>
			<input type="file" accept=".epub" onChange={handleUpload} />
		</div>
	);
}
