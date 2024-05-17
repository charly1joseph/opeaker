document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.icon-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => {
                btn.classList.remove('selected');
                btn.querySelector('.button-text').classList.add('hidden');
                btn.style.width = '50px';
            });

            button.classList.add('selected');
            button.querySelector('.button-text').classList.remove('hidden');

            const buttonIndex = Array.from(buttons).indexOf(button);
            const totalButtons = buttons.length;

            const extraWidth = button.querySelector('.button-text').scrollWidth + 16; // 16 for padding
            button.style.width = `${50 + extraWidth}px`;

            buttons.forEach((btn, index) => {
                if (index < buttonIndex) {
                    btn.style.marginRight = '0';
                } else if (index > buttonIndex) {
                    btn.style.marginLeft = '0';
                }
            });
        });
    });
});
