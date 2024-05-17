document.addEventListener('DOMContentLoaded', function() {
    const setupForm = document.getElementById('setup-form');
    const usernameInput = document.getElementById('username');
    const feedback = document.getElementById('feedback');
    const saveButton = document.querySelector('.login-button');

    // Get the username from the URL and set it in the input field
    const urlParams = new URLSearchParams(window.location.search);
    const initialUsername = urlParams.get('username');
    if (initialUsername) {
        usernameInput.value = initialUsername;
    }

    setupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = usernameInput.value.trim();
        const password = document.getElementById('password').value.trim();

        // Check if the username is empty
        if (!username) {
            feedback.innerHTML = `<p class="fade-text">Username cannot be empty.</p>`;
            return;
        }

        // Check if the username already exists
        fetch(`/check_user?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists && username !== initialUsername) {
                    feedback.innerHTML = `<p class="fade-text">Username already exists.</p>`;
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
                            }, 500); // Delay to allow the animation to complete
                        } else {
                            feedback.innerHTML = `<p class="fade-text">${data.message}</p>`;
                            const passwordInput = document.getElementById('password');
                            passwordInput.value = '';
                        }
                    });
                }
            });
    });
});
