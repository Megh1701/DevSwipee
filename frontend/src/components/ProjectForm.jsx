import { useState } from "react";
import { motion, spring } from "framer-motion"


const ProjectForm = () => {
    const [projectform, setProjectform] = useState({
        thumbnail: "",
        title: "",
        description: "",
        stack: "",
        gitHubUrl: "",
        liveDemoUrl: ""
    });

    <>
<div className="bg-black h-screen w-full">
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{type:"spring",damping:"5",stiffness:"250"}}
            className="border border-neutral-500 rounded-4xl p-4 h-100 w-100"
        >

        </motion.div>
</div>
    </>
}

export default ProjectForm;