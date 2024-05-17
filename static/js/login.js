document.addEventListener('DOMContentLoaded', function() {
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username');
    const feedback = document.getElementById('feedback');

    usernameForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = usernameInput.value.trim();

        fetch(`/check_user?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    // Replace the input field with static text
                    const usernameText = document.createElement('span');
                    usernameText.classList.add('username-text');
                    usernameText.textContent = username;

                    // Match the height of the input field and the span
                    usernameText.style.height = `${usernameInput.offsetHeight}px`;
                    usernameText.style.lineHeight = `${usernameInput.offsetHeight}px`;

                    // Transition effect for the username text
                    usernameInput.style.transition = 'color 1s, opacity 0.5s';
                    usernameInput.style.color = '#f2b15a';
                    // usernameInput.style.opacity = '0';

                    // Replace the input field with static text
                    setTimeout(() => {
                        usernameInput.style.display = 'none';
                        usernameInput.parentNode.insertBefore(usernameText, usernameInput);
                    }, 500);

                    // Fade in the password input box and login button
                    setTimeout(() => {
                        const passwordContainer = document.createElement('div');
                        passwordContainer.classList.add('password-container');
                        feedback.appendChild(passwordContainer);

                        passwordContainer.innerHTML = `
                            <form id="password-form">
                                <input type="password" id="password" name="password" placeholder="pass key..." required>
                                <input type="submit" value="login" class="login-button">
                            </form>
                        `;
                        const passwordForm = document.getElementById('password-form');
                        const passwordInput = document.getElementById('password');
                        const loginButton = passwordForm.querySelector('.login-button');
                        passwordInput.style.opacity = 0;
                        loginButton.style.opacity = 0;

                        passwordForm.addEventListener('submit', function(event) {
                            event.preventDefault();
                            const password = passwordInput.value.trim();
                            fetch(`/login_user`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ username, password })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    window.location.href = `/main`;
                                } else {
                                    feedback.innerHTML = `<p>invalid pass key. please try again.</p>`;
                                }
                            });
                        });

                        // Fade in the password input box and login button
                        setTimeout(() => {
                            passwordInput.style.transition = 'opacity 0.5s';
                            passwordInput.style.opacity = 1;
                            loginButton.style.transition = 'opacity 0.5s';
                            loginButton.style.opacity = 1;
                        }, 50);
                    }, 500); // Delay to sync with the color transition
                } else {
                    feedback.innerHTML = `
                        <p class="fade-text">new here? please set up your credentials</p>
                        <button id="setup-button" class="fade-button">set up creds</button>
                    `;
                    const setupButton = document.getElementById('setup-button');
                    setupButton.addEventListener('click', function() {
                        window.location.href = '/setup';
                    });
                }
            });
    });
});
