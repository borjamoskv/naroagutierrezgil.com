import re
import sys

def clean_vtt(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove WEBVTT header and cues
    lines = content.split('\n')
    cleaned_lines = []
    
    # Simple state machine to extract text lines
    # Timestamps look like: 00:00:00.080 --> 00:00:01.309 ...
    time_pattern = re.compile(r'\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line == 'WEBVTT' or line.startswith('Kind:') or line.startswith('Language:'):
            continue
        if time_pattern.search(line):
            continue
            
        # Clean inline tags like <00:00:00.240><c> es</c>
        # Remove anything in angle brackets
        line_clean = re.sub(r'<[^>]+>', '', line)
        line_clean = line_clean.strip()
        
        if line_clean:
            cleaned_lines.append(line_clean)
            
    # Deduplicate adjacent duplicate lines (since YT auto-generated subs repeat previous lines a lot)
    deduped = []
    for line in cleaned_lines:
        if not deduped or deduped[-1] != line:
            deduped.append(line)
            
    # Let's combine lines. Since YT auto-captions chunk words, let's do a smart merge.
    # If a line is a prefix of the next line, or overlaps heavily, let's handle it.
    # Actually, a simpler way for YT auto-captions:
    # A line often repeats the first half of the next block.
    # Let's look at the blocks.
    # Let's just output them or join them and do a basic clean.
    # Let's write the raw deduped lines to a file first.
    return '\n'.join(deduped)

if __name__ == '__main__':
    vtt_path = 'transcript_es.es.vtt'
    cleaned = clean_vtt(vtt_path)
    # Further deduping of sliding windows
    lines = cleaned.split('\n')
    final_lines = []
    for line in lines:
        # If the line is already in the last part of final_lines, skip or merge
        # YT auto subtitles usually have:
        # Line 1: ¿Qué es lo que está pasando con la
        # Line 2: ¿Qué es lo que está pasando con la
        # Line 3: calidad de audio en los modelos de
        # Line 4: calidad de audio en los modelos de
        # Line 5: generación musical? Si os habéis fijado,
        # So we see a pattern: A line appears, then the same line appears again, then a new line.
        # Let's do a simple deduplication where we only keep unique text segments.
        if not final_lines or final_lines[-1] != line:
            # Check if current line starts with the previous line (growing line)
            if final_lines and line.startswith(final_lines[-1]):
                # Replace the previous line with this longer one
                final_lines[-1] = line
            else:
                final_lines.append(line)
                
    # Now join and remove duplicate sentences or phrases that are very close
    result = []
    for line in final_lines:
        if not result or result[-1] != line:
            # Let's check if the previous line is a substring of the current line
            if result and result[-1] in line:
                result[-1] = line
            else:
                result.append(line)
                
    print('\n'.join(result))
