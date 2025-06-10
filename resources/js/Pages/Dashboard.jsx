import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { InertiaLink } from '@inertiajs/inertia-react';

export default function Dashboard({ notes }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this note?')) {
            Inertia.delete(`/notes/${id}`);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Notes</h1>
            <InertiaLink
                href="/notes/create"
                className="bg-green-500 text-white px-4 py-2 rounded mb-4 inline-block"
            >
                Create New Note
            </InertiaLink>
            <div className="grid gap-4">
                {notes.map(note => (
                    <div key={note.id} className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">{note.title}</h2>
                        <div className="flex gap-2 mt-2">
                            <InertiaLink
                                href={`/notes/${note.id}`}
                                className="text-blue-500"
                            >
                                Edit
                            </InertiaLink>
                            <button
                                onClick={() => handleDelete(note.id)}
                                className="text-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}