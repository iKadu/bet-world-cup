import { ImageResponse } from "next/og";

export const alt = "WC26 Predictor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#0a0d12",
				backgroundImage:
					"radial-gradient(circle at 50% 35%, rgba(194,242,61,0.18), rgba(10,13,18,0) 60%)",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: 100,
					height: 100,
					borderRadius: 20,
					backgroundColor: "#c2f23d",
					color: "#0a0d12",
					fontSize: 58,
					fontWeight: 800,
					marginBottom: 36,
				}}
			>
				W
			</div>
			<div
				style={{
					display: "flex",
					color: "#f2f4f7",
					fontSize: 78,
					fontWeight: 800,
					letterSpacing: 4,
					textTransform: "uppercase",
				}}
			>
				WC26 Predictor
			</div>
			<div
				style={{
					display: "flex",
					marginTop: 22,
					color: "#c2f23d",
					fontSize: 30,
					fontWeight: 600,
					letterSpacing: 2,
					textTransform: "uppercase",
				}}
			>
				Bolão da Copa do Mundo 2026
			</div>
		</div>,
		{ ...size },
	);
}
