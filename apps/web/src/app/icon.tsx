import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 7,
				backgroundColor: "#c2f23d",
				color: "#0a0d12",
				fontSize: 20,
				fontWeight: 800,
				fontFamily: "sans-serif",
			}}
		>
			W
		</div>,
		{ ...size },
	);
}
