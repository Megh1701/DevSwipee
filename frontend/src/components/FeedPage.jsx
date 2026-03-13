import React, { useState } from "react";
import Filter from "./Filter";
import CardFeed from "./CardFeed";

const FeedPage = ({ light }) => {
    const [filters, setFilters] = useState({
        distance: 50,
        gender: "",
        domain: "",
        city: ""
    });

    return (
        <div className="flex flex-col items-center gap-6">
            <Filter light={light} onApply={setFilters} />
            <CardFeed light={light} filters={filters} />
        </div>
    );
};

export default FeedPage;