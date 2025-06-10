import React from 'react';
import { Editor as TinyMCE } from '@tinymce/tinymce-react';

export default function Editor({ value, onChange, placeholder }) {
    return (
        <TinyMCE
            apiKey="your-tinymce-api-key"
            value={value}
            onEditorChange={onChange}
            init={{
                height: 400,
                menubar: false,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                ],
                toolbar:
                    'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help',
                placeholder: placeholder,
            }}
        />
    );
}