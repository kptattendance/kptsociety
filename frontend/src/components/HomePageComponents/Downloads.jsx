"use client";

export default function Downloads() {
  const files = [
    {
      name: "Membership Application Form",
      link: "/downloads/membership-form.pdf",
    },
    {
      name: "Loan Application Form",
      link: "/downloads/loan-form.pdf",
    },
    {
      name: "Fixed Deposit Policy",
      link: "/downloads/fd-policy.pdf",
    },
    {
      name: "Recurring Deposit Circular",
      link: "/downloads/rd-circular.pdf",
    },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-600 to-pink-600 bg-clip-text text-transparent">
          Downloads & Forms
        </h1>
        <ul className="space-y-4">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-gray-800 font-medium">{file.name}</span>
              <a
                href={file.link}
                target="_blank"
                className="text-white bg-gradient-to-r from-yellow-500 to-pink-500 px-4 py-2 rounded-lg shadow hover:opacity-90"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
