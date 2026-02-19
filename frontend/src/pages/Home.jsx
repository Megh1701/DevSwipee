import React from "react";
import Sidebar from "../components/sidebar";
import Hero from "../components/Filter.jsx";
import Filter from "../components/Filter.jsx";
import ProjectCard from '../components/ProjectCard.jsx';
import CardFeed from "../components/CardFeed.jsx";
import SwipeButton from "../components/SwipeButton.jsx";
const Home = ({ light }) => {
    return (
        <>
            <div className="w-full h-full bg-bg-dark flex">

                <div className="relative flex-1 flex justify-center items-center flex-col gap-10">

                    <Filter light={light}></Filter>
                    <CardFeed light={light} />
                    <SwipeButton light={light} ></SwipeButton>
                </div>

            </div>
        </>
    );

};

export default Home;