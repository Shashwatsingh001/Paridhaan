import os
import numpy as np
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import json

app = Flask(__name__)

# Load the trained model
model_path = "C:/Users/Rishabh/Music/7th sem Major Project/Project/Backend/my_clothing_recommendation_model.h5"  # Update with your actual model path
model = load_model(model_path)

# Load encoders and other metadata
with open("C:/Users/Rishabh/Music/7th sem Major Project/Project/Backend/label_encoders.json", "r") as file:
    label_encoders = json.load(file)

# Rebuild the LabelEncoder objects
le_objects = {}
for key, values in label_encoders.items():
    le = LabelEncoder()
    le.classes_ = np.array(values)
    le_objects[key] = le

# Define a dummy input for image features (zeros)
DUMMY_IMAGE_FEATURES = np.zeros((1, model.input_shape[0][1]))

# Dynamically load image names from the folder
image_folder_path = "C:/Users/Rishabh/Music/7th sem Major Project/Project/Backend/downloaded_images-20241123T010413Z-001/downloaded_images"  # Update with your actual folder path
image_names = sorted(os.listdir(image_folder_path))  # Get all image names in the folder and sort them


@app.route("/recommend", methods=["POST"])
def recommend():
    """
    API endpoint to recommend clothing based on metadata.
    Expects a POST request with 'season', 'gender', 'occasion', and 'cloth_category'.
    """
    try:
        data = request.json

        # Extract input fields
        season = data["season"]
        gender = data["gender"]
        occasion = data["occasion"]
        cloth_category = data["cloth_category"]

        # Encode metadata
        input_metadata = np.array([
            le_objects["Season"].transform([season])[0],
            le_objects["Gender"].transform([gender])[0],
            le_objects["Occasion"].transform([occasion])[0],
            le_objects["Cloth_category"].transform([cloth_category])[0]
        ]).reshape(1, -1)

        # Predict using the model
        predictions = model.predict([DUMMY_IMAGE_FEATURES, input_metadata])
        predicted_index = np.argmax(predictions)
        recommended_image = image_names[predicted_index]  # Map the prediction to the actual image name

        # Return the result
        return jsonify({"recommended_image": recommended_image})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)