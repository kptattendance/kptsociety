"use client";

export default function Gallery() {
  const images = [
    { src: "/1.jpg", alt: "Annual General Meeting" },
    { src: "/2.jpg", alt: "Annual General Meeting -2025" },
    { src: "/3.jpg", alt: "Annual General Meeting -2025" },
    { src: "/2.jpg", alt: "Annual General Meeting -2025" },
  ];

  return (
    <section className="px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            Moments
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900">
            Gallery & Events
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {images.map((img, index) => (
            <figure
              key={index}
              className="group relative overflow-hidden rounded-3xl shadow-soft ring-1 ring-gray-100 bg-white"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-60 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <figcaption className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/85 backdrop-blur-md px-3 py-2 text-sm font-medium text-gray-800">
                {img.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
