// app/member/settings/page.jsx
import Link from "next/link";
import { Cog } from "lucide-react"; // ✅ fixed icon import

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-red-50 py-12">
      <div className="w-full max-w-3xl px-6  ">
        <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
              <Cog className="w-10 h-10 text-indigo-600" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account preferences and personal settings.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-10 ">
            <div className="rounded-lg border border-dashed bg-gradient-to-r from-indigo-100 to-pink-200  border-gray-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                User-level settings and preferences coming soon...
              </h2>

              <p className="mx-auto max-w-xl text-sm text-gray-600 mb-6">
                We're building a simple, secure settings area where you'll be
                able to manage profile details, security options, notification
                preferences, and connected accounts. Stay tuned — exciting
                updates are on the way!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/member/profile"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
                >
                  Go to Profile
                </Link>

                <a
                  href="#"
                  // onClick={(e) => e.preventDefault()}
                  className="text-sm text-indigo-600 hover:underline"
                  aria-disabled="true"
                >
                  Request early access
                </a>
              </div>
            </div>

            {/* Decorative footer */}
            <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
              <span>
                We value your feedback — contact support if you'd like to
                contribute ideas.
              </span>
            </div>
          </div>
        </div>

        {/* subtle footer note */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <span>Settings UI — placeholder view</span>
        </div>
      </div>
    </div>
  );
}
