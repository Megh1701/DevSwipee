import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ProjectForm = ({ onComplete }) => {
    const navigate = useNavigate()
    const fileRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("");

    const [projectform, setProjectform] = useState({
        thumbnail: "",
        title: "",
        description: "",
        stack: "",
        ProjectStatus: "",
        gitHubUrl: "",
        liveDemoUrl: "",
    });


    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            setIsLoading(true)
            const res = await fetch("http://localhost:3000/api/upload/thumbnail", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setProjectform((prev) => ({ ...prev, thumbnail: data.thumbnailUrl }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectform((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async () => {
        try {
            setError("");

            if (projectform.description.trim().length < 150) {
                toast.error("Project description must be at least 150 characters");
                return;
            }

            if (!projectform.title.trim()) {
                toast.error("Project title is required");
                return;
            }

            if (!projectform.ProjectStatus) {
                toast.error("Please select project status");
                return;
            }

            setIsLoading(true);

            const formData = new FormData();
            Object.entries(projectform).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await fetch("http://localhost:3000/api/project", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            // ❌ backend error (mongoose / auth / validation)
            if (!res.ok) {
                toast.error(data.message || "Project creation failed");
                setIsLoading(false);
                return;
            }

            // ✅ success
            toast.success("Project created successfully 🚀");

            localStorage.setItem("projectDone", "true");
            onComplete();
            navigate("/home");

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-3xl border border-neutral-700 rounded-3xl p-4 sm:p-6 lg:p-8 bg-neutral-950"
            >
                <div className="flex flex-col gap-6">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div
                            onClick={() => {
                                if (!isLoading && projectform.thumbnail === "") fileRef.current.click();
                            }}
                            className={`border border-neutral-700 rounded-2xl p-4 min-h-[200px] flex items-center justify-center cursor-pointer ${isLoading ? "cursor-not-allowed opacity-60" : ""
                                }`}  >
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-8 w-8 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-neutral-400 text-center">
                                        Uploading… definitely faster than a government website 😁
                                    </p>
                                </div>
                            ) : projectform.thumbnail ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={projectform.thumbnail}
                                        alt="Project Thumbnail"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProjectform((prev) => ({ ...prev, thumbnail: "" }));
                                        }}
                                        className="absolute top-2 right-2 bg-black cursor-pointer text-white px-2 py-1 rounded-full text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <ImageUp className="h-10 w-10 text-neutral-500" />
                                    <p className="text-sm text-neutral-400">
                                        Upload an image that represents your project
                                    </p>
                                </div>
                            )}


                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <Label className="text-white">Title :</Label>
                                <Input
                                    name="title"
                                    placeholder="Project name"
                                    value={projectform.title}
                                    onChange={handleChange}
                                    className="bg-neutral-900 border-neutral-700 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white">Stack :</Label>
                                <Input
                                    name="stack"
                                    placeholder="React, Node, MongoDB"
                                    value={projectform.stack}
                                    onChange={handleChange}
                                    className="bg-neutral-900 border-neutral-700 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white">Project Status :</Label>
                                <Select
                                    value={projectform.ProjectStatus}
                                    onValueChange={(value) =>
                                        setProjectform((prev) => ({ ...prev, ProjectStatus: value }))
                                    }
                                >
                                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                                        <SelectValue placeholder="Select project status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="idea">Idea</SelectItem>
                                        <SelectItem value="inProgress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white">Project Description :</Label>
                        <Textarea
                            name="description"
                            placeholder="Describe your project..."
                            value={projectform.description}
                            onChange={handleChange}
                            className="min-h-[100px] sm:min-h-[140px] lg:min-h-[180px] resize-none bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 rounded-2xl p-4"
                        />
                    </div>
                    <div className="flex gap-4 items-center w-full">
                        <div className="space-y-2 w-1/2">
                            <Label className="text-white">Github repo :</Label>
                            <Input
                                name="gitHubUrl"
                                placeholder="Ex:https://github.com/your-project"
                                value={projectform.gitHubUrl}
                                onChange={handleChange}
                                className="bg-neutral-900 border-neutral-700 text-white"
                            />
                        </div>
                        <div className="space-y-2 w-1/2 ">
                            <Label className="text-white">Live link :</Label>
                            <Input
                                name="liveDemoUrl"
                                placeholder="https://example.com"
                                value={projectform.liveDemoUrl}
                                onChange={handleChange}
                                className="bg-neutral-900 border-neutral-700 text-white"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full rounded-xl bg-neutral-200 text-black cursor-pointer hover:bg-neutral-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 font-semibold h-12 text-base"
                    >
                        Create Project
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectForm;
