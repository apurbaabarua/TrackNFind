from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
import torch
import base64
from pymongo import MongoClient
from bson import ObjectId
from ultralytics import YOLO
from facenet_pytorch import InceptionResnetV1
from PIL import Image
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure Ultralytics to use /tmp to prevent permission warnings
os.environ.setdefault("YOLO_CONFIG_DIR", "/tmp/Ultralytics")

# Optimize PyTorch CPU threading for low-memory containers (Render Free Tier 512MB)
torch.set_num_threads(1)
torch.set_grad_enabled(False)

_model = None
_facenet = None

def get_yolo_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO('yolov10n-face.pt')
    return _model

def get_facenet_model():
    global _facenet
    if _facenet is None:
        from facenet_pytorch import InceptionResnetV1
        _facenet = InceptionResnetV1(pretrained='vggface2').eval()
    return _facenet

def get_face_embedding(image, box):
    facenet = get_facenet_model()
    x1, y1, x2, y2 = map(int, box)
    face = image[y1:y2, x1:x2]  # Crop face region
    face = cv2.resize(face, (160, 160))  # Resize for FaceNet
    face = Image.fromarray(face)
    face = np.array(face).astype(np.float32) / 255.0  # Normalize
    face = torch.tensor(face).permute(2, 0, 1).unsqueeze(0)  # Convert to tensor
    with torch.no_grad():
        embedding = facenet(face).detach().numpy().flatten()
    return embedding

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def get_mongo_collections():
    """Lazily or dynamically connect to MongoDB and return collections."""
    try:
        uri = os.getenv("MONGO_URI")
        if not uri:
            return None, None, "MONGO_URI environment variable is not set. Please set MONGO_URI in your environment or Render dashboard."
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        db = client.TRACKNFIND
        return db.missing_persons, db.latest_upload, None
    except Exception as e:
        return None, None, str(e)

@app.route('/')
def index():
    return render_template('tracknfindmain.html')


@app.route('/report')
def report():
    return render_template('index.html')

@app.route('/detect')
def detect():
    return render_template('detect.html')


@app.route('/about')
def about():
    return render_template('aboutus.html')

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return render_template('index.html', error='No file part provided in the upload request.'), 400

        file = request.files['file']
        if file.filename == '':
            return render_template('index.html', error='Please select an image file before submitting.'), 400

        safe_filename = secure_filename(file.filename)
        filename = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        file.save(filename)

        image = cv2.imread(filename)
        if image is None:
            return render_template('index.html', error='Invalid image format. Please upload a valid JPG/PNG image.'), 400

        yolo = get_yolo_model()
        results = yolo(image)
        faces = results[0].boxes.xyxy.cpu().numpy()
        if len(faces) == 0:
            return render_template('index.html', error='No face detected in the image. Please upload a clear photo of the face.'), 400

        face_encoding = get_face_embedding(image, faces[0])

        missing_persons_collection, latest_upload_collection, mongo_err = get_mongo_collections()
        if missing_persons_collection is None:
            return render_template('index.html', error=f'Database connection failed: {mongo_err}. Please ensure MONGO_URI is set on Render and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas.'), 500

        missing_person_data = {
            "name": request.form.get('name', 'Unknown'),
            "age": request.form.get('age', 'Unknown'),
            "last_seen": request.form.get('last_seen', 'Unknown'),
            "description": request.form.get('description', 'No description'),
            "image_filename": safe_filename,
            "encoding": face_encoding.tolist(),
            "status": "Missing",
        }
        result = missing_persons_collection.insert_one(missing_person_data)

        latest_upload_collection.delete_many({})
        latest_upload_collection.insert_one({"_id": result.inserted_id, "encoding": face_encoding.tolist()})

        return render_template('index.html', message='Upload successful! You can now proceed to Real-Time Detection.', person_id=str(result.inserted_id))
    except Exception as e:
        return render_template('index.html', error=f'Error processing upload: {str(e)}'), 500

@app.route('/process_webcam', methods=['POST'])
def process_webcam():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        image_data = data.get("image")
        if not image_data:
            return jsonify({"error": "No image data received"}), 400

        missing_persons_collection, latest_upload_collection, mongo_err = get_mongo_collections()
        if latest_upload_collection is None:
            return jsonify({"error": f"Database not connected: {mongo_err}. Check MONGO_URI and MongoDB Atlas IP whitelist."}), 500

        latest_person = latest_upload_collection.find_one({}, {"_id": 1, "encoding": 1})
        if not latest_person:
            return jsonify({"error": "No recent upload found. Please upload a missing person photo first."}), 404

        latest_encoding = np.array(latest_person["encoding"], dtype=np.float32)
        latest_id = str(latest_person["_id"])

        encoded_data = image_data.split(",")[1]
        decoded_image = base64.b64decode(encoded_data)
        np_arr = np.frombuffer(decoded_image, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Could not decode camera frame"}), 400

        yolo = get_yolo_model()
        results = yolo(frame)
        faces = results[0].boxes.xyxy.cpu().numpy()
        if not faces.any():
            return jsonify({"message": "No face detected in camera view", "image": None, "continue": True}), 200

        match_found = False
        person_info = None

        for face in faces:
            x1, y1, x2, y2 = [int(coord) for coord in face]
            detected_face_encoding = get_face_embedding(frame, face)
            distance = np.linalg.norm(detected_face_encoding - latest_encoding)
            if distance < 0.8:
                match_found = True
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 4)
                missing_persons_collection.update_one(
                    {"_id": ObjectId(latest_id)},
                    {"$set": {"status": "Found"}}
                )
                person_info = missing_persons_collection.find_one(
                    {"_id": ObjectId(latest_id)},
                    {"_id": 0, "name": 1, "age": 1, "last_seen": 1, "description": 1}
                )
            else:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 4)

        _, buffer = cv2.imencode('.jpg', frame)
        processed_image_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            "message": "Match found" if match_found else "No match found",
            "person_info": person_info,
            "image": f"data:image/jpeg;base64,{processed_image_base64}",
            "continue": not match_found
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
