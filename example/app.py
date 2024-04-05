from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
from werkzeug.utils import secure_filename
from ml_models.colorizer import colorize_image
from ml_models.denoiser import denoise_image
from ml_models.superresolution import superresolve_image

app = Flask(__name__)

@app.route('/')
def landing_page():
    return render_template('landing.html')

@app.route('/project')
def project_page():
    return render_template('index.html')

@app.route('/restore', methods=['POST'])
def restore():
    try:
        # Check if POST request has file part
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})

        file = request.files['file']

        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'})

        # Check if file format is supported
        allowed_formats = ['jpg', 'jpeg', 'png']
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        if file_extension not in allowed_formats:
            return jsonify({'error': 'Unsupported file format'})

        # Read image
        image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

        # Perform image restoration based on selected feature
        feature = request.form.get('feature')
        if feature == 'colorization':
            # Pass additional arguments for colorization if needed
            restored_image = colorize_image(image)  # Example: rendering=True
        elif feature == 'blur_removal':
            # Pass additional arguments for denoising
            restored_image = denoise_image(image)  # Example: patch_size=5, stride=1
        elif feature == 'super_resolution':
            # Pass additional arguments for super resolution if needed
            restored_image = superresolve_image(image)  # Example: method='PSNR'
        else:
            return jsonify({'error': 'Invalid feature selected'})

        # Encode restored image to send it back
        retval, buffer = cv2.imencode('.jpg', restored_image)
        restored_image_encoded = base64.b64encode(buffer).decode('utf-8')
        # Return restored image
        return jsonify({'result': 'success', 'restored_image': restored_image_encoded})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
