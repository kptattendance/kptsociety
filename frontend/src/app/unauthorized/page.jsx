export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-3">Access Denied 🚫</h1>
      <p className="text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>
      <a
        href="/"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Go Back Home
      </a>
    </div>
  );
}
