<?php
// Raw PHP component for generating tags from note content
function generateTags($content) {
    $words = str_word_count(strtolower($content), 1);
    $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to'];
    
    $wordFreq = array_count_values(array_diff($words, $stopWords));
    arsort($wordFreq);
    
    return array_slice(array_keys($wordFreq), 0, 5);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['content'])) {
    header('Content-Type: application/json');
    
    try {
        $content = filter_input(INPUT_POST, 'content', FILTER_SANITIZE_STRING);
        $tags = generateTags($content);
        echo json_encode(['tags' => $tags]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to generate tags']);
    }
}