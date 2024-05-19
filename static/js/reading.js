document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.icon-button');
    const readingSection = document.getElementById('reading-section');
    const addBookButton = document.querySelector('.add-book-button');
    const bookForm = document.getElementById('book-form');
    const bookTitleInput = document.getElementById('book-title');
    const bookAuthorInput = document.getElementById('book-author');
    const submitBookButton = document.querySelector('.submit-book');
    const cancelBookButton = document.querySelector('.cancel-book');
    const bookReviewsGrid = document.getElementById('book-reviews');
    const booksFinishedCount = document.getElementById('books-finished-count');

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

    function addBook(title, author) {
        fetch('/save_book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author }),
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                loadBooks();
            }
        });
    }

    function loadBooks() {
        fetch('/get_books')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bookReviewsGrid.innerHTML = '';
                    data.books.forEach(book => {
                        const bookElement = createBookElement(book.title, book.author, book.finished, book.review, book.rating);
                        bookReviewsGrid.appendChild(bookElement);
                    });
                    booksFinishedCount.textContent = data.books.filter(book => book.finished).length;
                }
            });
    }

    function createBookElement(title, author, finished, review, rating) {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book-review');
        if (finished) {
            bookElement.classList.add('finished');
        }
        bookElement.innerHTML = `<h3>${title}</h3><p>by ${author}</p>${finished ? `<p>${review}</p><p>Rating: ${'⭐'.repeat(rating)}</p>` : ''}`;

        bookElement.addEventListener('click', () => {
            if (!finished) {
                showModal('Mark this book as finished?', 'Yes', 'No', () => {
                    markBookAsFinished(title);
                });
            } else {
                showModal('Review this book?', 'Review', 'Cancel', () => {
                    const review = prompt('Enter your review:');
                    const rating = prompt('Enter your rating (1-5):');
                    if (review && rating) {
                        saveBookReview(title, review, rating);
                    }
                });
            }
        });

        return bookElement;
    }

    function markBookAsFinished(title) {
        fetch('/mark_book_as_finished', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                loadBooks();
            }
        });
    }

    function saveBookReview(title, review, rating) {
        fetch('/save_book_review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, review, rating }),
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                loadBooks();
            }
        });
    }

    addBookButton.addEventListener('click', () => {
        if (isEditing) {
            showModal('Stop adding this book?', 'Yes', 'No, keep editing', () => {
                bookTitleInput.value = '';
                bookAuthorInput.value = '';
                bookForm.style.display = 'none';
                isEditing = false;
            });
        } else {
            bookForm.style.display = 'block';
            isEditing = true;
        }
    });

    cancelBookButton.addEventListener('click', () => {
        showModal('Cancel adding this book?', 'Yes', 'No, keep editing', () => {
            bookTitleInput.value = '';
            bookAuthorInput.value = '';
            bookForm.style.display = 'none';
            isEditing = false;
        });
    });

    submitBookButton.addEventListener('click', () => {
        const title = bookTitleInput.value.trim();
        const author = bookAuthorInput.value.trim();
        if (title && author) {
            showModal('Submit this book?', 'Yes', 'No, keep editing', () => {
                addBook(title, author);
                bookTitleInput.value = '';
                bookAuthorInput.value = '';
                bookForm.style.display = 'none';
                isEditing = false;
            });
        }
    });

    function openReadingSection() {
        readingSection.classList.remove('hidden');
        loadBooks();
    }

    window.openReadingSection = openReadingSection;
});
