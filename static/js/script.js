document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.icon-button');
    const journalingSection = document.getElementById('journaling-section');
    const addJournalEntryButton = document.querySelector('.add-journal-entry-button');
    const journalEntryForm = document.getElementById('journal-entry-form');
    const journalText = document.getElementById('journal-text');
    const submitJournalEntryButton = document.querySelector('.submit-journal-entry');
    const cancelJournalEntryButton = document.querySelector('.cancel-journal-entry');
    const journalEntries = document.getElementById('journal-entries');

    let isEditing = false;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'button-journaling') {
                if (button.classList.contains('selected')) {
                    if (isEditing) {
                        if (confirm('cancel this entry?')) {
                            closeJournalingSection();
                        }
                    } else {
                        closeJournalingSection();
                    }
                } else {
                    openJournalingSection();
                }
            } else {
                if (isEditing && !confirm('cancel this entry?')) {
                    return;
                }
                closeJournalingSection();
            }

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

    addJournalEntryButton.addEventListener('click', () => {
        addJournalEntryButton.style.display = 'none';
        journalEntryForm.style.display = 'flex';
        isEditing = true;
    });

    cancelJournalEntryButton.addEventListener('click', () => {
        if (confirm('cancel this entry?')) {
            journalText.value = '';
            addJournalEntryButton.style.display = 'flex';
            journalEntryForm.style.display = 'none';
            isEditing = false;
        }
        
    });

    submitJournalEntryButton.addEventListener('click', () => {
        const entryText = journalText.value.trim();
        if (entryText) {
            const timestamp = new Date().toLocaleString();

            saveJournalEntry(entryText, timestamp);

            // Add the entry to the top of the list
            const entryPreview = createJournalEntryElement(entryText, timestamp);
            journalEntries.insertBefore(entryPreview, journalEntries.firstChild);

            // Animation to materialize the new entry
            entryPreview.classList.add('animate-entry');

            if (confirm('submitting an entry is final.')) {
                journalText.value = '';
                addJournalEntryButton.style.display = 'flex';
                journalEntryForm.style.display = 'none';
                isEditing = false;
            }
            
        }
    });

    function openJournalingSection() {
        journalingSection.classList.remove('hidden');
        loadJournalEntries();
    }

    function closeJournalingSection() {
        journalingSection.classList.add('hidden');
        addJournalEntryButton.style.display = 'flex';
        journalEntryForm.style.display = 'none';
        journalText.value = '';
        isEditing = false;
    }

    function saveJournalEntry(text, timestamp) {
        fetch('/save_journal_entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, timestamp }),
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
        entryPreview.innerHTML = `<p>${truncatedText}...</p><small class="timestamp">${timestamp}</small>`;

        entryPreview.addEventListener('click', () => {
            entryPreview.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p><button class="minimize-entry">-</button><small class="timestamp">${timestamp}</small>`;
            entryPreview.classList.add('journal-entry-full');
            entryPreview.classList.remove('journal-entry-preview');

            const minimizeButton = entryPreview.querySelector('.minimize-entry');
            minimizeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                entryPreview.innerHTML = `<p>${truncatedText}...</p><small class="timestamp">${timestamp}</small>`;
                entryPreview.classList.add('journal-entry-preview');
                entryPreview.classList.remove('journal-entry-full');
            });
        });

        return entryPreview;
    }

    // Automatically expand the journal text area as the user types
    journalText.addEventListener('input', function() {
        this.style.height = '100px';
        this.style.height = this.scrollHeight + 'px';
    });
});
