"use client";

export default function Gallery() {
  const images = [
    { src: "/gallery/event1.jpg", alt: "Annual General Meeting" },
    { src: "/gallery/event2.jpg", alt: "Independence Day Celebration" },
    { src: "/gallery/event3.jpg", alt: "Cultural Program" },
    { src: "/gallery/event4.jpg", alt: "Staff Picnic" },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
          Gallery & Events
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl shadow-lg hover:scale-105 transform transition"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-56 object-cover"
              />
              <p className="text-center text-gray-700 py-2">{img.alt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
