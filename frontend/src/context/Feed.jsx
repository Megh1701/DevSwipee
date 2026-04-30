import { createContext, useContext, useState } from "react";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    distance: 50,
    gender: "",
    domain: "",
    city: ""
  });

  return (
    <FeedContext.Provider value={{ filters, setFilters }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => useContext(FeedContext);