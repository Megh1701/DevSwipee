import { useEffect, useState } from "react";
import api from "@/lib/axios";


const Match = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

        const fetchReqs = async () => {
            try {
                const res = await api.get("/matches/recieved")
                setRequests(res.data)
            } catch (error) {
                console.error(err);
            }
            finally {
                setLoading(false)
            }

        }
        fetchReqs()
    }, [])
    return (
        <>

            return (
            <div>
                <h2>People who liked my project</h2>

                {requests.map(req => (
                    <div key={req._id} className="border p-2 rounded my-2">
                        <p>
                            <strong>{req.createdBy.name}</strong> liked your project
                        </p>
                        <p>Email: {req.createdBy.email}</p>
                    </div>
                ))}
            </div>
            );

            {/* <div className="flex justify-center h-full flex-col items-center">
                <div className="h-[15%] w-2/3 border border-[var(--color-border-dark)] rounded-2xl m-4">

                </div>
                <div className="h-[15%] w-2/3 border border-[var(--color-border-dark)] rounded-2xl m-4">

                </div>
                <div className="h-[15%] w-2/3 border border-[var(--color-border-dark)] rounded-2xl m-4">

                </div>
                <div className="h-[15%] w-2/3 border border-[var(--color-border-dark)] rounded-2xl m-4">

                </div>
            </div> */}
        </>
    );

}

export default Match;