// Editor.jsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

const Editor = ({ value, onChange, placeholder }) => {
    return (
        <ReactQuill
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            theme="snow"
            modules={{
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'], // Remove formatting
                ],
            }}
            formats={[
                'header',
                'bold',
                'italic',
                'underline',
                'strike',
                'list',
                'bullet',
                'link',
                'image',
            ]}
            className="bg-white min-h-[200px]"
        />
    );
};

export default Editor;