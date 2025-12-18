// CardFeed.jsx
import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";

const fetchUsersBatch = (page) => {
  const start = page * 10;
  const end = start + 10;
  const dummy = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    avatar: `https://picsum.photos/300?random=${i + 1}`,
  }));

  return dummy.slice(start, end);
};

const CardFeed = ({profile}) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setUsers(fetchUsersBatch(0));
  }, []);

  const handleSwipe = (id) => {
    setUsers((prev) => {
   
      const updated = prev.filter((u) => u.id !== id);

      if (updated.length < 3) {
        const nextBatch = fetchUsersBatch(page + 1);
        setPage((p) => p + 1);
        return [...updated, ...nextBatch];
      }

      return updated;
    });
  };

  // only show top 3 cards
  const visibleCards = users.slice(0, 3);

  return (
     <div className="relative w-full h-2/4 flex justify-center items-center">
      {visibleCards
        .slice()
        .reverse()
        .map((user, idx) => (
          <ProjectCard
            key={user.id}
            user={user}
            index={idx}
            profile={profile}
            onSwipe={handleSwipe}
          />
        ))}
    </div>
  );
};

export default CardFeed;
