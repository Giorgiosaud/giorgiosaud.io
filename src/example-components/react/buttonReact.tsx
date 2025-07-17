import { useEffect, useState } from "react";
export default function MyApp({ title = "Increment Count React." }) {
	const [count, setCount] = useState(0);
	const handleClick = () => setCount((count) => count + 1);
	useEffect(() => {
		setTimeout(() => setCount((count) => count + 1), 1000);
	}, []);
	return (
		<div
			style={{
				border: "blue 2px solid ",
				padding: "1rem",
				margin: "3rem",
			}}
		>
			<h3>
				React Button was clicked {count} {count === 1 ? "time" : "times"}
			</h3>
			<button
				style={{
					background: "blue",
					color: "white",
					fontWeight: "bold",
					padding: "0.5rem 1rem",
					borderRadius: "10px",
					border: "blue 2px solid",
				}}
				onClick={handleClick}
			>
				{title}
			</button>
		</div>
	);
}
