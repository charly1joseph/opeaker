document.addEventListener('DOMContentLoaded', function() {
    const setupForm = document.getElementById('setup-form');
    const usernameInput = document.getElementById('username');
    const feedback = document.getElementById('feedback');
    const saveButton = document.querySelector('.login-button');
    const profileImageInput = document.getElementById('profile_image');
    const profileImageButton = document.querySelector('.circle-upload-button');

    // Get the username from the URL and set it in the input field
    const urlParams = new URLSearchParams(window.location.search);
    const initialUsername = urlParams.get('username');
    if (initialUsername) {
        usernameInput.value = initialUsername;
    }

    // Validate username on input
    usernameInput.addEventListener('input', function() {
        const username = usernameInput.value.trim();
        const usernamePattern = /^[a-zA-Z0-9]{1,15}$/;

        if (!usernamePattern.test(username)) {
            feedback.innerHTML = `<p class="fade-text">username must be 1-15 characters long. only letters and numbers allowed.</p>`;
            saveButton.classList.remove('pulse'); // Display default style
        } else {
            feedback.innerHTML = ''; // Clear feedback if valid
        }
    });

    setupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = usernameInput.value.trim();
        const password = document.getElementById('password').value.trim();

        // Show the loader
        saveButton.classList.add('pulse');

        // Check if the username is empty or invalid
        const usernamePattern = /^[a-zA-Z0-9]{1,15}$/;
        if (!username) {
            feedback.innerHTML = `<p class="fade-text">username cannot be blank.</p>`;
            saveButton.classList.remove('pulse'); // Display default style
            return;
        } else if (!usernamePattern.test(username)) {
            feedback.innerHTML = `<p class="fade-text">username must be 1-15 characters long. only letters and numbers allowed.</p>`;
            saveButton.classList.remove('pulse'); // Display default style
            return;
        }

        // Check if the username already exists
        fetch(`/check_user?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists && username !== initialUsername) {
                    feedback.innerHTML = `<p class="fade-text">username taken.</p>`;
                    saveButton.classList.remove('pulse'); // Display default style
                } else {
                    
                    const formData = new FormData(setupForm);
                    fetch('/setup', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            saveButton.classList.add('explode');
                            setTimeout(() => {
                                window.location.href = '/main';
                            }, 1000); // Delay to sync with the explosion animation
                        } else {
                            feedback.innerHTML = `<p class="fade-text">${data.message}</p>`;
                            const passwordInput = document.getElementById('password');
                            passwordInput.value = '';
                            saveButton.style.display = ''; // Display default style
                        }
                    });
                }
            });
    });

    // Handle image preview
    profileImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImageButton.style.backgroundImage = `url(${e.target.result})`;
                profileImageButton.style.backgroundSize = 'cover';
                profileImageButton.style.backgroundPosition = 'center';
                profileImageButton.style.backgroundRepeat = 'no-repeat';
            };
            reader.readAsDataURL(file);
        }
    });
});
