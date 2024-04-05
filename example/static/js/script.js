document.getElementById('uploadBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function(event) {
        var img = document.getElementById('uploadedImage');
        img.src = event.target.result;
        img.onload = function() {
            URL.revokeObjectURL(img.src);  // Release the object URL
        };
    };
    reader.readAsDataURL(file);

    // Hide select image file button and text contents
    var uploadSection = document.getElementById('upload-section');
    uploadSection.style.display = 'none';

    var imgSection = document.getElementById('img-section');
    imgSection.style.display = 'flex';

    // Show input image and features
    var featuresSection = document.getElementById('features-section');
    featuresSection.style.display = 'block';

    // Show the "Convert" button
    document.getElementById('convertBtn').style.display = 'block';
});

document.getElementById('convertBtn').addEventListener('click', function() {
    var fileInput = document.getElementById('fileInput');
    if (fileInput.files.length == 0) {
        alert('Please select an image file first.');
        return;
    }

    var selectedFeature = document.querySelector('.featureBtn.active');
    if (!selectedFeature) {
        alert('Please select a feature first.');
        return;
    }

    var feature = selectedFeature.getAttribute('data-feature');

    var formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('feature', feature);

    fetch('/restore', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            var img = document.getElementById('outputImage');
            img.src = 'data:image/jpeg;base64,' + data.restored_image;
            document.getElementById('output-section').style.display = 'block'; // Display output section
            document.getElementById('downloadBtn').style.display = 'block'; // Display download button
            
            // Hide the feature section after restoration
            var featuresSection = document.getElementById('features-section');
            featuresSection.style.display = 'none';
        }
    })
    .catch(error => console.error('Error:', error));
});

document.querySelectorAll('.featureBtn').forEach(function(button) {
    button.addEventListener('click', function() {
        // Deselect all feature buttons
        document.querySelectorAll('.featureBtn').forEach(function(btn) {
            btn.classList.remove('active');
        });

        // Select the clicked feature button
        this.classList.add('active');
    });
});

document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'downloadBtn') {
        var outputImageSrc = document.getElementById('outputImage').src;
        var link = document.createElement('a');
        link.href = outputImageSrc;
        link.download = 'restored_image.jpg'; // Change the filename if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
