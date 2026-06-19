import mimetypes
import os

# Ampliar MIME types base si es necesario
mimetypes.add_type('audio/flac', '.flac')
mimetypes.add_type('audio/wav', '.wav')
mimetypes.add_type('audio/aiff', '.aiff')
mimetypes.add_type('audio/mp3', '.mp3')

def classify_file(filepath):
    filename = os.path.basename(filepath)
    mime_type, _ = mimetypes.guess_type(filepath)
    
    if not mime_type:
        # Fallback heuristico crudo
        if filename.endswith(('.py', '.js', '.ts', '.html', '.css', '.json', '.yaml', '.yml', '.md')):
            return "code"
        return "unknown"
        
    if mime_type.startswith('video/'):
        return "video"
    elif mime_type.startswith('image/'):
        return "image"
    elif mime_type.startswith('audio/'):
        return "audio"
    elif mime_type.startswith('text/') or mime_type in ['application/pdf']:
        if filename.endswith(('.py', '.js', '.ts', '.html', '.css', '.json', '.yaml', '.yml', '.md')):
            return "code"
        return "document"
        
    return "unknown"
