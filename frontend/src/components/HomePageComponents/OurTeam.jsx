"use client";

export default function OurTeam() {
  const members = [
    {
      id: 1,
      name: "SRI HARISHA SHETTY",
      role: "Honorary President, Principal",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1760328567/vehicles/qiekhbbvniyqenwlwxkb.jpg",
    },
    {
      id: 2,
      name: "SRI DEVARAJU D",
      role: "President",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1759728823/vehicles/sps7jyakbpki3cy23dqk.jpg",
    },
    {
      id: 3,
      name: "SRI ISHWARA K",
      role: "Vice President",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1761647572/vehicles/clwhxxzmxh9qkr89ospg.jpg",
    },
    {
      id: 4,
      name: "SRI DEVARAJA NAIK",
      role: "Honorary Secretary",
      image:
        "https://res.cloudinary.com/dnreqxbdw/image/upload/v1759921514/kpt%20society%20users/dum3fegiyt5sjkamdbl3.jpg",
    },
    {
      id: 5,
      name: "SRI SATHEESHA K M",
      role: "Director",
      image:
        "https://res.cloudinary.com/dnreqxbdw/image/upload/v1760254840/kpt%20society%20users/wzf5xsazcbfuxtyse4v9.jpg",
    },
    {
      id: 6,
      name: "SRI DR. SATISH N H",
      role: "Director",
      image:
        "https://res.cloudinary.com/dnreqxbdw/image/upload/v1760253756/kpt%20society%20users/qbxqzp4jouwnmcomyykv.jpg",
    },
    {
      id: 7,
      name: "SRI RAVINDRA MAHABALESHWAR KENI",
      role: "Director",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1758952881/vehicles/jwef9mrd7pegqoanljpo.jpg",
    },
    {
      id: 8,
      name: "SRI KUMARASWAMY H",
      role: "Director",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1761647638/vehicles/wmpxuw7iaqdokede61yt.jpg",
    },
    {
      id: 9,
      name: "SRI BHAVANI SHANKAR G.K.",
      role: "Director",
      image:
        "https://res.cloudinary.com/demo/image/upload/v1690000009/kpt/bhavani_shankar.jpg",
    },
    {
      id: 10,
      name: "SRI KANNAYYA",
      role: "Director",
      image:
        "https://res.cloudinary.com/demo/image/upload/v1690000010/kpt/krishnayya.jpg",
    },
    {
      id: 11,
      name: "SRI P D TALAWAR",
      role: "Director",
      image:
        "https://res.cloudinary.com/dnreqxbdw/image/upload/v1760255030/kpt%20society%20users/xnh4lttg3g02fjh5ot5l.jpg",
    },
    {
      id: 12,
      name: "SRI PAVITHRA KUMARA M",
      role: "Director",
      image:
        "https://res.cloudinary.com/dnreqxbdw/image/upload/v1760254970/kpt%20society%20users/jpwwlj61lhjbrw1memls.jpg",
    },
    {
      id: 13,
      name: "SMT. LEELAVATHI R",
      role: "Director",
      image:
        "https://res.cloudinary.com/dnreqxbdw/image/upload/v1760254982/kpt%20society%20users/utiuryxzsx2k0zunkpxf.png",
    },
    {
      id: 14,
      name: "SMT. VIDYA K",
      role: "Director",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1761887939/vehicles/ltndxbnqctfig0rdd9me.jpg",
    },
    {
      id: 15,
      name: "SMT. CHANDRIKA B",
      role: "Director",
      image:
        "https://res.cloudinary.com/dj4gfhf9n/image/upload/v1761370460/vehicles/pknwfu1ng2zmd0gl0wlh.jpg",
    },
  ];

  const leaders = members.slice(0, 4);
  const directors = members.slice(4);

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-b from-transparent via-purple-50/70 to-transparent">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
            Leadership
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900">
            Our Team
          </h2>
          <p className="mt-3 text-gray-600">
            The board guiding the society on behalf of its members.
          </p>
        </div>

        {/* Office bearers */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {leaders.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center rounded-3xl bg-white p-4 sm:p-6 shadow-soft ring-1 ring-gray-100"
            >
              <div className="p-1 rounded-full brand-gradient">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-full ring-4 ring-white bg-purple-50"
                />
              </div>
              <h3 className="mt-4 text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                {member.name}
              </h3>
              <p className="mt-1.5 inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-purple-700">
                {member.role}
              </p>
            </div>
          ))}
        </div>

        {/* Directors */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {directors.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center rounded-2xl bg-white/80 p-3 sm:p-4 ring-1 ring-gray-100 hover:ring-pink-200 hover:shadow-soft transition"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full ring-2 ring-pink-200 bg-pink-50"
              />
              <h3 className="mt-3 text-[11px] sm:text-xs font-semibold text-gray-800 leading-tight">
                {member.name}
              </h3>
              <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
