document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.icon-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                button.querySelector('.button-text').classList.add('hidden');
                button.style.width = '50px';
                return;
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
});
