(async function() {
    try {
        console.log("Fetching video...");
        const res = await fetch("http://127.0.0.1:9999/El_Ultimo_Solo_de_Gon_Master_V3.mp4");
        const blob = await res.blob();
        const file = new File([blob], "El_Ultimo_Solo_de_Gon_Master_V3.mp4", {type: "video/mp4"});
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        const editorElement = document.querySelector(".ProseMirror");
        if (!editorElement) return "Error: ProseMirror not found";
        
        const dropEvent = new DragEvent("drop", {
            dataTransfer: dataTransfer,
            bubbles: true,
            cancelable: true,
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2
        });
        
        editorElement.dispatchEvent(dropEvent);
        return "Drop event dispatched successfully (size: " + blob.size + ")";
    } catch(e) {
        return "Error: " + e.toString();
    }
})();
