import axios from "axios";

export default async function Trending() {
  const res = await axios.get(
    `https://api.themoviedb.org/3/trending/movie/day?api_key=1428e09fe38be9df57355a8d6198d916`
  );

  const data = res.data;

  // Add a delay to ensure that the Suspense fallback is shown
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div className="bg-black-200">
      <li>{data.results[0].title}</li>
    </div>
  );
}

