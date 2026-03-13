import React, { useState } from "react";
import Sidebar from "../components/sidebar";
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
      <div className="w-full h-full bg-bg-dark flex">

        <div className="relative flex-1 flex justify-center items-center flex-col gap-10">

          {/* FILTER */}
          <Filter light={light} onApply={setFilters} />

          {/* CARD FEED */}
          <CardFeed light={light} filters={filters} />

          {/* SWIPE BUTTONS */}
          <SwipeButton light={light} />

        </div>

      </div>
    </>
  );
};

export default Home;