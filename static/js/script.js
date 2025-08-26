// ===== Theme Toggle Removed =====
// Dark theme is now the default and only theme

// ===== Animate Skill Bars on Scroll =====
const skillBars = document.querySelectorAll('.skill-bar');
const animateSkills = () => {
    skillBars.forEach(bar => {
        const top = bar.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (top < windowHeight - 50) {
            const percent = bar.getAttribute('data-percent');
            bar.querySelector('.progress').style.width = percent;
        }
    });
};
window.addEventListener('scroll', animateSkills);
window.addEventListener('load', animateSkills);

// ===== Project Modal =====
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const closeModal = document.getElementById('close-modal');

document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalImg.src = card.getAttribute('data-image');
        modalTitle.textContent = card.getAttribute('data-title');
        modalDesc.textContent = card.getAttribute('data-desc');
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// ===== Contact Form Submission =====
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('success-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    successMsg.textContent = 'Sending message...';
    successMsg.style.color = '#38bdf8';

    try {
        const res = await fetch('/contact', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: data
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();
        
        if (result.status === 'success') {
            successMsg.style.color = '#4ade80';
            successMsg.textContent = result.message || 'Message Sent Successfully!';
            form.reset();
            setTimeout(() => { 
                successMsg.textContent = ''; 
            }, 3000);
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        successMsg.style.color = '#ef4444';
        successMsg.textContent = 'Failed to send message. Please try again.';
        setTimeout(() => { 
            successMsg.textContent = ''; 
        }, 5000);
    }
});
