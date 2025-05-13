import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-6">
      <h1 className="text-4xl font-bold text-emerald-700 mb-4">
        Welcome to HerSafety
      </h1>
      <p className="mb-6 text-center max-w-md text-gray-700">
        A platform for reporting and visualizing unsafe locations to ensure a
        safer environment.
      </p>
      <Link href={{ pathname: "/report", query: { page: "1" } }}>
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded">
          Report a Location
        </button>
      </Link>
    </main>
  );
}
