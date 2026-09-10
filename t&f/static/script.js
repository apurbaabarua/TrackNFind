function updateFrame() {
    fetch('/process_webcam', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.image) {
            let image = new Image();
            image.src = "data:image/jpeg;base64," + data.image;
            document.getElementById('webcam_frame').src = image.src;
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Call this function periodically (e.g., every 100ms) to keep the webcam feed updated
setInterval(updateFrame, 100);
