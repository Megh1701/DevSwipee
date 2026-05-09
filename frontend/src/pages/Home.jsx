import React, { useState } from "react";
import Filter from "../components/Filter.jsx";
import CardFeed from "../components/CardFeed.jsx";
import SwipeButton from "../components/SwipeButton.jsx";

const Home = ({ light }) => {

  const [filters, setFilters] = useState({
    distance: 50,
    gender: "",
    domain: "",
    city: ""
  });

  return (
    <>
      <div className="flex h-full w-full overflow-x-hidden bg-bg-dark">

        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-3 pb-6 pt-3 sm:gap-8 sm:px-4 md:gap-10 md:px-6 md:pt-6">

          {/* FILTER */}
          <Filter light={light} onApply={setFilters} />

          {/* CARD FEED */}
          <CardFeed light={light} />

          {/* SWIPE BUTTONS */}
          <SwipeButton light={light} />

        </div>

      </div>
    </>
  );
};

export default Home;