import { useEffect, useState } from "react";
export default function MyApp({ title = "Increment Count React." }) {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount((count) => count + 1);
  useEffect(() => {
    setTimeout(() => setCount((count) => count + 1), 1000);
  }, []);
  return (
    <div className="border-blue-400 border-solid border-2 p-1 m-3">
      <h3>
        React Button was clicked {count} {count === 1 ? "time" : "times"}
      </h3>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
      >
        {title}
      </button>
    </div>
  );
}
