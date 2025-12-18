import React from "react";
import { Link } from "react-router-dom";



const Sidebar = ({avatar}) => {
    return (
        <>

            <div className="flex flex-col gap-6 p-4 bg-dark w-1/4 h-screen justify-start items-center pt-36 border-r border-neutral-600 p-6 border-dashed">
                <div className="h-28 w-28 rounded-full border border-neutral-500 overflow-hidden">
                    <img        
                        src={avatar}
                        alt="first-image"
                        className="w-full h-full object-cover"
                    />

                </div>

                <Link to="/home">
                    <button className="overflow-hidden cursor-pointer relative rounded-3xl px-4 py-2 border border-neutral-700 flex justify-start  gap-3 w-36 items-center">
                        <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 17.1245V10.1245C11 9.89248 10.9078 9.66992 10.7437 9.50583C10.5796 9.34173 10.3571 9.24954 10.125 9.24954H6.625C6.39294 9.24954 6.17038 9.34173 6.00628 9.50583C5.84219 9.66992 5.75 9.89248 5.75 10.1245V17.1245M0.5 7.49954C0.499939 7.24498 0.555417 6.99346 0.662564 6.76255C0.769711 6.53163 0.925948 6.32687 1.12038 6.16254L7.24537 0.91342C7.56124 0.646465 7.96144 0.5 8.375 0.5C8.78856 0.5 9.18876 0.646465 9.50463 0.91342L15.6296 6.16254C15.8241 6.32687 15.9803 6.53163 16.0874 6.76255C16.1946 6.99346 16.2501 7.24498 16.25 7.49954V15.3745C16.25 15.8387 16.0656 16.2838 15.7374 16.612C15.4092 16.9402 14.9641 17.1245 14.5 17.1245H2.25C1.78587 17.1245 1.34075 16.9402 1.01256 16.612C0.684374 16.2838 0.5 15.8387 0.5 15.3745V7.49954Z" stroke="#B6B6B6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div className="absolute inset-x-0 h-px -bottom-0 w-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent"></div>
                        <div className="text-text-dark">Home</div>
                    </button>
                </Link>


                <Link to="/matches">
                    <button className="relative rounded-3xl px-4 py-2 border border-neutral-700 flex justify-start  gap-3 w-36 items-center overflow-hidden cursor-pointer">

                        <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8 10.2778C17.141 8.98 18.5 7.42444 18.5 5.38889C18.5 4.09227 17.9785 2.84877 17.0502 1.93192C16.1219 1.01508 14.8628 0.5 13.55 0.5C11.966 0.5 10.85 0.944444 9.5 2.27778C8.15 0.944444 7.034 0.5 5.45 0.5C4.13718 0.5 2.87813 1.01508 1.94982 1.93192C1.02152 2.84877 0.5 4.09227 0.5 5.38889C0.5 7.43333 1.85 8.98889 3.2 10.2778L9.5 16.5L15.8 10.2778Z" stroke="#F66C6C" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div className="absolute inset-x-0 h-px -bottom-0 w-full bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>

                        <div className="text-text-dark">Match</div>

                    </button>

                </Link>


                <Link to="/messages">
                    <button className="relative rounded-3xl px-4 py-2 border border-neutral-700 flex justify-start  gap-3 w-36 items-center overflow-hidden cursor-pointer">

                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.41337 11.5877C9.22226 11.397 8.99449 11.2469 8.74381 11.1465L0.813805 7.9665C0.719122 7.92851 0.638327 7.86246 0.582263 7.77722C0.5262 7.69199 0.497552 7.59164 0.500164 7.48966C0.502776 7.38767 0.536524 7.28892 0.596877 7.20667C0.657231 7.12442 0.741302 7.06259 0.837805 7.0295L19.8378 0.529498C19.9264 0.497494 20.0223 0.491386 20.1143 0.511889C20.2062 0.532393 20.2904 0.578659 20.357 0.645275C20.4236 0.711891 20.4699 0.796101 20.4904 0.888052C20.5109 0.980003 20.5048 1.07589 20.4728 1.1645L13.9728 20.1645C13.9397 20.261 13.8779 20.3451 13.7956 20.4054C13.7134 20.4658 13.6146 20.4995 13.5126 20.5021C13.4107 20.5048 13.3103 20.4761 13.2251 20.42C13.1398 20.364 13.0738 20.2832 13.0358 20.1885L9.85581 12.2565C9.75499 12.006 9.60448 11.7785 9.41337 11.5877ZM9.41337 11.5877L20.3538 0.649498" stroke="#00C2CB" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div className="absolute inset-x-0 h-px -bottom-0 w-full bg-gradient-to-r from-transparent via-sky-500 to-transparent"></div>

                        <div className="text-text-dark">Messages</div>

                    </button>

                </Link>


                <Link to="/requests">
                    <button className="relative rounded-3xl px-4 py-2 border border-neutral-700 flex justify-start  gap-3 w-36 items-center overflow-hidden cursor-pointer">

                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 4.5V10.5L12.5 14.5M20.5 10.5C20.5 16.0228 16.0228 20.5 10.5 20.5C4.97715 20.5 0.5 16.0228 0.5 10.5C0.5 4.97715 4.97715 0.5 10.5 0.5C16.0228 0.5 20.5 4.97715 20.5 10.5Z" stroke="#FFD36E" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div className="absolute inset-x-0 h-px -bottom-0 w-full bg-gradient-to-r from-transparent via-yellow-200 to-transparent"></div>

                        <div className="text-text-dark">Requests</div>

                    </button>
                </Link>

            </div>

        </>
    );
}
export default Sidebar;
