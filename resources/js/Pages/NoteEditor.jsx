import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { htmlToText } from "html-to-text";
import { toast } from "react-toastify";
import Editor from "../Pages/Components/Editor";

export default function NoteEditor({ note: initialNote }) {
    const [note, setNote] = useState(
        initialNote || { title: "Untitled", content: "" }
    );
    const [title, setTitle] = useState(note.title || "Untitled");
    const [content, setContent] = useState(note.content || "");
    const [summary, setSummary] = useState("");
    const [tags, setTags] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);

    // Sync local state when initialNote changes
    useEffect(() => {
        setTitle(initialNote?.title || "Untitled");
        setContent(initialNote?.content || "");
        setNote(initialNote || { title: "Untitled", content: "" });
    }, [initialNote]);

    // Auto-save on title or content change
    useEffect(() => {
        if (!note.id) return; // Skip if no note ID (new note not yet created)

        const timer = setTimeout(() => {
            const plainContent = htmlToText(content, { wordwrap: false });
            Inertia.put(
                `/notes/${note.id}`,
                { title, content: plainContent },
                {
                    onError: (errors) => {
                        console.error("Failed to save note:", errors);
                        toast.error("Failed to save note.");
                    },
                    onSuccess: () => {
                        console.log("Note saved successfully");
                        toast.success("Note auto-saved"); // Optional: Add toast for auto-save
                    },
                }
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content, note.id]);

    const handleSubmit = () => {
        const plainContent = htmlToText(content, { wordwrap: false });
        if (note.id) {
            // Update existing note
            Inertia.put(
                `/notes/${note.id}`,
                { title, content: plainContent },
                {
                    onError: (errors) => {
                        console.error("Failed to update note:", errors);
                        toast.error("Failed to update note.");
                    },
                    onSuccess: () => {
                        toast.success("Note updated successfully");
                    },
                }
            );
        } else {
            // Create new note
            Inertia.post(
                "/notes",
                { title, content: plainContent },
                {
                    onSuccess: (page) => {
                        const newNote = page.props.note; // Expect note in response
                        if (newNote) {
                            setNote(newNote);
                            setTitle(newNote.title);
                            setContent(newNote.content);
                            toast.success("Note created successfully");
                            // Optionally redirect to the new note's editor page
                            Inertia.visit(`/notes/${newNote.id}`);
                        }
                    },
                    onError: (errors) => {
                        console.error("Failed to create note:", errors);
                        toast.error("Failed to create note.");
                    },
                }
            );
        }
    };

    const handleSummarize = () => {
        if (!note.id) {
            toast.error("Please save the note before summarizing.");
            return;
        }

        setIsStreaming(true);
        setSummary("");

        const eventSource = new EventSource(`/notes/${note.id}/summarize`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setSummary((prev) => prev + (data.content || ""));
            } catch (error) {
                console.error("Error parsing summary data:", error);
                toast.error("Failed to parse summary data.");
                setIsStreaming(false);
                eventSource.close();
            }
        };

        eventSource.onerror = (error) => {
            console.error("Summarization stream error:", error);
            setIsStreaming(false);
            eventSource.close();

            // Fetch error details from the server if available
            fetch(`/notes/${note.id}/summarize`)
                .then((response) => response.json())
                .then((data) => {
                    toast.error(
                        data.error || "Summarization failed. Please try again."
                    );
                })
                .catch(() => {
                    toast.error(
                        "Summarization failed. Check your connection or API key."
                    );
                });
        };

        // Cleanup on component unmount or when summarization is complete
        return () => {
            if (eventSource.readyState !== EventSource.CLOSED) {
                eventSource.close();
            }
        };
    };

    const generateTags = async () => {
        try {
            const plainContent = htmlToText(content, { wordwrap: false });
            const response = await fetch("/tags.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `content=${encodeURIComponent(plainContent)}`,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setTags(data.tags || []);
            toast.success("Tags generated successfully");
        } catch (error) {
            console.error("Failed to generate tags:", error);
            toast.error("Failed to generate tags.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Note Title"
            />
            <Editor
                value={content}
                onChange={setContent}
                placeholder="Write your note here..."
            />
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    {note.id ? "Update Note" : "Save Note"}
                </button>
                <button
                    onClick={handleSummarize}
                    disabled={isStreaming || !note.id}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                >
                    {isStreaming ? "Summarizing..." : "Summarize Note"}
                </button>
                <button
                    onClick={generateTags}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                >
                    Generate Tags
                </button>
            </div>
            {summary && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold text-lg">Summary:</h3>
                    <p className="mt-2">{summary}</p>
                </div>
            )}
            {tags.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-bold text-lg">Tags:</h3>
                    <div className="flex gap-2 mt-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="bg-gray-200 px-2 py-1 rounded text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
