export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-[28px] bg-white p-8 sm:p-10 shadow-soft ring-1 ring-pink-100">
        <div className="mx-auto mb-5 grid place-items-center w-16 h-16 rounded-2xl bg-pink-100 text-3xl">
          🚫
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page.
        </p>
        <a
          href="/"
          className="inline-block bg-gray-900 text-white font-semibold px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}
