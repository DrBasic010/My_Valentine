const init = async () => {
    // Prevent script from running on Admin page (which doesn't have <main>)
    if (!document.querySelector('main')) return;

    const today = new Date();
    const currentMonth = today.getMonth(); // 0 = Jan, 1 = Feb
    const currentDate = today.getDate();
    
    // Get the day associated with the current page from the body tag
    // Default to 7 if not set (e.g. for index.html)
    const pageDay = parseInt(document.body.getAttribute('data-day')) || 7;

    // Loading Screen Logic
    let loadingScreen = null;
    let loadingBar = null;

    loadingScreen = document.createElement('div');
    Object.assign(loadingScreen.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        zIndex: '100000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.5s ease'
    });

    const barContainer = document.createElement('div');
    Object.assign(barContainer.style, {
        width: '200px',
        height: '4px',
        backgroundColor: '#333',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '15px'
    });

    loadingBar = document.createElement('div');
    Object.assign(loadingBar.style, {
        width: '0%',
        height: '100%',
        backgroundColor: '#ff4d6d',
        transition: 'width 0.5s ease'
    });

    const loadingText = document.createElement('div');
    loadingText.textContent = "Checking Cupid's Database...";
    Object.assign(loadingText.style, {
        color: 'white',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '0.9rem'
    });

    barContainer.appendChild(loadingBar);
    loadingScreen.appendChild(barContainer);
    loadingScreen.appendChild(loadingText);
    document.body.appendChild(loadingScreen);

    // Start progress animation
    requestAnimationFrame(() => {
        loadingBar.style.width = '30%';
    });

    // 1. Security Check: Is this page allowed?
    let isLocked = pageDay !== 7;

    const mainContent = document.querySelector('main');

    // 2. Navigation Logic (Initialize PREV immediately)
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    function getPageUrl(day) {
        if (day === 7) return 'index.html';
        return `day${day}.html`;
    }

    if (prevBtn) {
        if (pageDay === 7) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = "0.5";
        } else {
            prevBtn.addEventListener('click', () => {
                window.location.href = getPageUrl(pageDay - 1);
            });
        }
    }

    // Admin Override Check
    let configData = {};
    try {
        // REPLACE THIS URL with your actual Google Apps Script Web App URL
        const API_URL = "https://script.google.com/macros/s/AKfycbw__XEPVOk7SpILTfaHf_On_wLtu0MJpWvkm1PPftOwfvG0KRgUUolsm8EfJb7AIqwFJg/exec"; 
        
        if (loadingBar) loadingBar.style.width = '70%';

        // Fetch config from Google Sheet
        const response = await fetch(API_URL);
        configData = await response.json();

        if (loadingBar) loadingBar.style.width = '100%';
    } catch (error) {
        console.error("Error fetching config:", error);
    }

    if (configData[`day${pageDay}_unlocked`] === true) {
        isLocked = false;
    } else if (configData.auto_unlock === true) {
        // If Auto Unlock is enabled in DB, check the date
        if (currentMonth > 1) { // March or later
            isLocked = false;
        } else if (currentMonth === 1 && currentDate >= pageDay) { // Feb and date reached
            isLocked = false;
        }
    }

    // Remove loading screen
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        document.body.classList.add('loaded');
        setTimeout(() => {
            if (loadingScreen.parentNode) loadingScreen.parentNode.removeChild(loadingScreen);
        }, 500);
    }
    
    // If locked (and not the landing page Day 7), show locked screen
    if (isLocked && pageDay !== 7) {
        document.body.innerHTML = '';
        document.body.style.background = 'black';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.height = '100vh';
        document.body.style.margin = '0';

        // Hide background pseudo-element
        const style = document.createElement('style');
        style.textContent = 'body::before { display: none !important; }';
        document.head.appendChild(style);

        const img = document.createElement('img');
        img.src = 'Images/cat-no.gif';
        img.alt = 'Locked';
        img.style.maxWidth = '300px';
        img.style.borderRadius = '15px';

        const msg = document.createElement('h1');
        msg.textContent = 'Wait for the day to arrive! 🔒';
        msg.style.color = 'white';
        msg.style.marginTop = '20px';
        msg.style.fontFamily = "'Poppins', sans-serif";
        msg.style.textAlign = 'center';

        document.body.appendChild(img);
        document.body.appendChild(msg);
        return;
    }

    // Reveal content if allowed
    if (mainContent && !isLocked) {
        mainContent.style.display = 'flex';
    }

    // Next Button Logic (Depends on DB config)
    if (nextBtn) {
        // Check if next day is unlocked
        let nextDayUnlocked = false;

        // Admin Override for Next Button
        const nextDay = pageDay + 1;
        if (configData[`day${nextDay}_unlocked`] === true) {
            nextDayUnlocked = true;
        } else if (configData.auto_unlock === true) {
            if (currentMonth > 1) {
                nextDayUnlocked = true;
            } else if (currentMonth === 1 && currentDate >= nextDay) {
                nextDayUnlocked = true;
            }
        }

        if (pageDay === 14) {
            nextBtn.style.display = 'none'; // No next day after 14
        } else if (!nextDayUnlocked) {
            nextBtn.disabled = true;
            nextBtn.textContent = "Locked 🔒";
        } else {
            nextBtn.addEventListener('click', () => {
                window.location.href = getPageUrl(pageDay + 1);
            });
        }
    }

    // Valentine's Button Logic
    const noBtn = document.querySelector('.no-button');
    const yesBtn = document.querySelector('.yes-button');
    
    if (noBtn && yesBtn) {
        const messages = [
            "No", "Are you sure?", "Really sure?", "Think again!", 
            "Last chance!", "Surely not?", "You might regret this!", 
            "Give it another thought!", "Are you absolutely certain?", 
            "This could be a mistake!", "Have a heart!", "Don't be so cold!", 
            "Change of heart?", "Wouldn't you reconsider?", 
            "Is that your final answer?", "You're breaking my heart ;("
        ];
        let messageIndex = 0;

        noBtn.addEventListener('click', () => {
            noBtn.textContent = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
            const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize);
            yesBtn.style.fontSize = `${currentSize * 1.5}px`;
        });

        let moveCount = 0;
        const originalParent = noBtn.parentNode;

        const moveButton = (e) => {
            if (e && e.type === 'touchstart') e.preventDefault();

            // Use clientWidth/Height to exclude scrollbars and ensure button stays visible
            const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
            const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
            
            // If button is still in the flow, move it to body to allow free movement
            if (noBtn.parentNode !== document.body) {
                const rect = noBtn.getBoundingClientRect();
                
                noBtn.style.position = 'fixed';
                noBtn.style.left = rect.left + 'px';
                noBtn.style.top = rect.top + 'px';
                noBtn.style.width = rect.width + 'px'; // Keep size consistent
                
                document.body.appendChild(noBtn);
            }

            const rect = noBtn.getBoundingClientRect();
            // Calculate safe boundaries (keep 20px padding from all edges)
            const maxLeft = viewportWidth - rect.width - 20;
            const maxTop = viewportHeight - rect.height - 20;

            moveCount++;
            let newLeft, newTop;
            
            if (moveCount <= 5) {
                // Short distance random movement
                const angle = Math.random() * 2 * Math.PI;
                const distance = 100 + (moveCount * 20); // 100px to 200px
                
                newLeft = rect.left + Math.cos(angle) * distance;
                newTop = rect.top + Math.sin(angle) * distance;

                // Clamp to screen boundaries
                newLeft = Math.max(20, Math.min(newLeft, maxLeft));
                newTop = Math.max(20, Math.min(newTop, maxTop));

                noBtn.style.transition = "left 0.5s ease, top 0.5s ease";
            } else {
                // Fast random movement towards lower left side
                newLeft = Math.random() * (maxLeft / 2);
                newTop = (maxTop / 2) + (Math.random() * (maxTop / 2));

                noBtn.style.transition = "left 0.2s ease, top 0.2s ease";
            }
            
            noBtn.style.left = newLeft + 'px';
            noBtn.style.top = newTop + 'px';
        };

        noBtn.addEventListener('mouseover', moveButton);
        noBtn.addEventListener('touchstart', moveButton, { passive: false });

        let mouseStopTimeout;
        const resetBtnPosition = () => {
            clearTimeout(mouseStopTimeout);
            if (noBtn.parentNode === document.body) {
                mouseStopTimeout = setTimeout(() => {
                    noBtn.style.position = '';
                    noBtn.style.left = '';
                    noBtn.style.top = '';
                    noBtn.style.width = '';
                    noBtn.style.transition = '';
                    originalParent.appendChild(noBtn);
                    moveCount = 0;
                }, 2000);
            }
        };

        document.addEventListener('mousemove', resetBtnPosition);
        document.addEventListener('touchstart', resetBtnPosition);

        yesBtn.addEventListener('click', () => {
            if (pageDay === 7) {
                createRosePetals();
            } else if (pageDay === 14) {
                window.location.href = 'yes_page.html?final=true';
            } else {
                window.location.href = `day${pageDay + 1}.html`;
            }
        });
    }

    function createRosePetals() {
        const petalCount = 1000;
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.classList.add('rose-petal');
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.animation = `fall ${Math.random() * 2 + 3}s linear forwards`;
            petal.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(petal);
        }

        // Wait for animation to fill screen (4s) + 0.5s pause -> Redirect
        setTimeout(() => {
            window.location.href = 'day8.html';
        }, 4500);
    }

    // Secret Admin Login
    const secretHeart = document.getElementById('secret-heart');
    if (secretHeart) {
        // Ensure it's clickable and above other elements
        secretHeart.style.position = 'relative';
        secretHeart.style.zIndex = '10000';

        secretHeart.addEventListener('click', () => {
            const password = prompt("Enter Admin Password:");
            if (password === "admin123") {
                window.location.href = "admin.html";
            } else if (password !== null) {
                alert("Incorrect password!");
            }
        });
    }

    // Background Music Playlist
    if (pageDay === 8) {
        const musicWidget = document.createElement('div');
        musicWidget.classList.add('music-widget');
        musicWidget.innerHTML = `
            <iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4wta20PHgwo?utm_source=generator" width="100%" height="80" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        `;
        document.body.appendChild(musicWidget);
    }

    if (pageDay === 9) {
        const musicWidget = document.createElement('div');
        musicWidget.classList.add('music-widget');
        musicWidget.innerHTML = `
            <iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/6BQWmYuo5aO5och7iUg6Oj?utm_source=generator" width="100%" height="80" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        `;
        document.body.appendChild(musicWidget);
    }

    // Day 11: Colorful Shooting Stars
    if (pageDay === 11) {
        const starContainer = document.createElement('div');
        starContainer.style.position = 'fixed';
        starContainer.style.inset = '0';
        starContainer.style.pointerEvents = 'none';
        starContainer.style.zIndex = '0';
        document.body.appendChild(starContainer);

        const colors = ['#ff00cc', '#3333ff', '#00ccff', '#ffff00', '#ff3333', '#00ff00'];

        setInterval(() => {
            const star = document.createElement('div');
            star.classList.add('shooting-star');
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            star.style.setProperty('--star-color', color);
            
            // Start from top-right area
            star.style.left = (Math.random() * 100 + 20) + 'vw';
            star.style.top = (Math.random() * 50 - 40) + 'vh';
            star.style.animationDuration = (Math.random() * 1 + 1.5) + 's';

            starContainer.appendChild(star);
            setTimeout(() => star.remove(), 3000);
        }, 200);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
