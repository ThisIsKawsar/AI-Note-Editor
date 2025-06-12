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
        return response()->json(['note' => $note, 'message' => 'Note created']); // Return JSON instead of redirect
    }

    public function show(Note $note)
    {
        return Inertia::render('NoteEditor', ['note' => $note->toArray()]);
    }

    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note->update($validated);
        return response()->json(['message' => 'Note updated']);
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return redirect()->route('dashboard');
    }

    public function summarize(Request $request, Note $note)
    {
        // Verify API key exists
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'OpenAI API key is missing'], 500);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'Summarize the following text in 2-3 sentences.'],
                    ['role' => 'user', 'content' => $note->content],
                ],
                'stream' => true,
            ]);

            // Check if the request was successful
            if ($response->failed()) {
               
                return response()->json(['error' => 'Failed to fetch summary from OpenAI'], $response->status());
            }

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
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
            ]);
        } catch (\Exception $e) {
         
            return response()->json(['error' => 'Summarization failed: ' . $e->getMessage()], 500);
        }
    }
}
