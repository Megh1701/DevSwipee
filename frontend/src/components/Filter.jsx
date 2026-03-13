import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Filter = ({ light, onApply }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    distance: 50,
    gender: "",
    domain: "",
    city: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

 
  const applyFilter = () => {
  if (typeof onApply === "function") {
    onApply(filters);
  } else {
    console.error("onApply is not passed to Filter");
  }

  setShowFilter(false);
};
console.log("onApply:", onApply);
  // Theme-based styles - Pure Black & White
  const barBg = light ? "bg-white border-gray-200" : "bg-black border-gray-800";
  const barText = light ? "text-black" : "text-white";
  const barHover = light ? "hover:bg-gray-100" : "hover:bg-neutral-900";
  const barShadow = light 
    ? "shadow-sm hover:shadow-md" 
    : "shadow-2xl hover:shadow-2xl";

  const dropdownBg = light 
    ? "bg-white border-gray-200 shadow-xl" 
    : "bg-black border-gray-800 shadow-2xl";
  const dropdownText = light ? "text-black" : "text-white";
  const labelText = light ? "text-gray-700" : "text-gray-300";
  const inputBg = light ? "bg-gray-100 border-gray-300" : "bg-neutral-900 border-gray-700";
  const inputPlaceholder = light ? "placeholder-gray-500" : "placeholder-gray-600";
  const inputFocus = light 
    ? "focus:border-black focus:ring-black/10" 
    : "focus:border-white focus:ring-white/20";

  const containerVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -12,
      scale: 0.96,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.35,
        delay: i * 0.08,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  const buttonVariants = {
    hover: { 
      x: 2,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.92 }
  };

  return (
    <div className="relative">
      {/* FILTER BAR */}
      <motion.div
        className={`flex items-center gap-1 border rounded-xl overflow-hidden 
          ${barBg} ${barText} ${barShadow} transition-shadow duration-300`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={{ 
          boxShadow: light 
            ? "0 12px 24px rgba(0, 0, 0, 0.08)" 
            : "0 20px 40px rgba(0, 0, 0, 0.4)"
        }}
      >
        {/* FILTER BUTTON */}
        <motion.button
          onClick={() => setShowFilter(!showFilter)}
          className={`px-5 py-3 flex items-center gap-2.5 ${barHover} 
            transition-all duration-200 relative group`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.span
            animate={{ rotate: showFilter ? 90 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="inline-block text-lg"
          >
            ⚙️
          </motion.span>
          <span className="text-sm font-semibold">Filter</span>
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 ${light ? "bg-black" : "bg-white"}`}
            animate={{ width: showFilter ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <div className={`h-6 w-px ${light ? "bg-gray-300" : "bg-gray-700"} opacity-40`} />

        <motion.button
          className={`px-5 py-3 flex items-center gap-2.5 ${barHover} 
            transition-all duration-200`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-lg"
          >
            ✨
          </motion.span>
          <span className="text-sm font-semibold">Popular</span>
        </motion.button>
      </motion.div>

      {/* BACKDROP */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowFilter(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* FILTER DROPDOWN */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute top-16 -left-20
              ${dropdownBg} ${dropdownText}
              p-6 rounded-xl w-96 border
              backdrop-blur-xl z-[100]`}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-base font-bold mb-5 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Refine Your Search
              </h3>
              <div className={`h-px w-full ${light ? "bg-gray-200" : "bg-gray-800"} mb-5`} />
            </motion.div>

            {/* DISTANCE */}
          {/* DISTANCE */}
<motion.div
  custom={0}
  variants={itemVariants}
  initial="hidden"
  animate="visible"
  className="mb-5"
>
  <label className={`text-xs font-bold uppercase tracking-wider ${labelText} block mb-2.5`}>
    Max Distance: {filters.distance} km
  </label>

  <input
    type="range"
    name="distance"
    min={0}
    max={100}
    value={filters.distance}
    onChange={(e) =>
      setFilters((prev) => ({
        ...prev,
        distance: Number(e.target.value)
      }))
    }
    className="w-full h-1.5 cursor-pointer appearance-none rounded-lg
      [&::-webkit-slider-runnable-track]:h-1.5
      [&::-webkit-slider-runnable-track]:rounded-lg
      [&::-webkit-slider-runnable-track]:bg-gradient-to-r
      [&::-webkit-slider-runnable-track]:from-blue-500
      [&::-webkit-slider-runnable-track]:to-[#c3c3c3]
      [&::-webkit-slider-runnable-track]:bg-[length:var(--range-progress)_100%]
      [&::-webkit-slider-runnable-track]:bg-no-repeat
      [&::-webkit-slider-thumb]:appearance-none
      [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:w-2
      [&::-webkit-slider-thumb]:rounded-2xl
      [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
      [&::-webkit-slider-thumb]:mt-[-6px]"
    style={{
      "--range-progress": `${filters.distance}%`,
      "--thumb-color": light ? "black" : "white"
    }}
  />
</motion.div>
            {/* GENDER */}
            <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible" className="mb-5">
              <label className={`text-xs font-bold uppercase tracking-wider ${labelText} block mb-2.5`}>
                Gender
              </label>
              <motion.select
                name="gender"
                value={filters.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-lg ${inputBg} border
                  hover:border-opacity-60 ${inputFocus} outline-none 
                  transition-all duration-200 text-sm font-medium ${dropdownText}`}
                whileFocus={{ scale: 1.02 }}
              >
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </motion.select>
            </motion.div>

            {/* DOMAIN */}
            <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible" className="mb-5">
              <label className={`text-xs font-bold uppercase tracking-wider ${labelText} block mb-2.5`}>
                Domain
              </label>
              <motion.input
                type="text"
                name="domain"
                value={filters.domain}
                onChange={handleChange}
                placeholder="e.g., Technology"
                className={`w-full px-4 py-2.5 rounded-lg ${inputBg} border
                  hover:border-opacity-60 ${inputFocus} outline-none 
                  transition-all duration-200 text-sm font-medium ${inputPlaceholder}`}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* CITY */}
            <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible" className="mb-6">
              <label className={`text-xs font-bold uppercase tracking-wider ${labelText} block mb-2.5`}>
                City
              </label>
              <motion.input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleChange}
                placeholder="e.g., San Francisco"
                className={`w-full px-4 py-2.5 rounded-lg ${inputBg} border
                  hover:border-opacity-60 ${inputFocus} outline-none 
                  transition-all duration-200 text-sm font-medium ${inputPlaceholder}`}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* DIVIDER */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 }}
              className={`h-px w-full ${light ? "bg-gray-200" : "bg-gray-800"} mb-5`}
            />

            {/* APPLY BUTTON */}
            <motion.button
              onClick={applyFilter}
              custom={4}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className={`w-full ${light ? "bg-black hover:bg-neutral-600 text-white" : "bg-white hover:bg-gray-100 text-black"} 
                px-4 py-3 rounded-lg font-bold text-sm cursor-pointer
                transition-all duration-200 shadow-lg hover:shadow-xl`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <motion.div
                className="flex items-center justify-center gap-2 "
                
              >
                <span>Apply Filters</span>
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Filter;
