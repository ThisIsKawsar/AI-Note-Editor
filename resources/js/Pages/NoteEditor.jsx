import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { htmlToText } from 'html-to-text';
import { toast } from 'react-toastify'; // Optional: for notifications

import Editor from '../Pages/Components/Editor';

export default function NoteEditor({ note }) {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        console.log('Note prop:', note); // Debug note prop
        if (!note?.id) {
            Inertia.post('/notes', { title: 'Untitled', content: '' }, {
                onSuccess: (response) => {
                    console.log('New note created:', response.props.note);
                    // Note: Parent component must update note prop
                },
                onError: (errors) => {
                    console.error('Failed to create note:', errors);
                    toast.error('Failed to create note.');
                },
            });
            return;
        }

        const timer = setTimeout(() => {
            const plainContent = htmlToText(content, { wordwrap: false }); // Remove if backend expects HTML
            Inertia.put(
                `/notes/${note.id}`,
                { title, content: plainContent }, // Use content if HTML
                {
                    onError: (errors) => {
                        console.error('Failed to save note:', errors);
                        toast.error('Failed to save note.');
                    },
                    onSuccess: () => {
                        console.log('Note saved successfully');
                    },
                }
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content, note?.id]);

    const handleSummarize = () => {
        if (!note?.id) {
            console.error('No note ID. Creating a new note...');
            toast.error('No note selected. Creating a new one...');
            Inertia.post('/notes', { title: 'Untitled', content: '' }, {
                onSuccess: (response) => {
                    const newNoteId = response.props.note?.id; // Adjust based on response
                    if (newNoteId) {
                        setIsStreaming(true);
                        setSummary('');
                        const eventSource = new EventSource(`/notes/${newNoteId}/summarize`);
                        eventSource.onmessage = (event) => {
                            try {
                                const data = JSON.parse(event.data);
                                setSummary((prev) => prev + (data.content || ''));
                            } catch (error) {
                                console.error('Error parsing summary data:', error);
                            }
                        };
                        eventSource.onerror = () => {
                            console.error('Summarization stream error');
                            setIsStreaming(false);
                            eventSource.close();
                        };
                        return () => eventSource.close();
                    }
                },
                onError: (errors) => {
                    console.error('Failed to create note for summarization:', errors);
                    toast.error('Failed to create note.');
                },
            });
            return;
        }

        setIsStreaming(true);
        setSummary('');

        const eventSource = new EventSource(`/notes/${note.id}/summarize`);
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setSummary((prev) => prev + (data.content || ''));
            } catch (error) {
                console.error('Error parsing summary data:', error);
            }
        };
        eventSource.onerror = () => {
            console.error('Summarization stream error');
            setIsStreaming(false);
            eventSource.close();
        };

        return () => eventSource.close();
    };

    const generateTags = async () => {
        try {
            const plainContent = htmlToText(content, { wordwrap: false }); // Remove if backend expects HTML
            const response = await fetch('/tags.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `content=${encodeURIComponent(plainContent)}`, // Use content if HTML
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setTags(data.tags || []);
        } catch (error) {
            console.error('Failed to generate tags:', error);
            toast.error('Failed to generate tags.');
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
                    onClick={handleSummarize}
                    disabled={isStreaming}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                >
                    {isStreaming ? 'Summarizing...' : 'Summarize Note'}
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