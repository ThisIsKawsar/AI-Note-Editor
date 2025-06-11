// NoteEditor.jsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { htmlToText } from 'html-to-text';

import Editor from '../Pages/Components/Editor';

export default function NoteEditor({ note }) {
    // State for note title, content, summary, tags, and streaming status
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);

    // Auto-save note title and content with 1-second debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (note?.id) {
                // Convert HTML content to plain text if backend expects it
                const plainContent = htmlToText(content, { wordwrap: false });
                Inertia.put(
                    `/notes/${note.id}`,
                    { title, content: plainContent }, // Use plainContent or content based on backend needs
                    {
                        onError: (errors) => {
                            console.error('Failed to save note:', errors);
                            // Optionally show a user notification
                        },
                        onSuccess: () => {
                            console.log('Note saved successfully');
                        },
                    }
                );
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content, note?.id]);

    // Handle note summarization using EventSource
    const handleSummarize = () => {
        console.log(!note?.id);

        if (!note?.id) {
            console.error('No note ID provided for summarization');
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

        // Cleanup on component unmount
        return () => eventSource.close();
    };

    // Generate tags by sending content to /tags.php
    const generateTags = async () => {
        try {
            // Convert HTML content to plain text if backend expects it
            const plainContent = htmlToText(content, { wordwrap: false });
            const response = await fetch('/tags.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `content=${encodeURIComponent(plainContent)}`, // Use plainContent or content
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setTags(data.tags || []);
        } catch (error) {
            console.error('Failed to generate tags:', error);
            // Optionally show a user notification
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* Title Input */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Note Title"
            />

            {/* Rich Text Editor */}
            <Editor
                value={content}
                onChange={setContent}
                placeholder="Write your note here..."
            />

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleSummarize}
                    disabled={isStreaming || !note?.id}
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

            {/* Summary Display */}
            {summary && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold text-lg">Summary:</h3>
                    <p className="mt-2">{summary}</p>
                </div>
            )}

            {/* Tags Display */}
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