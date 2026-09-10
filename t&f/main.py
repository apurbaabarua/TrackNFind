import cv2
import face_recognition
import pickle
import os
import cvzone
import numpy as np

# importing the images of missing persons
folderPath = ("uploads")
PathList = os.listdir(folderPath)
print(PathList)
imgList = []
missing_person_Ids = []

for path in PathList:
    imgList.append(cv2.imread(os.path.join(folderPath, path)))
    missing_person_Ids.append(os.path.splitext(path)[0])
   # print(path)
   # print(os.path.splitext(path)[0])
print(missing_person_Ids)

def findEncodings(imagesList):
    encodeList= []
    for img in imagesList:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)

    return encodeList
print("Encoding Started....")

encodeListKnown = findEncodings(imgList) 
encodeListKnownwithIds = [encodeListKnown, missing_person_Ids]
print("Encoding Complete")

file = open("EncodeFile.p", "wb")
pickle.dump(encodeListKnownwithIds, file)
file.close()
print("File saved")

cap = cv2.VideoCapture(0)
cap.set(3, 1280)  # Set width
cap.set(4, 720)   # Set height

# Load the encoding file
file = open('EncodeFile.p', 'rb')
encodeListKnownwithIds = pickle.load(file)
file.close()
encodeListKnown, missing_person_Ids = encodeListKnownwithIds
# print(missing_person_Ids)
counter = 0
id = -1
while True:
    success, img = cap.read()
    imgS = cv2.resize(img, (0,0), None , 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)

    for encodeFace, faceloc in zip(encodeCurFrame, faceCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
        # print("matches", matches)
        # print("FaceDis", faceDis)

        matchIndex = np.argmin(faceDis)
        # print("matchIndex", matchIndex)
    

        if matches[matchIndex]:
            # print("known face detected.")
            # print(missing_person_Ids[matchIndex]) 
            y1, x2, y2, x1 = faceloc
            y1, x2, y2, x1 =y1*4, x2*4, y2*4, x1*4
            bbox = (x1, y1, x2 - x1, y2 - y1)  
            img = cvzone.cornerRect(img, bbox, rt = 0)
            id = missing_person_Ids[matchIndex]
        if counter == 0:
            counter = 1



    if counter!= 0:
        
        if counter ==1:
            missing_person_Info = db.missing_persons.find_one({"_id": ObjectId(id)}).get()
            

                                               



        counter += 1
        
    
    cv2.imshow("Face detection", img)

    # Press 'q' to exit the loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
