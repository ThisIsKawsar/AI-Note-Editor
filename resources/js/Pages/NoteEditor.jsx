import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import Editor from '../Pages/Components/Editor';

export default function NoteEditor({ note }) {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (note?.id) {
                Inertia.put(`/notes/${note.id}`, { title, content });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [title, content]);

    const handleSummarize = () => {
        setIsStreaming(true);
        setSummary('');

        const eventSource = new EventSource(`/notes/${note.id}/summarize`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setSummary(prev => prev + data.content);
        };

        eventSource.onerror = () => {
            setIsStreaming(false);
            eventSource.close();
        };
    };

    const generateTags = async () => {
        const response = await fetch('/tags.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `content=${encodeURIComponent(content)}`
        });
        const data = await response.json();
        setTags(data.tags || []);
    };

    return (
        <div className="container mx-auto p-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-bold mb-4 p-2"
                placeholder="Note Title"
            />
            <Editor
                value={content}
                onChange={setContent}
                placeholder="Write your note here..."
            />
            <div className="mt-4">
                <button
                    onClick={handleSummarize}
                    disabled={isStreaming}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                    {isStreaming ? 'Summarizing...' : 'Summarize Note'}
                </button>
                <button
                    onClick={generateTags}
                    className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                    Generate Tags
                </button>
            </div>
            {summary && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold">Summary:</h3>
                    <p>{summary}</p>
                </div>
            )}
            {tags.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-bold">Tags:</h3>
                    <div className="flex gap-2">
                        {tags.map(tag => (
                            <span key={tag} className="bg-gray-200 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}