# TrackNFind

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-brightgreen?style=for-the-badge&logo=render)](https://tracknfind-c79z.onrender.com)

> 🌐 **Live Website:** [https://tracknfind-c79z.onrender.com](https://tracknfind-c79z.onrender.com)

# 🔎 TrackNFind

### AI-Powered Missing Person Identification System

TrackNFind is a computer-vision-based web application designed to assist in missing-person identification through **face detection, facial feature extraction, and AI-assisted matching**.

The system allows users to submit information about a missing person along with an image. The uploaded image is processed using **YOLOv10** for face detection and **FaceNet** for generating facial embeddings. During real-time detection, faces captured through a webcam can be compared against the latest registered missing-person profile using embedding similarity.

The project demonstrates the integration of **Artificial Intelligence, Computer Vision, Deep Learning, Flask, and MongoDB** into a practical end-to-end application.

> **Project Status:** 🚧 Active Development

---

## ✨ Features

* 📝 **Missing Person Reporting**

  * Submit name, age, last-seen information, description, and an image.

* 🧠 **AI-Based Face Detection**

  * Uses YOLOv10 to detect faces from uploaded images and webcam frames.

* 🔐 **Facial Embedding Generation**

  * Uses FaceNet to convert detected faces into numerical facial embeddings.

* 📷 **Real-Time Face Detection**

  * Processes webcam frames through the AI pipeline.

* 🔎 **Face Similarity Matching**

  * Compares detected facial embeddings with the registered missing-person profile.

* 🗄️ **MongoDB Database**

  * Stores missing-person information, image references, facial embeddings, and status.

* 🟢 **Missing / Found Status**

  * Automatically updates the person's status when a matching face is detected.

* 🌐 **Flask Web Application**

  * Connects the frontend, AI models, database, and image-processing pipeline.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Flask Web App     │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Missing Person  │         │ Real-Time       │
        │ Report          │         │ Detection       │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 ▼                           ▼
        ┌────────────────────────────────────────────┐
        │              YOLOv10 Face Detection        │
        └──────────────────────┬─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Face Cropping &     │
                    │ Image Processing    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FaceNet        │
                    │ Facial Embeddings   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Similarity Matching │
                    └──────────┬──────────┘
                               │
                       ┌───────┴────────┐
                       │                │
                       ▼                ▼
                    Match            No Match
                       │                │
                       ▼                ▼
                   "Found"        "No Match"
                       │
                       ▼
                ┌───────────────┐
                │   MongoDB     │
                └───────────────┘
```

---

## 🛠️ Technology Stack

### Backend

* **Python**
* **Flask**
* **PyMongo**

### Artificial Intelligence & Computer Vision

* **YOLOv10** — Face detection
* **FaceNet** — Facial feature embeddings
* **PyTorch** — Deep learning framework
* **Torchvision**
* **OpenCV** — Image and video processing
* **NumPy**
* **Pillow**

### Database

* **MongoDB**

### Frontend

* HTML
* CSS
* JavaScript

---

## 📁 Project Structure

```text
TrackNFind/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── yolov10n-face.pt
│
├── templates/
│   ├── tracknfindmain.html
│   ├── index.html
│   ├── detect.html
│   └── aboutus.html
│
├── static/
│   ├── styleit.css
│   ├── aboutus.css
│   ├── aboutus.js
│   └── tnf.js
│
├── uploads/
│
└── venv/
```

> The virtual environment and uploaded user files are excluded from version control through `.gitignore`.

---

## ⚙️ How It Works

### 1. Report a Missing Person

The user provides:

* Name
* Age
* Last-seen information
* Description
* Photograph

The photograph is sent to the Flask backend.

### 2. Detect the Face

YOLOv10 processes the uploaded image and identifies the face region.

### 3. Generate Facial Embedding

The detected face is resized and passed through FaceNet.

FaceNet produces a numerical representation of the person's facial characteristics called a **facial embedding**.

### 4. Store the Profile

The person's information and facial embedding are stored in MongoDB.

### 5. Real-Time Detection

The webcam captures frames and sends them to the Flask backend.

YOLOv10 detects faces in each frame.

### 6. Compare Faces

FaceNet generates an embedding for each detected face.

The embedding is compared with the registered missing person's embedding using a distance-based similarity check.

### 7. Update Status

If the similarity distance falls below the configured threshold, the system considers the face a potential match and updates the person's status from:

```text
Missing
```

to:

```text
Found
```

---

## 🚀 Installation

### Prerequisites

Make sure you have installed:

* Python 3.x
* MongoDB Atlas account or MongoDB instance
* Git

### Clone the Repository

```bash
git clone https://github.com/apurbaabarua/TrackNFind.git
cd TrackNFind
```

### Create a Virtual Environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

 🔐 Environment Configuration

TrackNFind requires a MongoDB connection string.

**Never place your MongoDB username, password, API keys, or other credentials directly inside the source code.**

Set the MongoDB connection string as an environment variable.

Windows:

```cmd
setx MONGO_URI "your_mongodb_connection_string"
```

Then restart the terminal.

The application reads the connection using:

```python
mongo_uri = os.getenv("MONGO_URI")
```

---

 ▶️ Running the Application

Activate the virtual environment:

```cmd
venv\Scripts\activate
```

Start Flask:

```cmd
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

---

📌 Main Application Routes

| Route             | Purpose                       |
| ----------------- | ----------------------------- |
| `/`               | TrackNFind home page          |
| `/report`         | Missing-person reporting page |
| `/detect`         | Real-time detection page      |
| `/about`          | About TrackNFind              |
| `/upload`         | Process missing-person image  |
| `/process_webcam` | Process webcam frames         |



🧪 Current AI Pipeline

text
Input Image / Webcam Frame
            ↓
       YOLOv10 Face
        Detection
            ↓
       Face Cropping
            ↓
     Image Preprocessing
            ↓
         FaceNet
            ↓
    Facial Embedding
            ↓
    Distance Calculation
            ↓
      Match / No Match
            ↓
      MongoDB Update


🎯 Project Objectives

TrackNFind was developed to explore how AI and computer vision can be applied to real-world identification challenges.

The main objectives are to:

* Explore practical applications of facial recognition.
* Integrate deep-learning models into a web application.
* Build an end-to-end computer-vision pipeline.
* Store and retrieve AI-generated facial embeddings.
* Implement real-time webcam-based detection.
* Develop a foundation that could potentially be extended into a larger missing-person assistance platform.



🔮 Future Improvements

Potential future development includes:

* Multiple-person matching instead of only the latest uploaded profile.
* Improved face-recognition accuracy and threshold calibration.
* More robust handling of lighting, pose, occlusion, and low-quality images.
* Location-aware missing-person reports.
* Notification and alert systems.
* Secure user authentication and role-based access.
* Investigation dashboards for authorized organizations.
* Improved database indexing and search.
* Deployment using a production WSGI server.
* Cloud-based image storage.
* Privacy-preserving handling of facial data.
* Model evaluation using appropriate benchmark datasets.
* Better false-positive and false-negative monitoring.


⚠️ Responsible Use

TrackNFind is a **prototype/research-oriented project** and should not be treated as a definitive identification system.

Facial recognition can produce false matches and missed matches depending on image quality, lighting, pose, camera conditions, model limitations, and threshold selection.

Any real-world deployment involving missing-person identification should include:

* Human verification
* Appropriate privacy protections
* Secure storage of biometric information
* Access controls
* Legal and ethical review
* Careful evaluation of model performance



👩‍💻 Author

**Apurba Barua**

B.Tech — Computer Science & Engineering (Artificial Intelligence & Machine Learning)

GitHub:
https://github.com/apurbaabarua


⭐ Acknowledgements

This project uses open-source technologies and machine-learning frameworks including Flask, PyTorch, Ultralytics YOLO, FaceNet, OpenCV and MongoDB.




