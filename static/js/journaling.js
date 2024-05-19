document.addEventListener('DOMContentLoaded', function() {
    const journalingSection = window.journalingSection;
    const addJournalEntryButton = document.querySelector('.add-journal-entry-button');
    const journalEntryForm = document.getElementById('journal-entry-form');
    const journalText = document.getElementById('journal-text');
    const submitJournalEntryButton = document.querySelector('.submit-journal-entry');
    const cancelJournalEntryButton = document.querySelector('.cancel-journal-entry');
    const journalEntries = document.getElementById('journal-entries');

    let isEditing = false;

    function showModal(message, confirmButtonText, cancelButtonText, onConfirm, onCancel) {
        Swal.fire({
            text: message,
            showCancelButton: true,
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText,
            showClass: {
                popup: 'swal2-show'
            },
            hideClass: {
                popup: 'swal2-hide'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                onConfirm();
            } else if (onCancel) {
                onCancel();
            }
        });
    }

    function loadJournalEntries() {
        fetch('/get_journal_entries')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    journalEntries.innerHTML = '';
                    data.entries.forEach(entry => {
                        const entryElement = createJournalEntryElement(entry.text, entry.timestamp);
                        journalEntries.appendChild(entryElement);
                    });
                }
            });
    }

    function createJournalEntryElement(text, timestamp) {
        const entryPreview = document.createElement('div');
        entryPreview.classList.add('journal-entry-preview');
        const newlineIndex = text.indexOf('\n');
        const truncatedText = newlineIndex !== -1 ? text.substring(0, newlineIndex) : text.substring(0, 50);
        entryPreview.innerHTML = `<p>${truncatedText}</p><small class="timestamp">${timestamp}</small>`;

        entryPreview.addEventListener('click', () => {
            entryPreview.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p><button class="minimize-entry">-</button><small class="timestamp">${timestamp}</small>`;
            entryPreview.classList.add('journal-entry-full');
            entryPreview.classList.remove('journal-entry-preview');

            const minimizeButton = entryPreview.querySelector('.minimize-entry');
            minimizeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                entryPreview.innerHTML = `<p>${truncatedText}</p><small class="timestamp">${timestamp}</small>`;
                entryPreview.classList.add('journal-entry-preview');
                entryPreview.classList.remove('journal-entry-full');
            });
        });

        return entryPreview;
    }

    addJournalEntryButton.addEventListener('click', () => {
        if (isEditing) {
            showModal('stop writing?', 'yes', 'no, keep editing', () => {
                journalText.value = '';
                addJournalEntryButton.style.display = 'flex';
                journalEntryForm.style.display = 'none';
                isEditing = false;
            });
        } else {
            addJournalEntryButton.style.display = 'none';
            journalEntryForm.style.display = 'flex';
            isEditing = true;
        }
    });

    cancelJournalEntryButton.addEventListener('click', () => {
        showModal('cancel entry?', 'cancel', 'no, keep editing', () => {
            journalText.value = '';
            addJournalEntryButton.style.display = 'flex';
            journalEntryForm.style.display = 'none';
            isEditing = false;
        });
    });

    submitJournalEntryButton.addEventListener('click', async () => {
        const entryText = journalText.value.trim();
        if (entryText) {
            showModal('write?', 'into stone', 'not yet', () => {
                const timestamp = new Date().toLocaleString();

                fetch('/save_journal_entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: entryText, timestamp: timestamp }),
                });

                const entryPreview = createJournalEntryElement(entryText, timestamp);
                journalEntries.insertBefore(entryPreview, journalEntries.firstChild);
                entryPreview.classList.add('animate-entry');

                journalText.value = '';
                addJournalEntryButton.style.display = 'flex';
                journalEntryForm.style.display = 'none';
                isEditing = false;
            });
        }
    });

    function openJournalingSection() {
        journalingSection.classList.remove('hidden');
        loadJournalEntries();
    }

    window.openJournalingSection = openJournalingSection;
});
