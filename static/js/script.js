document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.icon-button');
    const journalingSection = document.getElementById('journaling-section');
    const readingSection = document.getElementById('reading-section');
    const musicSection = document.getElementById('music-section');
    const philosophySection = document.getElementById('philosophy-section');

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Close all sections when switching buttons
            journalingSection.classList.add('hidden');
            readingSection.classList.add('hidden');
            musicSection.classList.add('hidden');
            philosophySection.classList.add('hidden');

            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                button.querySelector('.button-text').classList.add('hidden');
                button.style.width = '50px';
                return;
            }

            if (button.id === 'button-journaling') {
                openJournalingSection();
            } else if (button.id === 'button-reading') {
                openReadingSection();
            } else if (button.id === 'button-music') {
                musicSection.classList.remove('hidden');
            } else if (button.id === 'button-philosophy') {
                philosophySection.classList.remove('hidden');
            }

            buttons.forEach(btn => {
                btn.classList.remove('selected');
                btn.querySelector('.button-text').classList.add('hidden');
                btn.style.width = '50px';
            });

            button.classList.add('selected');
            button.querySelector('.button-text').classList.remove('hidden');
            const extraWidth = button.querySelector('.button-text').scrollWidth + 16; // 16 for padding
            button.style.width = `${50 + extraWidth}px`;
        });
    });

    window.journalingSection = journalingSection;
    window.readingSection = readingSection;
});
