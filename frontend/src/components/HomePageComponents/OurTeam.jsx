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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="mx-auto bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl p-4 sm:p-6 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          OUR TEAM
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3 sm:gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center bg-white/60 backdrop-blur-md rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-full shadow mb-2 border border-indigo-200"
              />
              <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-800 leading-tight uppercase">
                {member.name}
              </h2>
              <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-600">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
