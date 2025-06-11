<?php
namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class NoteController extends Controller
{
    public function index()
    {
        $notes = auth()->user()->notes()->latest()->get();
        return Inertia::render('Dashboard', ['notes' => $notes]);
    }
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
    ]);

    $note = auth()->user()->notes()->create($validated);
    return Inertia::render('NoteEditor', ['note' => $note]); // Render with new note
}

    public function show(Note $note)
    {
        $this->authorize('view', $note);
        return Inertia::render('NoteEditor', ['note' => $note]);
    }

    public function update(Request $request, Note $note)
    {
        $this->authorize('update', $note);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note->update($validated);
        return response()->json(['message' => 'Note updated']);
    }

    public function destroy(Note $note)
    {
        $this->authorize('delete', $note);
        $note->delete();
        return redirect()->route('dashboard');
    }

    public function summarize(Request $request, Note $note)
    {
        $this->authorize('view', $note);
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4.1-nano-2025-04-14',
            'messages' => [
                ['role' => 'system', 'content' => 'Summarize the following text in 2-3 sentences.'],
                ['role' => 'user', 'content' => $note->content],
            ],
            'stream' => true,
        ]);

        return response()->stream(function () use ($response) {
            foreach (explode("\n", $response->body()) as $line) {
                if (str_starts_with($line, 'data: ')) {
                    $data = json_decode(substr($line, 6), true);
                    if (isset($data['choices'][0]['delta']['content'])) {
                        echo "data: " . json_encode(['content' => $data['choices'][0]['delta']['content']]) . "\n\n";
                        ob_flush();
                        flush();
                    }
                }
            }
        }, 200, ['Content-Type' => 'text/event-stream']);
    }
}